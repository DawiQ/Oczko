// Ranks (by experience points) and badges. Pure; thresholds here, names and
// descriptions in the dictionary.
import type { MatchState } from "../engine/match";
import { pl, type Strings } from "../i18n/pl";
import { handValue } from "../engine/score";
import type { Stats } from "../storage/stats";

/** Experience points of each rank, weakest first. */
const RANK_AT = [0, 50, 150, 350, 700, 1200, 2000];

/** Ranks named after cards (gender-neutral), weakest first. */
export const ranks = (s: Strings = pl): { name: string; at: number }[] => RANK_AT.map((at, i) => ({ name: s.profile.ranks[i], at }));
/** The ranks with Polish names (`ranks(s)` for the language in use). */
export const RANKS = ranks();

export const XP = { round: 1, roundWon: 2, matchWon: 10, badge: 15 } as const;

export type BadgeId = "persian" | "exact21" | "fiveCard" | "edge" | "ironBank" | "streak" | "veteran";

export interface Badge {
  id: BadgeId;
  name: string;
  desc: string;
  icon: string;
}

const BADGE_ICONS: { id: BadgeId; icon: string }[] = [
  { id: "persian", icon: "AA" },
  { id: "exact21", icon: "21" },
  { id: "fiveCard", icon: "5×" },
  { id: "edge", icon: "17+" },
  { id: "ironBank", icon: "B" },
  { id: "streak", icon: "×5" },
  { id: "veteran", icon: "100" },
];

/** The badges in display order, with names and descriptions. */
export const badges = (s: Strings = pl): Badge[] => BADGE_ICONS.map((b) => ({ ...b, ...s.profile.badges[b.id] }));
/** The badges with Polish texts (`badges(s)` for the language in use). */
export const BADGES = badges();

export const STREAK_BADGE = 5;
export const VETERAN_BADGE = 100;

/** Badges a finished round earns (only those not readable from the counters). */
export function roundBadges(m: MatchState, me: number): BadgeId[] {
  const r = m.round;
  if (!r.result) return [];
  const out: BadgeId[] = [];
  const hand = r.hands[me];
  const v = handValue(hand, m.rules);
  const won = r.result.points[me] > 0;
  if (!v.persian && !v.bust && v.total === 21 && hand.length >= 5) out.push("fiveCard");
  if (won && !v.persian && v.total === 21 && hand.length > m.rules.startCards && handValue(hand.slice(0, -1), m.rules).total >= 17) out.push("edge");
  if (r.bank === me && r.result.duels && r.result.duels.length >= 2 && r.result.duels.every((d) => d.winner === "bank")) out.push("ironBank");
  return out;
}

/** Badges a round shows, counters included (for "Nowa odznaka" at the table). */
export function badgesShownBy(m: MatchState, me: number): BadgeId[] {
  const r = m.round;
  if (!r.result) return [];
  const v = handValue(r.hands[me], m.rules);
  const out = roundBadges(m, me);
  if (v.persian) out.push("persian");
  if (!v.persian && !v.bust && v.total === 21) out.push("exact21");
  return out;
}

/** Every badge earned so far. */
export function earnedBadges(s: Stats): BadgeId[] {
  const set = new Set<BadgeId>(s.badges);
  if (s.persians > 0) set.add("persian");
  if (s.twentyOnes > 0) set.add("exact21");
  if (s.bestStreak >= STREAK_BADGE) set.add("streak");
  if (s.matches >= VETERAN_BADGE) set.add("veteran");
  return BADGE_ICONS.map((b) => b.id).filter((id) => set.has(id));
}

export function xpOf(s: Stats): number {
  return s.rounds * XP.round + s.roundsWon * XP.roundWon + s.matchesWon * XP.matchWon + earnedBadges(s).length * XP.badge;
}

export interface RankInfo {
  xp: number;
  index: number;
  name: string;
  next: { name: string; at: number } | null;
  /** Progress towards the next rank (0..1; 1 at the top). */
  progress: number;
}

export function rankOf(s: Stats, str: Strings = pl): RankInfo {
  const all = ranks(str);
  const xp = xpOf(s);
  let index = 0;
  for (let i = 0; i < all.length; i++) if (xp >= all[i].at) index = i;
  const next = all[index + 1] ?? null;
  const from = all[index].at;
  return { xp, index, name: all[index].name, next, progress: next ? (xp - from) / (next.at - from) : 1 };
}

/** Rounds-won share, furas share, average total on "Starczy". */
export function ratios(s: Stats): { winRounds: number; winMatches: number; bust: number; standAvg: number } {
  const q = (a: number, b: number) => (b > 0 ? a / b : 0);
  return { winRounds: q(s.roundsWon, s.rounds), winMatches: q(s.matchesWon, s.matches), bust: q(s.busts, s.rounds), standAvg: q(s.standTotal, s.stands) };
}
