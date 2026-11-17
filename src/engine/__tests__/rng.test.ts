import { makeDeck } from "../cards";
import { makeRng, rngInt, rngNext, roundSeed, shuffle, splitmix32 } from "../rng";

describe("rng", () => {
  it("is deterministic and pure", () => {
    const r = makeRng(42);
    const [a, r1] = rngNext(r);
    const [b] = rngNext(r);
    expect(a).toBe(b);
    expect(r).toEqual({ state: 42 });
    expect(rngNext(r1)[0]).not.toBe(a);
  });

  it("gives floats in [0, 1) and ints in [0, n)", () => {
    let r = makeRng(7);
    for (let i = 0; i < 10000; i++) {
      let x: number;
      [x, r] = rngNext(r);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      let k: number;
      [k, r] = rngInt(r, 6);
      expect(Number.isInteger(k) && k >= 0 && k < 6).toBe(true);
    }
  });

  it("shuffles into a permutation, the same for the same seed", () => {
    const deck = makeDeck(52);
    const a = shuffle(deck, 123);
    expect(a.slice().sort((x, y) => x - y)).toEqual(deck);
    expect(shuffle(deck, 123)).toEqual(a);
    expect(shuffle(deck, 124)).not.toEqual(a);
    expect(deck).toEqual(makeDeck(52)); // input untouched
  });

  it("shuffles uniformly (every card about equally often on top)", () => {
    const deck = makeDeck(24);
    const top = new Array(52).fill(0);
    const N = 24000;
    for (let s = 0; s < N; s++) top[shuffle(deck, splitmix32(s))[0]]++;
    const expected = N / 24;
    // chi-square with 23 degrees of freedom: 99.9th percentile ≈ 49.7
    const chi = deck.reduce((sum, card) => sum + (top[card] - expected) ** 2 / expected, 0);
    expect(chi).toBeLessThan(49.7);
  });

  it("gives every round of a match its own seed", () => {
    const seeds = new Set<number>();
    for (let base = 0; base < 50; base++) for (let round = 1; round <= 40; round++) seeds.add(roundSeed(base, round));
    expect(seeds.size).toBe(50 * 40);
    expect(roundSeed(5, 3)).toBe(roundSeed(5, 3));
  });
});
