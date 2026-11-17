// Ranks (by experience points) and badges. Pure; thresholds here.
import type { MatchState } from "../engine/match";
import { handValue } from "../engine/score";
import type { Stats } from "../storage/stats";

/** Ranks named after cards (gender-neutral), weakest first. */
export const RANKS: { name: string; at: number }[] = [
  { name: "Dziewiątka", at: 0 },
  { name: "Dziesiątka", at: 50 },
  { name: "Walet", at: 150 },
  { name: "Dama", at: 350 },
  { name: "Król", at: 700 },
  { name: "As", at: 1200 },
  { name: "Perskie oczko", at: 2000 },
];

export const XP = { round: 1, roundWon: 2, matchWon: 10, badge: 15 } as const;

export type BadgeId = "persian" | "exact21" | "fiveCard" | "edge" | "ironBank" | "streak" | "veteran";

export const BADGES: { id: BadgeId; name: string; desc: string; icon: string }[] = [
  { id: "persian", name: "Perskie oczko", desc: "Dwa asy w jednej ręce", icon: "AA" },
  { id: "exact21", name: "Równe 21", desc: "Runda zakończona z 21", icon: "21" },
  { id: "fiveCard", name: "Oczko z pięciu kart", desc: "21 z pięciu lub więcej kart", icon: "5×" },
  { id: "edge", name: "Na krawędzi", desc: "Wygrana z 21 po dobraniu przy 17 lub więcej", icon: "17+" },
  { id: "ironBank", name: "Żelazny bank", desc: "Bank wygrywa wszystkie pojedynki (2+ graczy)", icon: "B" },
  { id: "streak", name: "Seria", desc: "5 wygranych rund z rzędu", icon: "×5" },
  { id: "veteran", name: "Weteran", desc: "100 rozegranych partii", icon: "100" },
];

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

/** Every badge earned so far. */
export function earnedBadges(s: Stats): BadgeId[] {
  const set = new Set<BadgeId>(s.badges);
  if (s.persians > 0) set.add("persian");
  if (s.twentyOnes > 0) set.add("exact21");
  if (s.bestStreak >= STREAK_BADGE) set.add("streak");
  if (s.matches >= VETERAN_BADGE) set.add("veteran");
  return BADGES.map((b) => b.id).filter((id) => set.has(id));
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

export function rankOf(s: Stats): RankInfo {
  const xp = xpOf(s);
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].at) index = i;
  const next = RANKS[index + 1] ?? null;
  const from = RANKS[index].at;
  return { xp, index, name: RANKS[index].name, next, progress: next ? (xp - from) / (next.at - from) : 1 };
}

/** Rounds-won share, furas share, average total on "Starczy". */
export function ratios(s: Stats): { winRounds: number; winMatches: number; bust: number; standAvg: number } {
  const q = (a: number, b: number) => (b > 0 ? a / b : 0);
  return { winRounds: q(s.roundsWon, s.rounds), winMatches: q(s.matchesWon, s.matches), bust: q(s.busts, s.rounds), standAvg: q(s.standTotal, s.stands) };
}
