// Slovak: shared words, counts, cards, base components.
import type { pl } from "../pl";
import { czechForm } from "../plural";

/** "1 karta, 2 karty, 5 kariet" (Slovak plural rules). */
export const count = (n: number, one: string, few: string, many: string) => {
  const f = czechForm(n);
  return `${n} ${f === "one" ? one : f === "few" ? few : many}`;
};

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "karta", "karty", "kariet"),
  points: (n: number) => count(n, "bod", "body", "bodov"),
  rounds: (n: number) => count(n, "kolo", "kolá", "kôl"),
  close: "Zavrieť",
  cancel: "Zrušiť",
  back: "Späť",
  you: "Ty",
};

/** Suit adjectives by suit 0..3, agreeing with the rank: feminine, masculine, neuter. */
const SUIT_ADJ = [
  ["srdcová", "srdcový", "srdcové"],
  ["kárová", "kárový", "kárové"],
  ["krížová", "krížový", "krížové"],
  ["piková", "pikový", "pikové"],
];
const SUITS = ["srdcia", "káry", "kríže", "piky"];

export const cards: typeof pl.cards = {
  rankLetters: { 11: "J", 12: "Q", 13: "K", 14: "A" },
  suits: SUITS,
  ranks: {
    2: "dvojka",
    3: "trojka",
    4: "štvorka",
    5: "päťka",
    6: "šestka",
    7: "sedmička",
    8: "osmička",
    9: "deviatka",
    10: "desiatka",
    11: "chlapec",
    12: "dáma",
    13: "kráľ",
    14: "eso",
  },
  /** "piková dáma", "srdcový kráľ", "kárové eso" */
  spoken: (rank: string, suit: string) => {
    const adj = SUIT_ADJ[SUITS.indexOf(suit)];
    if (!adj) return `${rank} ${suit}`;
    const gender = rank === "chlapec" || rank === "kráľ" ? 1 : rank === "eso" ? 2 : 0;
    return `${adj[gender]} ${rank}`;
  },
  faceDown: "zakrytá karta",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Zmeniť výšku panela",
  sheetHint: "Potiahni nahor alebo nadol, prípadne ťukni a prepni výšku",
  sheetUp: "Vyššie",
  sheetDown: "Nižšie",
  more: "Viac",
  less: "Menej",
  counterMore: (label: string) => `${label}: viac`,
  counterLess: (label: string) => `${label}: menej`,
};
