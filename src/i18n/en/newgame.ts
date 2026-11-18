// English: texts of the "newgame" area — "New game" / "Practice" and the
// house-rules editor ("Your house rules").
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "New game",
  training: "Practice",
  trainingSub: "With tips from the coach",
  modeA11y: "Game mode",
  rivals: "Opponents",
  /** "You + 3 · max 5" */
  rivalsCount: (total: number, limit: number) => `You + ${total} · max ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} at the table`,
  tooMany: (limit: number) => `Too many opponents for this deck — ${limit} at most.`,
  length: "Play to",
  lengthA11y: "Match length",
  rules: "Rules",
  rulesA11y: (summary: string) => `Rules: ${summary}. Change`,
  change: "Change",
  play: "Play",
  sheetTitle: "Rules for this game",

  houseRules: {
    title: "Your house rules",
    reset: "Restore defaults",
    save: "Save",
  },
};
