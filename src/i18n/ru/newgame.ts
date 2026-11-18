// Russian: texts of the "newgame" area — "Новая игра" / "Тренировка" and the
// house-rules editor ("Твои домашние правила").
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "Новая игра",
  training: "Тренировка",
  trainingSub: "С подсказками тренера",
  modeA11y: "Режим игры",
  rivals: "Соперники",
  /** "Ты + 3 · макс. 5" */
  rivalsCount: (total: number, limit: number) => `Ты + ${total} · макс. ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} за столом`,
  tooMany: (limit: number) => `Слишком много соперников для этой колоды — не больше ${limit}.`,
  length: "До скольких баллов",
  lengthA11y: "Длина партии",
  rules: "Правила",
  rulesA11y: (summary: string) => `Правила: ${summary}. Изменить`,
  change: "Изменить",
  play: "Играть",
  sheetTitle: "Правила этой игры",

  houseRules: {
    title: "Твои домашние правила",
    reset: "Сбросить настройки",
    save: "Сохранить",
  },
};
