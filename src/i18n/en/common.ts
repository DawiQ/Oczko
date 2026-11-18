// English: shared words, counts, cards, base components.
import type { pl } from "../pl";
import { germanicForm } from "../plural";

const count = (n: number, one: string, many: string) => `${n} ${germanicForm(n) === "one" ? one : many}`;

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "card", "cards"),
  points: (n: number) => count(n, "point", "points"),
  rounds: (n: number) => count(n, "round", "rounds"),
  close: "Close",
  cancel: "Cancel",
  back: "Back",
  you: "You",
};

export const cards: typeof pl.cards = {
  rankLetters: { 11: "J", 12: "Q", 13: "K", 14: "A" },
  suits: ["hearts", "diamonds", "clubs", "spades"],
  ranks: {
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "jack",
    12: "queen",
    13: "king",
    14: "ace",
  },
  /** "queen of spades" */
  spoken: (rank: string, suit: string) => `${rank} of ${suit}`,
  faceDown: "face-down card",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Change the panel's height",
  sheetHint: "Drag up or down, or tap to switch the height",
  sheetUp: "Higher",
  sheetDown: "Lower",
  more: "More",
  less: "Less",
  counterMore: (label: string) => `${label}: more`,
  counterLess: (label: string) => `${label}: less`,
};
