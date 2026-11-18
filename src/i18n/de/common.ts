// German: shared words, counts, cards, base components.
import type { pl } from "../pl";
import { germanicForm } from "../plural";

const count = (n: number, one: string, many: string) => `${n} ${germanicForm(n) === "one" ? one : many}`;

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "Karte", "Karten"),
  points: (n: number) => count(n, "Punkt", "Punkte"),
  rounds: (n: number) => count(n, "Runde", "Runden"),
  close: "Schließen",
  cancel: "Abbrechen",
  back: "Zurück",
  you: "Du",
};

export const cards: typeof pl.cards = {
  rankLetters: { 11: "B", 12: "D", 13: "K", 14: "A" },
  suits: ["Herz", "Karo", "Kreuz", "Pik"],
  ranks: {
    2: "Zwei",
    3: "Drei",
    4: "Vier",
    5: "Fünf",
    6: "Sechs",
    7: "Sieben",
    8: "Acht",
    9: "Neun",
    10: "Zehn",
    11: "Bube",
    12: "Dame",
    13: "König",
    14: "Ass",
  },
  /** "Pik Dame" */
  spoken: (rank: string, suit: string) => `${suit} ${rank}`,
  faceDown: "verdeckte Karte",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Höhe des Bereichs ändern",
  sheetHint: "Nach oben oder unten ziehen oder tippen, um die Höhe zu wechseln",
  sheetUp: "Höher",
  sheetDown: "Niedriger",
  more: "Mehr",
  less: "Weniger",
  counterMore: (label: string) => `${label}: mehr`,
  counterLess: (label: string) => `${label}: weniger`,
};
