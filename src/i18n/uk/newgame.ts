// Ukrainian: texts of the "newgame" area — "Нова гра" / "Тренування" and
// "Твої домашні правила".
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "Нова гра",
  training: "Тренування",
  trainingSub: "З підказками тренера",
  modeA11y: "Режим гри",
  rivals: "Суперники",
  /** "Ти + 3 · макс. 5" */
  rivalsCount: (total: number, limit: number) => `Ти + ${total} · макс. ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} за столом`,
  tooMany: (limit: number) => `Забагато суперників для цієї колоди — щонайбільше ${limit}.`,
  length: "До скількох балів",
  lengthA11y: "Тривалість партії",
  rules: "Правила",
  rulesA11y: (summary: string) => `Правила: ${summary}. Змінити`,
  change: "Змінити",
  play: "Грати",
  sheetTitle: "Правила цієї гри",

  houseRules: {
    title: "Твої домашні правила",
    reset: "Відновити типові",
    save: "Зберегти",
  },
};
