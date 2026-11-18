// Russian: shared words, counts, cards, base components.
import type { pl } from "../pl";
import { eastSlavicForm } from "../plural";

/** "1 карта", "3 карты", "5 карт" (also "21 карта", "11 карт"). */
export const count = (n: number, one: string, few: string, many: string) => {
  const f = eastSlavicForm(n);
  return `${n} ${f === "one" ? one : f === "few" ? few : many}`;
};

/** The genitive after "до" / "из": "до 1 балла", "до 10 баллов", "из 21 партии". */
export const gen = (n: number, one: string, many: string) => `${n} ${eastSlavicForm(n) === "one" ? one : many}`;

/** "до 1 балла", "до 10 баллов". */
export const toPoints = (n: number) => `до ${gen(n, "балла", "баллов")}`;

export const common: typeof pl.common = {
  cards: (n: number) => count(n, "карта", "карты", "карт"),
  points: (n: number) => count(n, "балл", "балла", "баллов"),
  rounds: (n: number) => count(n, "раунд", "раунда", "раундов"),
  close: "Закрыть",
  cancel: "Отмена",
  back: "Назад",
  you: "Ты",
};

/** Suits in the genitive plural after the rank ("дама пик", "туз червей"). */
const SUIT_GEN: Record<string, string> = { черви: "червей", бубны: "бубен", трефы: "треф", пики: "пик" };

export const cards: typeof pl.cards = {
  rankLetters: { 11: "В", 12: "Д", 13: "К", 14: "Т" },
  suits: ["черви", "бубны", "трефы", "пики"],
  ranks: {
    2: "двойка",
    3: "тройка",
    4: "четвёрка",
    5: "пятёрка",
    6: "шестёрка",
    7: "семёрка",
    8: "восьмёрка",
    9: "девятка",
    10: "десятка",
    11: "валет",
    12: "дама",
    13: "король",
    14: "туз",
  },
  /** "дама пик", "десятка червей" */
  spoken: (rank: string, suit: string) => `${rank} ${SUIT_GEN[suit] ?? suit}`,
  faceDown: "закрытая карта",
};

export const ui: typeof pl.ui = {
  sheetHandle: "Изменить высоту панели",
  sheetHint: "Потяни вверх или вниз либо нажми, чтобы переключить высоту",
  sheetUp: "Выше",
  sheetDown: "Ниже",
  more: "Больше",
  less: "Меньше",
  counterMore: (label: string) => `${label}: больше`,
  counterLess: (label: string) => `${label}: меньше`,
};
