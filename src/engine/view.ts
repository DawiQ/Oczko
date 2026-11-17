// What one seat may know: its own hand, the others' card counts and statuses,
// and only the cards that are face up. Bots, the table UI and Wi‑Fi guests get
// nothing else (never the stock, the seed or a hidden hand).
import type { Card } from "./cards";
import type { MatchState } from "./match";
import { legal, type Action, type RoundEvent, type RoundResult, type RoundState, type SeatStatus } from "./round";
import type { Rules } from "./rules";
import { handValue, type HandValue } from "./score";

export interface OtherSeat {
  seat: number;
  cards: number;
  status: SeatStatus;
  /** Only when face up. */
  hand?: Card[];
}

export interface SeatView {
  me: number;
  rules: Rules;
  roundNo: number;
  turn: number | null;
  dealer: number;
  bank: number | null;
  myHand: Card[];
  myValue: HandValue;
  myStatus: SeatStatus;
  others: OtherSeat[];
  /** Every card face up for me in this round (mine and the revealed hands). */
  seenCards: Card[];
  stockLeft: number;
  scores: number[];
  /** My moves (empty when it is not my turn). */
  legal: Action[];
  /** Set once the round is over (all hands are face up then). */
  result: RoundResult | null;
  winner: number | null;
}

/** A seat's status as `viewer` sees it: a hidden fura looks like "Starczy". */
export function visibleStatus(s: RoundState, seat: number, viewer: number): SeatStatus {
  const st = s.status[seat];
  return st === "bust" && seat !== viewer && !s.revealed[seat] ? "stood" : st;
}

export function viewFor(m: MatchState, seat: number): SeatView {
  const s = m.round;
  const myHand = s.hands[seat].slice();
  const others: OtherSeat[] = [];
  const seen = myHand.slice();
  for (let o = 0; o < m.seats; o++) {
    if (o === seat) continue;
    const other: OtherSeat = { seat: o, cards: s.hands[o].length, status: visibleStatus(s, o, seat) };
    if (s.revealed[o]) {
      other.hand = s.hands[o].slice();
      seen.push(...other.hand);
    }
    others.push(other);
  }
  return {
    me: seat,
    rules: m.rules,
    roundNo: m.roundNo,
    turn: s.turn,
    dealer: s.dealer,
    bank: s.bank,
    myHand,
    myValue: handValue(myHand, m.rules),
    myStatus: s.status[seat],
    others,
    seenCards: seen,
    stockLeft: s.stock.length,
    scores: m.scores.slice(),
    legal: s.turn === seat ? legal(s) : [],
    result: s.result,
    winner: m.winner,
  };
}

/** The events as `seat` may see them: others' drawn cards hidden, a hidden
 *  fura reported as "Starczy". */
export function eventsFor(events: readonly RoundEvent[], seat: number, s: RoundState): RoundEvent[] {
  return events.map((e): RoundEvent => {
    if (e.t === "hit" && e.seat !== seat) return { t: "hit", seat: e.seat };
    if (e.t === "bust" && e.seat !== seat && !s.rules.bustRevealed) return { t: "stand", seat: e.seat };
    return e;
  });
}
