// Bosnian-Croatian-Serbian (Latin, ijekavian): shared words, counts, cards,
// base components.
import type { pl } from "../pl";
import { eastSlavicForm } from "../plural";

/** "1 karta", "2 karte", "5 karata" (1, 21… / 2–4, 22–24… / the rest). */
export const count = (n: number, one: string, few: string, many: string) => {
  const f = eastSlavicForm(n);
  return `${n} ${f === "one" ? one : f === "few" ? few : many}`;
};

/** The word alone, without the number: "runda", "runde", "rundi". */
export const form = (n: number, one: string, few: string, many: string) => {
  const f = eastSlavicForm(n);
  return f === "one" ? one : f === "few" ? few : many;
};

/** "do 1 boda", "do 10 bodova" (the genitive after "do"). */
export const toPoints = (n: number) => `do ${n} ${form(n, "boda", "boda", "bodova")}`;

/** "s Oljom", "sa Zojom" (the preposition before the instrumental). */
export const withPrep = (name: string) => `${/^[szšžSZŠŽ]/.test(name) ? "sa" : "s"} ${name}`;

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "karta", "karte", "karata"),
  points: (n: number) => count(n, "bod", "boda", "bodova"),
  rounds: (n: number) => count(n, "runda", "runde", "rundi"),
  close: "Zatvori",
  cancel: "Odustani",
  back: "Nazad",
  you: "Ti",
};

export const cards: typeof pl.cards = {
  rankLetters: { 11: "J", 12: "Q", 13: "K", 14: "A" },
  suits: ["herc", "karo", "tref", "pik"],
  ranks: {
    2: "dvojka",
    3: "trojka",
    4: "četvorka",
    5: "petica",
    6: "šestica",
    7: "sedmica",
    8: "osmica",
    9: "devetka",
    10: "desetka",
    11: "dečko",
    12: "dama",
    13: "kralj",
    14: "as",
  },
  /** "pik dama", "herc as" */
  spoken: (rank: string, suit: string) => `${suit} ${rank}`,
  faceDown: "pokrivena karta",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Promijeni visinu panela",
  sheetHint: "Povuci gore ili dolje, ili dodirni za promjenu visine",
  sheetUp: "Više",
  sheetDown: "Niže",
  more: "Više",
  less: "Manje",
  counterMore: (label: string) => `${label}: više`,
  counterLess: (label: string) => `${label}: manje`,
};
