// Slovak: texts of the "newgame" area — "Nová hra" / "Tréning" and the
// house-rules editor ("Tvoje domáce pravidlá").
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "Nová hra",
  training: "Tréning",
  trainingSub: "S radami trénera",
  modeA11y: "Režim hry",
  rivals: "Súperi",
  /** "Ty + 3 · max 5" */
  rivalsCount: (total: number, limit: number) => `Ty + ${total} · max ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} pri stole`,
  tooMany: (limit: number) => `Priveľa súperov pre tento balíček — najviac ${limit}.`,
  length: "Do koľkých bodov",
  lengthA11y: "Dĺžka partie",
  rules: "Pravidlá",
  rulesA11y: (summary: string) => `Pravidlá: ${summary}. Zmeniť`,
  change: "Zmeniť",
  play: "Hrať",
  sheetTitle: "Pravidlá tejto hry",

  houseRules: {
    title: "Tvoje domáce pravidlá",
    reset: "Obnoviť predvolené",
    save: "Uložiť",
  },
};
