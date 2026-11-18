// Czech: texts of the "newgame" area — "Nová hra" / "Trénink" and the
// house-rules editor ("Tvoje domácí pravidla").
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "Nová hra",
  training: "Trénink",
  trainingSub: "S radami trenéra",
  modeA11y: "Režim hry",
  rivals: "Soupeři",
  /** "Ty + 3 · max 5" */
  rivalsCount: (total: number, limit: number) => `Ty + ${total} · max ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} u stolu`,
  tooMany: (limit: number) => `Na tento balíček je příliš mnoho soupeřů — nejvýš ${limit}.`,
  length: "Do kolika bodů",
  lengthA11y: "Délka partie",
  rules: "Pravidla",
  rulesA11y: (summary: string) => `Pravidla: ${summary}. Změnit`,
  change: "Změnit",
  play: "Hrát",
  sheetTitle: "Pravidla této hry",

  houseRules: {
    title: "Tvoje domácí pravidla",
    reset: "Obnovit výchozí",
    save: "Uložit",
  },
};
