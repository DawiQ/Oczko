// One round of Oczko: deal, everyone in turn says "Dobieram" (hit) or
// "Starczy" (stand), the hands are shown and the round is settled.
// Pure: `apply` never mutates its input; the same seed and the same decisions
// always give the same course.
import { makeDeck, type Card } from "./cards";
import { shuffle } from "./rng";
import { MAX_SEATS, MIN_SEATS, type Rules } from "./rules";
import { handValue, isPersian } from "./score";

export type Action = "hit" | "stand";
export type SeatStatus = "waiting" | "playing" | "stood" | "bust" | "maxed";

export type RoundEvent =
  | { t: "deal"; seat: number; count: number }
  /** `card` only for the hand's owner (see `eventsFor`). */
  | { t: "hit"; seat: number; card?: Card }
  | { t: "stand"; seat: number }
  | { t: "bust"; seat: number }
  | { t: "persian"; seat: number }
  /** The card limit reached: the hand stops (counts like "Starczy"). */
  | { t: "maxed"; seat: number }
  | { t: "reveal"; seat: number; hand: Card[] }
  | { t: "result"; result: RoundResult };

export interface SeatValue {
  seat: number;
  total: number;
  bust: boolean;
  persian: boolean;
}

export interface Duel {
  /** The player (never the bank). */
  seat: number;
  winner: "player" | "bank" | "none";
}

export interface RoundResult {
  values: SeatValue[];
  /** Points scored in this round, per seat. */
  points: number[];
  /** Bank mode: every player's duel with the bank, by seat. */
  duels?: Duel[];
}

export interface RoundState {
  v: 1;
  rules: Rules;
  seed: number;
  /** Shuffled at the start; index 0 is the top. */
  stock: Card[];
  hands: Card[][];
  status: SeatStatus[];
  /** Order of play (bank last). */
  order: number[];
  /** The seat to move; null before the first move and once the round is over. */
  turn: number | null;
  dealer: number;
  bank: number | null;
  /** Whose cards are face up for everyone. */
  revealed: boolean[];
  log: RoundEvent[];
  result: RoundResult | null;
}

export type RoundError = "round-over" | "not-your-turn" | "illegal-action";

/** From the dealer's left round the table; in bank mode the bank plays last. */
export function playOrder(seats: number, dealer: number, bank: number | null): number[] {
  const order = Array.from({ length: seats }, (_, i) => (dealer + 1 + i) % seats);
  return bank === null ? order : [...order.filter((s) => s !== bank), bank];
}

function checkSetup(rules: Rules, seats: number, dealer: number, bank: number | null): void {
  if (!Number.isInteger(seats) || seats < MIN_SEATS || seats > MAX_SEATS[rules.deck])
    throw new Error(`oczko: ${seats} seats with a deck of ${rules.deck}`);
  if (!Number.isInteger(dealer) || dealer < 0 || dealer >= seats) throw new Error(`oczko: dealer ${dealer}`);
  if (rules.mode === "bank" ? bank === null || !Number.isInteger(bank) || bank < 0 || bank >= seats : bank !== null)
    throw new Error(`oczko: bank ${bank} in ${rules.mode} mode`);
}

/** A new round with the deck shuffled by `seed`. */
export function newRound(rules: Rules, seats: number, seed: number, dealer: number, bank: number | null): RoundState {
  return dealRound(rules, seats, shuffle(makeDeck(rules.deck), seed), dealer, bank, seed);
}

/** A new round dealt from the given stock (top first) — `newRound` and tests. */
export function dealRound(
  rules: Rules,
  seats: number,
  stock: readonly Card[],
  dealer: number,
  bank: number | null,
  seed = 0
): RoundState {
  checkSetup(rules, seats, dealer, bank);
  const d: RoundState = {
    v: 1,
    rules,
    seed,
    stock: stock.slice(),
    hands: Array.from({ length: seats }, () => []),
    status: Array.from({ length: seats }, () => "waiting"),
    order: playOrder(seats, dealer, bank),
    turn: null,
    dealer,
    bank,
    revealed: Array.from({ length: seats }, () => false),
    log: [],
    result: null,
  };
  const ev: RoundEvent[] = [];
  for (let k = 0; k < rules.startCards; k++)
    for (const seat of d.order) {
      const card = d.stock.shift();
      if (card === undefined) throw new Error("oczko: the stock ran out while dealing");
      d.hands[seat].push(card);
    }
  for (const seat of d.order) ev.push({ t: "deal", seat, count: rules.startCards });
  // Two cards dealt can already be perskie oczko (or, without that rule, fura).
  for (const seat of d.order) settleHand(d, seat, ev);
  next(d, ev);
  d.log = ev;
  return d;
}

export function legal(s: RoundState): Action[] {
  if (s.result || s.turn === null) return [];
  return s.stock.length > 0 ? ["hit", "stand"] : ["stand"];
}

export function apply(
  s: RoundState,
  seat: number,
  a: Action
): { state: RoundState; events: RoundEvent[] } | { error: RoundError } {
  if (s.result || s.turn === null) return { error: "round-over" };
  if (seat !== s.turn) return { error: "not-your-turn" };
  if (!legal(s).includes(a)) return { error: "illegal-action" };
  const d: RoundState = {
    ...s,
    stock: s.stock.slice(),
    hands: s.hands.map((h) => h.slice()),
    status: s.status.slice(),
    revealed: s.revealed.slice(),
    log: s.log.slice(),
  };
  const ev: RoundEvent[] = [];
  if (a === "hit") {
    const card = d.stock.shift() as Card;
    d.hands[seat].push(card);
    ev.push({ t: "hit", seat, card });
    settleHand(d, seat, ev);
  } else {
    d.status[seat] = "stood";
    ev.push({ t: "stand", seat });
  }
  if (d.status[seat] !== "playing") next(d, ev);
  d.log.push(...ev);
  return { state: d, events: ev };
}

/** After a card came to a hand: perskie oczko, fura or the card limit end it. */
function settleHand(d: RoundState, seat: number, ev: RoundEvent[]): void {
  const hand = d.hands[seat];
  if (isPersian(hand, d.rules)) {
    d.status[seat] = "stood";
    ev.push({ t: "persian", seat });
    return;
  }
  if (handValue(hand, d.rules).bust) {
    d.status[seat] = "bust";
    ev.push({ t: "bust", seat });
    if (d.rules.bustRevealed) reveal(d, seat, ev);
    return;
  }
  if (d.rules.maxCards !== null && hand.length >= d.rules.maxCards) {
    d.status[seat] = "maxed";
    ev.push({ t: "maxed", seat });
  }
}

function reveal(d: RoundState, seat: number, ev: RoundEvent[]): void {
  if (d.revealed[seat]) return;
  d.revealed[seat] = true;
  ev.push({ t: "reveal", seat, hand: d.hands[seat].slice() });
}

/** Every player's fura is known: the bank has nobody left to play against. */
function allPlayersOut(d: RoundState): boolean {
  return d.order.every((s) => s === d.bank || (d.status[s] === "bust" && d.revealed[s]));
}

/** The next seat to move, or the end of the round. */
function next(d: RoundState, ev: RoundEvent[]): void {
  for (const seat of d.order) {
    if (d.status[seat] !== "waiting") continue;
    if (d.rules.mode === "bank" && seat === d.bank && allPlayersOut(d)) {
      d.status[seat] = "stood"; // the bank does not play
      continue;
    }
    d.status[seat] = "playing";
    d.turn = seat;
    return;
  }
  d.turn = null;
  for (const seat of d.order) reveal(d, seat, ev);
  d.result = scoreRound(d.rules, d.hands, d.bank);
  ev.push({ t: "result", result: d.result });
}

/** Who scores, from the hands at the end of a round (pure; see PLAN.md §4.2). */
export function scoreRound(rules: Rules, hands: readonly (readonly Card[])[], bank: number | null): RoundResult {
  const values: SeatValue[] = hands.map((h, seat) => {
    const v = handValue(h, rules);
    return { seat, total: v.total, bust: v.bust, persian: v.persian };
  });
  const points = hands.map(() => 0);

  if (rules.mode === "family" || bank === null) {
    let winners = values.filter((v) => v.persian);
    if (winners.length === 0) {
      const alive = values.filter((v) => !v.bust);
      const best = Math.max(...alive.map((v) => v.total));
      winners = alive.filter((v) => v.total === best);
    }
    if (winners.length > 1 && rules.familyTie === "noneScore") winners = [];
    for (const w of winners) points[w.seat] = 1;
    return { values, points };
  }

  const b = values[bank];
  const duels: Duel[] = values
    .filter((p) => p.seat !== bank)
    .map((p) => {
      const w = duel(p, b, rules);
      return { seat: p.seat, winner: w === "tie" ? (rules.bankTie === "bankWins" ? "bank" : "none") : w };
    });
  const bankWon = duels.filter((x) => x.winner === "bank").length;
  const bankLost = duels.filter((x) => x.winner === "player").length;
  for (const x of duels) if (x.winner === "player") points[x.seat] = 1;
  points[bank] = rules.bankScoring === "perDuel" ? bankWon : bankWon > bankLost ? 1 : 0;
  return { values, points, duels };
}

/** One player against the bank, before the tie rule. */
function duel(p: SeatValue, b: SeatValue, rules: Rules): Duel["winner"] | "tie" {
  if (p.bust) return b.bust && !rules.playerBustLoses ? "none" : "bank";
  if (b.bust) return "player";
  if (p.persian && b.persian) return "tie";
  if (p.persian) return "player";
  if (b.persian) return "bank";
  return p.total > b.total ? "player" : p.total < b.total ? "bank" : "tie";
}
