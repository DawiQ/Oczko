// Your results (oczko.stats.v1): pure reducers + storage. The profile
// (ranks, badges) is built on top of these numbers.
import type { MatchState } from "../engine/match";
import { handValue } from "../engine/score";
import { readJSON, writeJSON, type KV } from "./kv";

export const STATS_KEY = "oczko.stats.v1";

export interface ModeStats {
  rounds: number;
  roundsWon: number;
  matches: number;
  matchesWon: number;
}

export interface Stats {
  v: 1;
  rounds: number;
  roundsWon: number;
  /** Rounds ended over 21. */
  busts: number;
  persians: number;
  /** Rounds ended on exactly 21. */
  twentyOnes: number;
  /** "Starczy" (or the card limit) without a fura: how many and the sum of totals. */
  stands: number;
  standTotal: number;
  matches: number;
  matchesWon: number;
  /** Rounds won in a row now, and the best run. */
  streak: number;
  bestStreak: number;
  byMode: { family: ModeStats; bank: ModeStats };
  /** Matches against a character (by persona id) and how many you won. */
  byPersona: Record<string, { matches: number; won: number }>;
}

const emptyMode = (): ModeStats => ({ rounds: 0, roundsWon: 0, matches: 0, matchesWon: 0 });

export const emptyStats = (): Stats => ({
  v: 1,
  rounds: 0,
  roundsWon: 0,
  busts: 0,
  persians: 0,
  twentyOnes: 0,
  stands: 0,
  standTotal: 0,
  matches: 0,
  matchesWon: 0,
  streak: 0,
  bestStreak: 0,
  byMode: { family: emptyMode(), bank: emptyMode() },
  byPersona: {},
});

const nat = (x: unknown) => Number.isInteger(x) && (x as number) >= 0;
const looksLikeMode = (x: unknown): x is ModeStats =>
  typeof x === "object" && x !== null && ["rounds", "roundsWon", "matches", "matchesWon"].every((k) => nat((x as Record<string, unknown>)[k]));

export function looksLikeStats(x: unknown): x is Stats {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Stats;
  const counts = ["rounds", "roundsWon", "busts", "persians", "twentyOnes", "stands", "standTotal", "matches", "matchesWon", "streak", "bestStreak"] as const;
  if (s.v !== 1 || !counts.every((k) => nat(s[k]))) return false;
  if (typeof s.byMode !== "object" || s.byMode === null || !looksLikeMode(s.byMode.family) || !looksLikeMode(s.byMode.bank)) return false;
  if (typeof s.byPersona !== "object" || s.byPersona === null || Array.isArray(s.byPersona)) return false;
  return Object.values(s.byPersona).every((p) => p && nat(p.matches) && nat(p.won));
}

/** A finished round (the match right after it) from seat `me`. */
export function recordRound(s: Stats, m: MatchState, me: number): Stats {
  const r = m.round;
  if (!r.result) return s;
  const v = handValue(r.hands[me], m.rules);
  const won = r.result.points[me] > 0;
  const mode = m.rules.mode;
  const stood = !v.bust && (r.status[me] === "stood" || r.status[me] === "maxed");
  const streak = won ? s.streak + 1 : 0;
  return {
    ...s,
    rounds: s.rounds + 1,
    roundsWon: s.roundsWon + (won ? 1 : 0),
    busts: s.busts + (v.bust ? 1 : 0),
    persians: s.persians + (v.persian ? 1 : 0),
    twentyOnes: s.twentyOnes + (!v.persian && v.total === 21 ? 1 : 0),
    stands: s.stands + (stood && !v.persian ? 1 : 0),
    standTotal: s.standTotal + (stood && !v.persian ? v.total : 0),
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    byMode: { ...s.byMode, [mode]: { ...s.byMode[mode], rounds: s.byMode[mode].rounds + 1, roundsWon: s.byMode[mode].roundsWon + (won ? 1 : 0) } },
  };
}

/** A finished match: who won, against which characters. */
export function recordMatch(s: Stats, m: MatchState, me: number, personas: readonly string[]): Stats {
  if (m.winner === null) return s;
  const won = m.winner === me;
  const mode = m.rules.mode;
  const byPersona = { ...s.byPersona };
  for (const id of new Set(personas)) {
    const p = byPersona[id] ?? { matches: 0, won: 0 };
    byPersona[id] = { matches: p.matches + 1, won: p.won + (won ? 1 : 0) };
  }
  return {
    ...s,
    matches: s.matches + 1,
    matchesWon: s.matchesWon + (won ? 1 : 0),
    byMode: { ...s.byMode, [mode]: { ...s.byMode[mode], matches: s.byMode[mode].matches + 1, matchesWon: s.byMode[mode].matchesWon + (won ? 1 : 0) } },
    byPersona,
  };
}

export const loadStats = async (kv: KV): Promise<Stats> => (await readJSON(kv, STATS_KEY, looksLikeStats)) ?? emptyStats();
export const saveStats = (kv: KV, s: Stats) => writeJSON(kv, STATS_KEY, s);

// Read-modify-write in order: two quick updates never lose one another.
let chain: Promise<unknown> = Promise.resolve();
export function updateStats(kv: KV, f: (s: Stats) => Stats): Promise<Stats> {
  const next = chain.then(async () => {
    const s = f(await loadStats(kv));
    await saveStats(kv, s);
    return s;
  });
  chain = next.catch(() => {});
  return next;
}
