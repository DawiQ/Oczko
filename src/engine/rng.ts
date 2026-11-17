// Seeded randomness (the engine's only source of chance). Pure: the state is a
// plain number, every step returns the next state.

/** Serialisable generator state (mulberry32). */
export interface Rng {
  state: number;
}

export const makeRng = (seed: number): Rng => ({ state: seed >>> 0 });

/** One step of mulberry32: a float in [0, 1) and the next state. */
export function rngNext(r: Rng): [number, Rng] {
  const state = (r.state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, { state }];
}

/** An integer in [0, n) and the next state. */
export function rngInt(r: Rng, n: number): [number, Rng] {
  const [x, next] = rngNext(r);
  return [Math.floor(x * n), next];
}

/** splitmix32 finaliser: spreads nearby inputs over the whole 32-bit range. */
export function splitmix32(x: number): number {
  let z = (x + 0x9e3779b9) >>> 0;
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
  return (z ^ (z >>> 16)) >>> 0;
}

/** The seed of a match's round: independent-looking for consecutive rounds. */
export function roundSeed(seedBase: number, roundNo: number): number {
  return splitmix32((splitmix32(seedBase >>> 0) ^ splitmix32((roundNo >>> 0) + 0x632be5ab)) >>> 0);
}

/** Fisher–Yates shuffle of a copy, driven by the seed. */
export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const a = items.slice();
  let r = makeRng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    let j: number;
    [j, r] = rngInt(r, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
