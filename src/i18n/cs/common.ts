// Czech: shared words, counts, cards, base components.
import type { pl } from "../pl";
import { czechForm } from "../plural";

/** "1 karta", "3 karty", "5 karet". */
export const count = (n: number, one: string, few: string, many: string) => {
  const f = czechForm(n);
  return `${n} ${f === "one" ? one : f === "few" ? few : many}`;
};

/** "do 1 bodu", "do 10 bodů" (the genitive after "do"). */
export const toPoints = (n: number) => `do ${n} ${n === 1 ? "bodu" : "bodů"}`;

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "karta", "karty", "karet"),
  points: (n: number) => count(n, "bod", "body", "bodů"),
  rounds: (n: number) => count(n, "kolo", "kola", "kol"),
  close: "Zavřít",
  cancel: "Zrušit",
  back: "Zpět",
  you: "Ty",
};

/** Suit adjectives' stems ("piková dáma", "pikový král", "pikové eso"). */
const SUIT_ADJ: Record<string, string> = { srdce: "srdcov", káry: "károv", kříže: "křížov", piky: "pikov" };

export const cards: typeof pl.cards = {
  rankLetters: { 11: "J", 12: "Q", 13: "K", 14: "A" },
  suits: ["srdce", "káry", "kříže", "piky"],
  ranks: {
    2: "dvojka",
    3: "trojka",
    4: "čtyřka",
    5: "pětka",
    6: "šestka",
    7: "sedmička",
    8: "osmička",
    9: "devítka",
    10: "desítka",
    11: "kluk",
    12: "dáma",
    13: "král",
    14: "eso",
  },
  /** "piková dáma", "srdcový král", "křížové eso" */
  spoken: (rank: string, suit: string) => {
    const stem = SUIT_ADJ[suit];
    if (!stem) return `${rank} ${suit}`;
    const ending = rank === "eso" ? "é" : rank === "kluk" || rank === "král" ? "ý" : "á";
    return `${stem}${ending} ${rank}`;
  },
  faceDown: "zakrytá karta",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Změnit výšku panelu",
  sheetHint: "Táhni nahoru nebo dolů, nebo klepni pro změnu výšky",
  sheetUp: "Výš",
  sheetDown: "Níž",
  more: "Víc",
  less: "Méně",
  counterMore: (label: string) => `${label}: víc`,
  counterLess: (label: string) => `${label}: méně`,
};
