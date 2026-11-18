// The value of a hand under the house rules.
import { rankOf, type Card } from "./cards";
import type { FaceRank, Rules } from "./rules";

export interface HandValue {
  /** Sum of points (an ace counted as 11 when `soft`). */
  total: number;
  /** An ace counts 11 and could still count 1 (only with ace "oneOrEleven"). */
  soft: boolean;
  /** Over 21 (never for perskie oczko). */
  bust: boolean;
  /** Exactly two aces with the perskie oczko rule on ("wins"). */
  persian: boolean;
  /** A special hand of the Pontoon rules (null: none). */
  special: Special | null;
}

/** Pontoon's hands: an ace and a ten-card in two cards; five cards without a fura. */
export type Special = "pontoon" | "fiveCard";

/** How strong a hand is, for comparing (higher wins; equal = a tie): perskie
 *  oczko > pontoon > five-card trick > total; a fura is -1. */
export function handRank(v: { total: number; bust: boolean; persian: boolean; special: Special | null }): number {
  if (v.bust) return -1;
  if (v.persian) return 300;
  if (v.special === "pontoon") return 200;
  if (v.special === "fiveCard") return 100;
  return v.total;
}

export const ACE = 14;

const twoAces = (hand: readonly Card[]) => hand.length === 2 && rankOf(hand[0]) === ACE && rankOf(hand[1]) === ACE;

export function isPersian(hand: readonly Card[], rules: Rules): boolean {
  return rules.persian === "wins" && twoAces(hand);
}

export function handValue(hand: readonly Card[], rules: Rules): HandValue {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    const r = rankOf(c);
    if (r === ACE) aces++;
    else total += rules.values[r as FaceRank];
  }
  let soft = false;
  if (rules.ace === "eleven") total += 11 * aces;
  else {
    total += aces;
    if (aces > 0 && total + 10 <= 21) {
      total += 10;
      soft = true;
    }
  }
  // Czech/Slovak "fojer": two aces are 21.
  if (rules.persian === "is21" && twoAces(hand)) return { total: 21, soft: false, bust: false, persian: false, special: null };
  const persian = isPersian(hand, rules);
  const bust = !persian && total > 21;
  let special: Special | null = null;
  if (!persian && !bust) {
    if (rules.pontoon && hand.length === 2 && total === 21 && aces > 0) special = "pontoon";
    else if (rules.fiveCardTrick && hand.length >= 5) special = "fiveCard";
  }
  return { total, soft, bust, persian, special };
}
