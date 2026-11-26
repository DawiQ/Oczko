// Wi‑Fi tables: your name at the table and your results there (kept apart
// from the games against the computer): oczko.lanStats.v1.
import { cleanName } from "../lan/protocol";
import { readJSON, writeJSON, type KV } from "./kv";

export const LAN_STATS_KEY = "oczko.lanStats.v1";

export interface LanStats {
  v: 1;
  name: string;
  rounds: number;
  roundsWon: number;
  matches: number;
  matchesWon: number;
}

export const emptyLanStats = (): LanStats => ({ v: 1, name: "", rounds: 0, roundsWon: 0, matches: 0, matchesWon: 0 });

const isCount = (x: unknown) => typeof x === "number" && Number.isInteger(x) && x >= 0;

export function looksLikeLanStats(x: unknown): x is LanStats {
  const o = x as LanStats;
  return typeof x === "object" && x !== null && o.v === 1 && typeof o.name === "string" && [o.rounds, o.roundsWon, o.matches, o.matchesWon].every(isCount);
}

export const loadLanStats = async (kv: KV): Promise<LanStats> => (await readJSON(kv, LAN_STATS_KEY, looksLikeLanStats)) ?? emptyLanStats();
export const saveLanStats = (kv: KV, s: LanStats) => writeJSON(kv, LAN_STATS_KEY, { ...s, name: s.name ? cleanName(s.name) : "" });

/** A finished round at a Wi‑Fi table, from your seat. */
export function addLanRound(s: LanStats, won: boolean, matchOver: boolean, matchWon: boolean): LanStats {
  return {
    ...s,
    rounds: s.rounds + 1,
    roundsWon: s.roundsWon + (won ? 1 : 0),
    matches: s.matches + (matchOver ? 1 : 0),
    matchesWon: s.matchesWon + (matchOver && matchWon ? 1 : 0),
  };
}
