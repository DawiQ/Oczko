// Bosnian-Croatian-Serbian: texts of the "history" area (the list, the
// replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { common, form } from "./common";

/** A hand's value in the replay: "dva asa", "tropa (23)" / "tropa 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

/** Grades of a decision ("odluka" is feminine). */
const grades: Record<Grade, string> = {
  best: "najbolja",
  good: "dobra",
  risky: "rizična",
  mistake: "greška",
};

export const history: typeof pl.history = {
  list: {
    title: "Odigrane partije",
    shareTitle: "Oczko — odigrane partije",
    export: "Izvoz",
    exportLabel: "Izvezi odigrane partije (JSON)",
    empty: "Ovdje će se pojaviti odigrane partije — sa snimkom potez po potez.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `Još ${n} ${form(n, "partija", "partije", "partija")} u Oczko Pro`,
    moreLabel: (n: number) => `Još ${n} u Oczko Pro`,
    /** A record's row. */
    aborted: "Prekinuta partija",
    mine: "Partija je tvoja",
    wins: (name: string) => `Partiju osvaja ${name}`,
    family: "Svi protiv svih",
    bank: "S bankarom",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Snimak",
    cannot: "Ovu partiju nije moguće pustiti u ovoj verziji aplikacije.",
    round: (n: number) => `Runda ${n}`,
    deal: (n: number) => `Runda ${n} — dijeljenje`,
    stand: (who: string) => `${who}: Dosta`,
    hit: (who: string, v: Value) => `${who}: Još → ${v.persian ? "dva asa" : v.bust ? `tropa (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "dva asa" : v.bust ? `tropa ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · bank",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Odluka: ${grades[g]} · Dosta ${standPct}% / Još ${hitPct}%`,
    prev: "Prethodni potez",
    next: "Sljedeći potez",
    pause: "Pauza",
    play: "Pusti",
    move: (i: number, n: number) => `Potez ${i} od ${n}`,
    summary: (x: Record<Grade, number>) => `Tvoje odluke — najbolje: ${x.best}, dobre: ${x.good}, rizične: ${x.risky}, greške: ${x.mistake}`,
    analysing: "Analiziram…",
    analyse: "Analiziraj moje odluke",
    progress: "Napredak snimka",
  },
};
