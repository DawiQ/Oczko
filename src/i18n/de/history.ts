// German: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { germanicForm } from "../plural";
import { common } from "./common";

/** A hand's value in the replay: "Feuer", "überkauft (23)" / "überkauft 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

const grades: Record<Grade, string> = {
  best: "beste",
  good: "gut",
  risky: "riskant",
  mistake: "Fehler",
};

export const history: typeof pl.history = {
  list: {
    title: "Verlauf",
    shareTitle: "Oczko — Verlauf",
    export: "Export",
    exportLabel: "Verlauf exportieren (JSON)",
    empty: "Hier erscheinen deine Partien — mit Wiederholung Zug für Zug.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `Noch ${n} ${germanicForm(n) === "one" ? "Partie" : "Partien"} in Oczko Pro`,
    moreLabel: (n: number) => `Noch ${n} in Oczko Pro`,
    /** A record's row. */
    aborted: "Partie abgebrochen",
    mine: "Partie gewonnen",
    wins: (name: string) => `${name} gewinnt`,
    family: "Familienspiel",
    bank: "Mit Bankhalter",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Wiederholung",
    cannot: "Diese Partie lässt sich in dieser App-Version nicht wiederholen.",
    round: (n: number) => `Runde ${n}`,
    deal: (n: number) => `Runde ${n} — Austeilen`,
    stand: (who: string) => `${who}: Genug`,
    hit: (who: string, v: Value) => `${who}: Noch eine → ${v.persian ? "Feuer" : v.bust ? `überkauft (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "Feuer" : v.bust ? `überkauft ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · Bank",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Entscheidung: ${grades[g]} · Genug ${standPct} % / Noch eine ${hitPct} %`,
    prev: "Vorheriger Zug",
    next: "Nächster Zug",
    pause: "Pause",
    play: "Abspielen",
    move: (i: number, n: number) => `Zug ${i} von ${n}`,
    summary: (x: Record<Grade, number>) =>
      `Deine Entscheidungen: ${x.best} beste, ${x.good} gute, ${x.risky} riskante, ${x.mistake} Fehler`,
    analysing: "Analysiere…",
    analyse: "Meine Entscheidungen analysieren",
    progress: "Fortschritt der Wiederholung",
  },
};
