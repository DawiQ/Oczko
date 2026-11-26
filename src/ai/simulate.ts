// Bots playing rounds and matches against each other (tournaments, statistics,
// tests). Every bot decides from its own seat's view only.
import { matchApply, newMatch, nextRound, type MatchState } from "../engine/match";
import type { Rng } from "../engine/rng";
import { newRound } from "../engine/round";
import type { Rules } from "../engine/rules";
import { viewFor } from "../engine/view";
import type { Policy } from "./policies";

/** Plays the current round of `m` to its end. */
export function finishRound(m: MatchState, policies: readonly Policy[], rng: Rng): { match: MatchState; rng: Rng; decisions: number } {
  let r = rng;
  let decisions = 0;
  while (m.round.turn !== null) {
    const seat = m.round.turn;
    const d = policies[seat](viewFor(m, seat), r);
    r = d.rng;
    decisions++;
    const res = matchApply(m, seat, d.action);
    if ("error" in res) throw new Error(`bot move refused: ${res.error}`);
    m = res.state;
  }
  return { match: m, rng: r, decisions };
}

/** One round on its own (round 1 of a fresh match with the given seed). */
export function playRound(
  rules: Rules,
  policies: readonly Policy[],
  seed: number,
  dealer: number,
  rng: Rng
): { match: MatchState; rng: Rng; decisions: number } {
  const seats = policies.length;
  const bank = rules.mode === "bank" ? dealer : null;
  const m: MatchState = {
    v: 1,
    rules,
    seats,
    scores: new Array(seats).fill(0),
    round: newRound(rules, seats, seed, dealer, bank),
    roundNo: 1,
    dealer,
    bank,
    seedBase: seed,
    winner: null,
  };
  // A round decided in the deal still needs its points.
  const done = finishRound(m, policies, rng);
  const pts = done.match.round.result!.points;
  return { ...done, match: { ...done.match, scores: pts.slice() } };
}

/** A whole match; returns the final state, the number of rounds and decisions. */
export function playMatch(
  rules: Rules,
  policies: readonly Policy[],
  seedBase: number,
  first: number,
  rng: Rng,
  maxRounds = 1000
): { match: MatchState; rounds: number; decisions: number; rng: Rng } {
  let m = newMatch(rules, policies.length, seedBase, first);
  let r = rng;
  let decisions = 0;
  for (let i = 1; ; i++) {
    const f = finishRound(m, policies, r);
    m = f.match;
    r = f.rng;
    decisions += f.decisions;
    if (m.winner !== null || i >= maxRounds) return { match: m, rounds: i, decisions, rng: r };
    const n = nextRound(m);
    if ("error" in n) throw new Error(n.error);
    m = n;
  }
}
