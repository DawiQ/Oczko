// House rules of Oczko (PLAN.md §0, §4). Pure data + validation.
import type { DeckSize } from "./cards";

export type FaceRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** Exactly two aces in two cards: perskie oczko — win over everything
 *  ("wins"); count as 21 (Czech/Slovak "fojer", "is21"); nothing special
 *  ("off": 22 with the ace worth 11). */
export type TwoAces = "wins" | "is21" | "off";

export interface Rules {
  deck: DeckSize;
  /** Points of ranks 2..13 (W = 11, D = 12, K = 13); 1..11. The ace is set by `ace`. */
  values: Record<FaceRank, number>;
  ace: "eleven" | "oneOrEleven";
  /** Exactly two aces in two cards (see `TwoAces`). Stored as a boolean
   *  before version 1.1 (true = "wins", false = "off"); `validateRules` reads both. */
  persian: TwoAces;
  startCards: 1 | 2;
  /** Card limit of a hand (reached → the hand stops); null = none. */
  maxCards: number | null;
  mode: "family" | "bank";
  /** Family mode, several best hands: everyone scores, or nobody. */
  familyTie: "allScore" | "noneScore";
  /** Bank mode, equal hands: the bank wins the duel, or nobody does. */
  bankTie: "bankWins" | "nobody";
  /** Bank mode: the bank scores 1 for winning more duels than it loses, or 1 per duel won. */
  bankScoring: "majority" | "perDuel";
  bankRotation: "everyRound" | "onPersian" | "fixed";
  /** A player's fura loses to the bank even when the bank has fura too. */
  playerBustLoses: boolean;
  /** A fura is announced at once and its cards shown. */
  bustRevealed: boolean;
  /** Bank mode: the bank draws below 17 and stands from 17 (Russian/Ukrainian
   *  Очко). Missing in rules saved before version 1.2 (false). */
  bankTo17: boolean;
  /** Points that win the match. */
  target: number;
}

export const FACE_RANKS: FaceRank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/** 2–10 by their pips, W 2, D 3, K 4. */
export const CLASSIC_VALUES: Record<FaceRank, number> = {
  2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 2, 12: 3, 13: 4,
};

export const DEFAULT_RULES: Rules = {
  deck: 52,
  values: CLASSIC_VALUES,
  ace: "eleven",
  persian: "wins",
  startCards: 1,
  maxCards: null,
  mode: "family",
  familyTie: "allScore",
  bankTie: "bankWins",
  bankScoring: "majority",
  bankRotation: "everyRound",
  playerBustLoses: true,
  bustRevealed: true,
  target: 10,
  bankTo17: false,
};

export const PRESETS: Record<"family" | "bank" | "small24", Rules> = {
  family: DEFAULT_RULES,
  bank: { ...DEFAULT_RULES, mode: "bank" },
  small24: { ...DEFAULT_RULES, deck: 24 },
};

/** Seats per deck: the stock never runs out in practice — measured by
 *  `npm run stats` (docs/STATS.md): with one more seat the 24-card deck runs
 *  out in ~5% of rounds and the 32-card one in ~0.1%. */
export const MAX_SEATS: Record<DeckSize, number> = { 24: 5, 32: 7, 36: 8, 52: 8 };
export const MIN_SEATS = 2;

export const MAX_TARGET = 50;
export const MAX_CARDS_LIMIT = 12;

const KEYS: (keyof Rules)[] = [
  "deck", "values", "ace", "persian", "startCards", "maxCards", "mode", "familyTie",
  "bankTie", "bankScoring", "bankRotation", "playerBustLoses", "bustRevealed", "target", "bankTo17",
];
/** Keys added later: rules saved before them are read with a default. */
const LATER_KEYS: (keyof Rules)[] = ["bankTo17"];

const isInt = (x: unknown, min: number, max: number): x is number =>
  typeof x === "number" && Number.isInteger(x) && x >= min && x <= max;
const oneOf = <T>(x: unknown, options: readonly T[]): x is T => options.includes(x as T);

/** The rules if `r` is a complete, consistent set (stored or received), else null. */
export function validateRules(r: unknown): Rules | null {
  if (typeof r !== "object" || r === null || Array.isArray(r)) return null;
  const o = r as Record<string, unknown>;
  const keys = Object.keys(o);
  const needed = KEYS.filter((k) => !LATER_KEYS.includes(k));
  if (!keys.every((k) => (KEYS as string[]).includes(k)) || !needed.every((k) => keys.includes(k))) return null;

  const v = o.values;
  if (typeof v !== "object" || v === null || Array.isArray(v)) return null;
  const vk = Object.keys(v);
  if (vk.length !== FACE_RANKS.length || !FACE_RANKS.every((k) => isInt((v as Record<string, unknown>)[k], 1, 11))) return null;

  if (!oneOf(o.deck, [24, 32, 36, 52] as const)) return null;
  if (!oneOf(o.ace, ["eleven", "oneOrEleven"] as const)) return null;
  // Before version 1.1 a boolean.
  const persian: TwoAces | null = o.persian === true ? "wins" : o.persian === false ? "off" : oneOf(o.persian, ["wins", "is21", "off"] as const) ? o.persian : null;
  if (persian === null) return null;
  if (!oneOf(o.startCards, [1, 2] as const)) return null;
  if (o.maxCards !== null && !isInt(o.maxCards, o.startCards + 1, MAX_CARDS_LIMIT)) return null;
  if (!oneOf(o.mode, ["family", "bank"] as const)) return null;
  if (!oneOf(o.familyTie, ["allScore", "noneScore"] as const)) return null;
  if (!oneOf(o.bankTie, ["bankWins", "nobody"] as const)) return null;
  if (!oneOf(o.bankScoring, ["majority", "perDuel"] as const)) return null;
  if (!oneOf(o.bankRotation, ["everyRound", "onPersian", "fixed"] as const)) return null;
  if (typeof o.playerBustLoses !== "boolean" || typeof o.bustRevealed !== "boolean") return null;
  if (!isInt(o.target, 1, MAX_TARGET)) return null;
  const bankTo17 = o.bankTo17 === undefined ? false : o.bankTo17;
  if (typeof bankTo17 !== "boolean") return null;

  const values = {} as Record<FaceRank, number>;
  for (const k of FACE_RANKS) values[k] = (v as Record<string, number>)[k];
  return {
    deck: o.deck,
    values,
    ace: o.ace,
    persian,
    startCards: o.startCards,
    maxCards: o.maxCards as number | null,
    mode: o.mode,
    familyTie: o.familyTie,
    bankTie: o.bankTie,
    bankScoring: o.bankScoring,
    bankRotation: o.bankRotation,
    playerBustLoses: o.playerBustLoses,
    bustRevealed: o.bustRevealed,
    target: o.target,
    bankTo17,
  };
}
