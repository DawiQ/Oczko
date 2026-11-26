// A match: rounds until someone reaches the target, with the dealer and the
// bank rotating. Pure, like the round.
import { roundSeed } from "./rng";
import { apply, newRound, type Action, type RoundError, type RoundEvent, type RoundState } from "./round";
import type { Rules } from "./rules";

export interface MatchState {
  v: 1;
  rules: Rules;
  seats: number;
  scores: number[];
  round: RoundState;
  /** 1-based. */
  roundNo: number;
  dealer: number;
  bank: number | null;
  seedBase: number;
  /** The seat that won the match (a unique leader at the target after a full round). */
  winner: number | null;
}

export type MatchError = RoundError | "match-over" | "round-not-over";

/** The unique leader with at least `target` points, else null (a tie at the top plays on). */
export function winnerOf(scores: readonly number[], target: number): number | null {
  const best = Math.max(...scores);
  if (best < target) return null;
  const leaders = scores.flatMap((s, i) => (s === best ? [i] : []));
  return leaders.length === 1 ? leaders[0] : null;
}

/** Points of a finished round added (called once, when the round ends). */
function absorb(m: MatchState): MatchState {
  const result = m.round.result;
  if (!result) return m;
  const scores = m.scores.map((s, i) => s + result.points[i]);
  return { ...m, scores, winner: winnerOf(scores, m.rules.target) };
}

function startRound(m: Omit<MatchState, "round" | "winner">): MatchState {
  const round = newRound(m.rules, m.seats, roundSeed(m.seedBase, m.roundNo), m.dealer, m.bank);
  return absorb({ ...m, round, winner: null });
}

/** A new match; `first` deals the first round (and is the first bank). */
export function newMatch(rules: Rules, seats: number, seedBase: number, first = 0): MatchState {
  return startRound({
    v: 1,
    rules,
    seats,
    scores: Array.from({ length: seats }, () => 0),
    roundNo: 1,
    dealer: first,
    bank: rules.mode === "bank" ? first : null,
    seedBase: seedBase >>> 0,
  });
}

export function matchApply(
  m: MatchState,
  seat: number,
  a: Action
): { state: MatchState; events: RoundEvent[] } | { error: MatchError } {
  if (m.winner !== null) return { error: "match-over" };
  const r = apply(m.round, seat, a);
  if ("error" in r) return r;
  const next = { ...m, round: r.state };
  return { state: r.state.result ? absorb(next) : next, events: r.events };
}

/** Who deals and who is the bank in the next round. */
export function rotation(m: MatchState): { dealer: number; bank: number | null } {
  const { rules, seats } = m;
  if (rules.mode === "family" || m.bank === null) return { dealer: (m.dealer + 1) % seats, bank: null };
  let bank = m.bank;
  if (rules.bankRotation === "everyRound") bank = (bank + 1) % seats;
  else if (rules.bankRotation === "onPersian") {
    const values = m.round.result?.values ?? [];
    if (!values[bank]?.persian) {
      const taker = m.round.order.find((s) => s !== bank && values[s]?.persian);
      if (taker !== undefined) bank = taker;
    }
  }
  return { dealer: bank, bank };
}

export function nextRound(m: MatchState): MatchState | { error: MatchError } {
  if (m.winner !== null) return { error: "match-over" };
  if (!m.round.result) return { error: "round-not-over" };
  const { dealer, bank } = rotation(m);
  const { round: _round, winner: _winner, ...rest } = m;
  return startRound({ ...rest, roundNo: m.roundNo + 1, dealer, bank });
}
