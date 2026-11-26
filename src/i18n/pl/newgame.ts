// Polish: texts of the "newgame" area — "Nowa gra" / "Trening" and
// "Jak grasz u siebie".
export const newgame = {
  title: "Nowa gra",
  training: "Trening",
  trainingSub: "Z podpowiedziami trenera",
  modeA11y: "Tryb gry",
  rivals: "Rywale",
  /** "Ty + 3 · max 5" */
  rivalsCount: (total: number, limit: number) => `Ty + ${total} · max ${limit}`,
  /** A character's counter. */
  atTable: (name: string) => `${name} przy stole`,
  tooMany: (limit: number) => `Za dużo rywali dla tej talii — najwyżej ${limit}.`,
  length: "Do ilu punktów",
  lengthA11y: "Długość partii",
  rules: "Zasady",
  rulesA11y: (summary: string) => `Zasady: ${summary}. Zmień`,
  change: "Zmień",
  play: "Graj",
  sheetTitle: "Zasady tej gry",

  houseRules: {
    title: "Jak grasz u siebie",
    reset: "Przywróć domyślne",
    save: "Zapisz",
  },
};
