// Hungarian: shared words, counts, cards, base components.
import type { pl } from "../pl";
import { hungarianForm } from "../plural";

/** Hungarian numbers take the singular: "5 kártya", "3 pont", "2 kör". */
const count = (n: number, one: string, many = one) => `${n} ${hungarianForm(n) === "one" ? one : many}`;

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "kártya"),
  points: (n: number) => count(n, "pont"),
  rounds: (n: number) => count(n, "kör"),
  close: "Bezárás",
  cancel: "Mégse",
  back: "Vissza",
  you: "Te",
};

export const cards: typeof pl.cards = {
  // Alsó, felső, király, ász (Hungarian names of the face cards; "Á" keeps
  // the ace apart from the alsó).
  rankLetters: { 11: "A", 12: "F", 13: "K", 14: "Á" },
  suits: ["kőr", "káró", "treff", "pikk"],
  ranks: {
    2: "kettes",
    3: "hármas",
    4: "négyes",
    5: "ötös",
    6: "hatos",
    7: "hetes",
    8: "nyolcas",
    9: "kilences",
    10: "tízes",
    11: "alsó",
    12: "felső",
    13: "király",
    14: "ász",
  },
  /** "pikk felső" */
  spoken: (rank: string, suit: string) => `${suit} ${rank}`,
  faceDown: "lefelé fordított lap",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Panelmagasság módosítása",
  sheetHint: "Húzd felfelé vagy lefelé, vagy koppints a magasság váltásához",
  sheetUp: "Feljebb",
  sheetDown: "Lejjebb",
  more: "Több",
  less: "Kevesebb",
  counterMore: (label: string) => `${label}: több`,
  counterLess: (label: string) => `${label}: kevesebb`,
};
