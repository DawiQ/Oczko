import { matchApply, newMatch, nextRound, rotation, winnerOf, type MatchState } from "../match";
import { makeRng, rngInt, type Rng } from "../rng";
import { dealRound, legal, type Action } from "../round";
import { DEFAULT_RULES, PRESETS, type Rules } from "../rules";
import { stockFor } from "../testUtils";

const family = DEFAULT_RULES;
const bank = PRESETS.bank;

function step(m: MatchState, a: Action): MatchState {
  const r = matchApply(m, m.round.turn!, a);
  if ("error" in r) throw new Error(r.error);
  return r.state;
}

function next(m: MatchState): MatchState {
  const r = nextRound(m);
  if ("error" in r) throw new Error(r.error);
  return r;
}

/** Random moves to the end of the round. */
function playRound(m: MatchState, rng: Rng): [MatchState, Rng] {
  let r = rng;
  while (m.round.turn !== null) {
    const moves = legal(m.round);
    let i: number;
    [i, r] = rngInt(r, moves.length);
    m = step(m, moves[i]);
  }
  return [m, r];
}

/** Random moves to the end of the match; every round's state. */
function playMatch(m: MatchState, rng: Rng): MatchState[] {
  const rounds: MatchState[] = [];
  let r = rng;
  for (;;) {
    [m, r] = playRound(m, r);
    rounds.push(m);
    if (m.winner !== null) return rounds;
    m = next(m);
  }
}

describe("winnerOf", () => {
  it.each([
    [[3, 9, 2], 10, null],
    [[3, 10, 2], 10, 1],
    [[11, 10, 2], 10, 0],
    [[10, 10, 2], 10, null],
    [[12, 12, 13], 10, 2],
  ])("%j to %i → %p", (scores, target, winner) => {
    expect(winnerOf(scores, target)).toBe(winner);
  });
});

describe("match", () => {
  it("starts with the first dealer, no points and round 1", () => {
    const m = newMatch(family, 4, 7, 2);
    expect(m).toMatchObject({ v: 1, seats: 4, scores: [0, 0, 0, 0], roundNo: 1, dealer: 2, bank: null, winner: null });
    expect(m.round.order).toEqual([3, 0, 1, 2]);
    const b = newMatch(bank, 3, 7, 1);
    expect(b.bank).toBe(1);
    expect(b.dealer).toBe(1);
  });

  it("adds each round's points once and rotates the dealer", () => {
    let m = newMatch(family, 3, 11);
    let rng = makeRng(1);
    let expected = [0, 0, 0];
    for (let round = 1; round <= 6; round++) {
      expect(m.roundNo).toBe(round);
      expect(m.dealer).toBe((round - 1) % 3);
      [m, rng] = playRound(m, rng);
      expected = expected.map((s, i) => s + m.round.result!.points[i]);
      expect(m.scores).toEqual(expected);
      if (m.winner !== null) break;
      m = next(m);
    }
  });

  it("refuses the next round before the end, and anything after the match", () => {
    const m = newMatch({ ...family, target: 1 }, 2, 3);
    expect(nextRound(m)).toEqual({ error: "round-not-over" });
    const rounds = playMatch(m, makeRng(4));
    const end = rounds[rounds.length - 1];
    expect(end.winner).not.toBeNull();
    expect(nextRound(end)).toEqual({ error: "match-over" });
    expect(matchApply(end, 0, "stand")).toEqual({ error: "match-over" });
  });

  it("ends only with a unique leader at the target", () => {
    for (let seed = 0; seed < 60; seed++) {
      const rules: Rules = seed % 2 ? { ...bank, target: 5 } : { ...family, target: 5 };
      const rounds = playMatch(newMatch(rules, 2 + (seed % 4), seed), makeRng(seed));
      const end = rounds[rounds.length - 1];
      const w = end.winner!;
      expect(end.scores[w]).toBeGreaterThanOrEqual(5);
      expect(end.scores.filter((s) => s === end.scores[w])).toHaveLength(1);
      for (const r of rounds.slice(0, -1)) expect(winnerOf(r.scores, 5)).toBeNull();
    }
  });

  it("plays on after a tie at the top (extra round)", () => {
    const start = newMatch(family, 3, 1);
    const round = dealRound(family, 3, stockFor(family, ["10♥", "10♣", "2♠"], "9♥ 9♣"), 0, null);
    let m: MatchState = { ...start, scores: [9, 9, 0], round };
    m = step(m, "hit"); // seat 1: 19
    m = step(m, "stand");
    m = step(m, "stand"); // seat 2: 2
    m = step(m, "hit"); // seat 0: 19
    m = step(m, "stand");
    expect(m.round.result!.points).toEqual([1, 1, 0]);
    expect(m.scores).toEqual([10, 10, 0]);
    expect(m.winner).toBeNull();
    expect(next(m).roundNo).toBe(2);
  });

  it("is deterministic for the same seed and decisions", () => {
    const a = playMatch(newMatch(bank, 4, 99), makeRng(5));
    const b = playMatch(newMatch(bank, 4, 99), makeRng(5));
    expect(b).toEqual(a);
    const c = playMatch(newMatch(bank, 4, 100), makeRng(5));
    expect(c[0].round.hands).not.toEqual(a[0].round.hands);
  });
});

describe("bank rotation", () => {
  /** A finished bank round: bank 0, seat 1 has `p1`, seat 2 has `p2`, the bank `b`. */
  function finished(rules: Rules, b: string, p1: string, p2: string): MatchState {
    const r: Rules = { ...rules, startCards: 2 };
    const start = newMatch(r, 3, 1, 0);
    let m: MatchState = { ...start, round: dealRound(r, 3, stockFor(r, [b, p1, p2], "", 0, 0), 0, 0) };
    while (m.round.turn !== null) m = step(m, "stand");
    return m;
  }

  it("every round: the next seat", () => {
    let m = newMatch(bank, 3, 5, 0);
    let rng = makeRng(2);
    for (let i = 0; i < 5; i++) {
      expect(m.bank).toBe(i % 3);
      expect(m.dealer).toBe(m.bank);
      expect(m.round.order[m.round.order.length - 1]).toBe(m.bank);
      [m, rng] = playRound(m, rng);
      if (m.winner !== null) break;
      m = next(m);
    }
  });

  it("on perskie oczko: to the player who had it", () => {
    const rules: Rules = { ...bank, bankRotation: "onPersian" };
    expect(rotation(finished(rules, "10♥ 8♥", "A♥ A♠", "9♣ 9♦"))).toEqual({ dealer: 1, bank: 1 });
    // the first in play order when several have it
    expect(rotation(finished(rules, "10♥ 8♥", "A♥ A♠", "A♣ A♦"))).toEqual({ dealer: 1, bank: 1 });
    // the bank's own perskie keeps it
    expect(rotation(finished(rules, "A♣ A♦", "A♥ A♠", "9♣ 9♦"))).toEqual({ dealer: 0, bank: 0 });
    // nobody: stays
    expect(rotation(finished(rules, "10♥ 8♥", "10♣ 9♣", "8♣ 9♦"))).toEqual({ dealer: 0, bank: 0 });
  });

  it("fixed: never moves", () => {
    const rules: Rules = { ...bank, bankRotation: "fixed" };
    expect(rotation(finished(rules, "10♥ 8♥", "A♥ A♠", "9♣ 9♦"))).toEqual({ dealer: 0, bank: 0 });
  });

  it("family: the dealer moves on", () => {
    expect(rotation(newMatch(family, 4, 1, 3))).toEqual({ dealer: 0, bank: null });
  });
});

describe("a round decided in the deal", () => {
  it("counts its points when the match starts or moves on", () => {
    // A seed where the first round ends at once: the only player is dealt two
    // aces without the perskie rule (fura), so the bank does not play.
    const rules: Rules = { ...bank, startCards: 2, persian: "off", target: 50 };
    let found: MatchState | null = null;
    for (let seed = 0; seed < 20000 && !found; seed++) {
      const m = newMatch(rules, 2, seed);
      if (m.round.result) found = m;
    }
    expect(found).not.toBeNull();
    expect(found!.scores).toEqual(found!.round.result!.points);
  });
});
