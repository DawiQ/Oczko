// Bosnian-Croatian-Serbian: texts of the "newgame" area — "Nova igra" /
// "Trening" and the house-rules editor ("Tvoja kućna pravila").
import type { pl } from "../pl";

export const newgame: typeof pl.newgame = {
  title: "Nova igra",
  training: "Trening",
  trainingSub: "Sa savjetima trenera",
  modeA11y: "Način igre",
  rivals: "Protivnici",
  /** "Ti + 3 · max 5" */
  rivalsCount: (total: number, limit: number) => `Ti + ${total} · max ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} za stolom`,
  tooMany: (limit: number) => `Previše protivnika za ovaj špil — najviše ${limit}.`,
  length: "Do koliko bodova",
  lengthA11y: "Trajanje partije",
  rules: "Pravila",
  rulesA11y: (summary: string) => `Pravila: ${summary}. Promijeni`,
  change: "Promijeni",
  play: "Igraj",
  sheetTitle: "Pravila ove igre",

  houseRules: {
    title: "Tvoja kućna pravila",
    reset: "Vrati početna pravila",
    save: "Sačuvaj",
  },
};
