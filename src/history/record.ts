// A finished match in the history: enough to replay it move by move (the
// seed, the rules, the seats and every decision). Pure.
import { matchApply, newMatch, nextRound, type MatchState } from "../engine/match";
import type { Action, RoundEvent } from "../engine/round";
import { ENGINE_VERSION } from "../engine/version";
import type { Decision, RoundEndInfo } from "../game/GameController";
import { looksLikeSetup, type GameSetup } from "../game/setup";
import type { Grade } from "./analysis";

export interface HistoryRecord {
  v: 1;
  /** A replay is only possible on the same engine version. */
  engineVersion: number;
  id: string;
  /** ms since the epoch. */
  date: number;
  setup: GameSetup;
  me: number;
  decisions: Decision[];
  scores: number[];
  winner: number | null;
  rounds: number;
  /** My decisions graded (index into `decisions`), once analysed. */
  analysis?: { index: number; grade: Grade; standWin: number; hitWin: number }[];
}

export function buildRecord(info: RoundEndInfo, date: number): HistoryRecord {
  return {
    v: 1,
    engineVersion: ENGINE_VERSION,
    id: `${date.toString(36)}-${info.setup.seed.toString(36)}`,
    date,
    setup: info.setup,
    me: info.me,
    decisions: info.allDecisions.slice(),
    scores: info.match.scores.slice(),
    winner: info.match.winner,
    rounds: info.match.roundNo,
  };
}

const isNat = (x: unknown) => Number.isInteger(x) && (x as number) >= 0;

export function looksLikeRecord(x: unknown): x is HistoryRecord {
  if (typeof x !== "object" || x === null) return false;
  const r = x as HistoryRecord;
  if (r.v !== 1 || !isNat(r.engineVersion) || typeof r.id !== "string" || !isNat(r.date) || !looksLikeSetup(r.setup)) return false;
  const n = r.setup.seats.length;
  if (!Number.isInteger(r.me) || r.me < 0 || r.me >= n) return false;
  if (!Array.isArray(r.decisions) || !r.decisions.every((d) => d && isNat(d.round) && Number.isInteger(d.seat) && d.seat >= 0 && d.seat < n && (d.action === "hit" || d.action === "stand")))
    return false;
  if (!Array.isArray(r.scores) || r.scores.length !== n || !r.scores.every(isNat)) return false;
  if (r.winner !== null && !(Number.isInteger(r.winner) && r.winner >= 0 && r.winner < n)) return false;
  if (!isNat(r.rounds)) return false;
  if (r.analysis !== undefined && !Array.isArray(r.analysis)) return false;
  return true;
}

/** One moment of a replay. */
export interface Frame {
  match: MatchState;
  roundNo: number;
  /** The decision that led here (null: the deal). */
  decision: Decision | null;
  /** Index of that decision in the record. */
  index: number | null;
  events: RoundEvent[];
}

export type ReplayError = "engine-version" | "bad-decision";

/** Every state of the match, from the first deal to the last move. */
export function replay(r: HistoryRecord): Frame[] | { error: ReplayError } {
  if (r.engineVersion !== ENGINE_VERSION) return { error: "engine-version" };
  const s = r.setup;
  let m = newMatch(s.rules, s.seats.length, s.seed, s.first);
  const frames: Frame[] = [{ match: m, roundNo: 1, decision: null, index: null, events: m.round.log }];
  for (let i = 0; i < r.decisions.length; i++) {
    const d = r.decisions[i];
    while (d.round > m.roundNo) {
      const n = nextRound(m);
      if ("error" in n) return { error: "bad-decision" };
      m = n;
      frames.push({ match: m, roundNo: m.roundNo, decision: null, index: null, events: m.round.log });
    }
    const res = matchApply(m, d.seat, d.action as Action);
    if ("error" in res) return { error: "bad-decision" };
    m = res.state;
    frames.push({ match: m, roundNo: m.roundNo, decision: d, index: i, events: res.events });
  }
  return frames;
}

/** The final state of a replay must match what was recorded. */
export function replayMatches(r: HistoryRecord): boolean {
  const f = replay(r);
  if ("error" in f) return false;
  const end = f[f.length - 1].match;
  return end.scores.join() === r.scores.join() && end.winner === r.winner && end.roundNo === r.rounds;
}
