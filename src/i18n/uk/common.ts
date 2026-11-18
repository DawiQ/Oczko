// Ukrainian: shared words, counts, cards, base components.
import type { pl } from "../pl";
import { eastSlavicForm } from "../plural";

/** "1 карта", "3 карти", "5 карт" (1, 21… / 2–4, 22–24… / the rest). */
export const count = (n: number, one: string, few: string, many: string) => {
  const f = eastSlavicForm(n);
  return `${n} ${f === "one" ? one : f === "few" ? few : many}`;
};

/** "до 1 бала", "до 10 балів" (the genitive after "до"). */
export const toPoints = (n: number) => `до ${n} ${eastSlavicForm(n) === "one" ? "бала" : "балів"}`;

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "карта", "карти", "карт"),
  points: (n: number) => count(n, "бал", "бали", "балів"),
  rounds: (n: number) => count(n, "раунд", "раунди", "раундів"),
  close: "Закрити",
  cancel: "Скасувати",
  back: "Назад",
  you: "Ти",
};

/** Suits in the genitive plural after a rank ("дама пік", "туз чирв"). */
const SUIT_GEN: Record<string, string> = { чирви: "чирв", бубни: "бубон", трефи: "треф", піки: "пік" };

export const cards: typeof pl.cards = {
  rankLetters: { 11: "В", 12: "Д", 13: "К", 14: "Т" },
  suits: ["чирви", "бубни", "трефи", "піки"],
  ranks: {
    2: "двійка",
    3: "трійка",
    4: "четвірка",
    5: "п'ятірка",
    6: "шістка",
    7: "сімка",
    8: "вісімка",
    9: "дев'ятка",
    10: "десятка",
    11: "валет",
    12: "дама",
    13: "король",
    14: "туз",
  },
  /** "дама пік", "десятка чирв" */
  spoken: (rank: string, suit: string) => `${rank} ${SUIT_GEN[suit] ?? suit}`,
  faceDown: "закрита карта",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Змінити висоту панелі",
  sheetHint: "Потягни вгору чи вниз або торкнися, щоб змінити висоту",
  sheetUp: "Вище",
  sheetDown: "Нижче",
  more: "Більше",
  less: "Менше",
  counterMore: (label: string) => `${label}: більше`,
  counterLess: (label: string) => `${label}: менше`,
};
