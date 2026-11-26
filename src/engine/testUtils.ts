// Helpers for the engine's tests (cards by name, a stock that deals given hands).
import { cardOf, makeDeck, type Card } from "./cards";
import { rngInt, type Rng } from "./rng";
import { apply, legal, playOrder, type RoundState } from "./round";
import type { Rules } from "./rules";

const RANKS: Record<string, number> = { W: 11, D: 12, K: 13, A: 14 };
const SUITS: Record<string, number> = { "♥": 0, "♦": 1, "♣": 2, "♠": 3, h: 0, d: 1, c: 2, s: 3 };

/** "10♥", "A♠", "Ds" → a card. */
export function c(name: string): Card {
  const suit = SUITS[name.slice(-1)];
  const r = name.slice(0, -1);
  const rank = RANKS[r] ?? Number(r);
  if (suit === undefined || !(rank >= 2 && rank <= 14)) throw new Error(`bad card ${name}`);
  return cardOf(rank, suit);
}

/** "A♠ 10♥" → cards. */
export const cards = (names: string): Card[] => (names.trim() ? names.trim().split(/\s+/).map(c) : []);

/**
 * A stock that deals `hands[seat]` (startCards each, round-robin in play
 * order), then gives `draws` in order, then the rest of the deck.
 */
export function stockFor(
  rules: Rules,
  hands: string[],
  draws = "",
  dealer = 0,
  bank: number | null = null
): Card[] {
  const order = playOrder(hands.length, dealer, bank);
  const dealt = hands.map(cards);
  const top: Card[] = [];
  for (let k = 0; k < rules.startCards; k++) for (const seat of order) top.push(dealt[seat][k]);
  top.push(...cards(draws));
  if (new Set(top).size !== top.length) throw new Error("duplicate cards in the test stock");
  const rest = makeDeck(rules.deck).filter((x) => !top.includes(x));
  if (rest.length + top.length !== rules.deck) throw new Error("a test card is not in the deck");
  return [...top, ...rest];
}

/** Plays random legal moves to the end of the round; returns every state. */
export function playRandom(s: RoundState, rng: Rng): { states: RoundState[]; rng: Rng } {
  const states = [s];
  let r = rng;
  while (s.turn !== null) {
    const moves = legal(s);
    let i: number;
    [i, r] = rngInt(r, moves.length);
    const res = apply(s, s.turn, moves[i]);
    if ("error" in res) throw new Error(res.error);
    s = res.state;
    states.push(s);
  }
  return { states, rng: r };
}

/** Freezes an object graph (to prove a function does not mutate it). */
export function deepFreeze<T>(x: T): T {
  if (x && typeof x === "object" && !Object.isFrozen(x)) {
    Object.freeze(x);
    for (const v of Object.values(x as object)) deepFreeze(v);
  }
  return x;
}
