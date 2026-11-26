// German: texts of the "newgame" area — "Neues Spiel" / "Training" and the
// house-rules editor ("Deine Hausregeln").
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "Neues Spiel",
  training: "Training",
  trainingSub: "Mit Tipps vom Trainer",
  modeA11y: "Spielmodus",
  rivals: "Gegner",
  /** "Du + 3 · max 5" */
  rivalsCount: (total: number, limit: number) => `Du + ${total} · max ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} am Tisch`,
  tooMany: (limit: number) => `Zu viele Gegner für diesen Stapel — höchstens ${limit}.`,
  length: "Spielen bis",
  lengthA11y: "Länge der Partie",
  rules: "Regeln",
  rulesA11y: (summary: string) => `Regeln: ${summary}. Ändern`,
  change: "Ändern",
  play: "Spielen",
  sheetTitle: "Regeln für dieses Spiel",

  houseRules: {
    title: "Deine Hausregeln",
    reset: "Zurücksetzen",
    save: "Speichern",
  },
};
