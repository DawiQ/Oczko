// Polish: shared words, counts, cards, base components.
import { plural } from "../plural";

export const common = {
  /** Counted nouns: "3 karty", "5 punktów", "2 rundy". */
  cards: (n: number) => `${n} ${plural(n, "karta", "karty", "kart")}`,
  points: (n: number) => `${n} ${plural(n, "punkt", "punkty", "punktów")}`,
  rounds: (n: number) => `${n} ${plural(n, "runda", "rundy", "rund")}`,
  close: "Zamknij",
  cancel: "Anuluj",
  back: "Wróć",
  /** The person at the local table. */
  you: "Ty",
};

export const cards = {
  /** Index letters by rank 11..13 (walet, dama, król). */
  rankLetters: { 11: "W", 12: "D", 13: "K", 14: "A" } as Record<number, string>,
  /** Suit names by suit 0..3 (♥ ♦ ♣ ♠). */
  suits: ["kier", "karo", "trefl", "pik"],
  /** Screen-reader names by rank 2..14. */
  ranks: {
    2: "dwójka",
    3: "trójka",
    4: "czwórka",
    5: "piątka",
    6: "szóstka",
    7: "siódemka",
    8: "ósemka",
    9: "dziewiątka",
    10: "dziesiątka",
    11: "walet",
    12: "dama",
    13: "król",
    14: "as",
  } as Record<number, string>,
  /** "dama pik" */
  spoken: (rank: string, suit: string) => `${rank} ${suit}`,
  faceDown: "zakryta karta",
};

export const ui = {
  sheetHandle: "Zmień wysokość panelu",
  sheetHint: "Przeciągnij w górę lub w dół albo stuknij, aby przełączyć wysokość",
  sheetUp: "Wyżej",
  sheetDown: "Niżej",
  more: "Więcej",
  less: "Mniej",
  counterMore: (label: string) => `${label}: więcej`,
  counterLess: (label: string) => `${label}: mniej`,
};
