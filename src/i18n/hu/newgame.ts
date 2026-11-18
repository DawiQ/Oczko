// Hungarian: texts of the "newgame" area — "Új játék" / "Gyakorlás" and the
// house-rules editor ("Házi szabályaid").
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "Új játék",
  training: "Gyakorlás",
  trainingSub: "Edzői tippekkel",
  modeA11y: "Játékmód",
  rivals: "Ellenfelek",
  /** "Te + 3 · max. 5" */
  rivalsCount: (total: number, limit: number) => `Te + ${total} · max. ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} az asztalnál`,
  tooMany: (limit: number) => `Túl sok ellenfél ehhez a paklihoz — legfeljebb ${limit}.`,
  length: "Hány pontig",
  lengthA11y: "A parti hossza",
  rules: "Szabályok",
  rulesA11y: (summary: string) => `Szabályok: ${summary}. Módosítás`,
  change: "Módosítás",
  play: "Játék",
  sheetTitle: "A játék szabályai",

  houseRules: {
    title: "Házi szabályaid",
    reset: "Alapértelmezés",
    save: "Mentés",
  },
};
