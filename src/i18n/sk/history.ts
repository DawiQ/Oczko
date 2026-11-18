// Slovak: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { czechForm } from "../plural";
import { common, count } from "./common";

/** A hand's value in the replay: "dve esá", "cez (23)" / "cez 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

/** Grades of a decision ("rozhodnutie", neuter). */
const grades: Record<Grade, string> = {
  best: "najlepšie",
  good: "dobré",
  risky: "riskantné",
  mistake: "chyba",
};

/** "2 dobré", "5 dobrých" (an adjective after a number). */
const adj = (n: number, few: string, many: string) => `${n} ${czechForm(n) === "many" ? many : few}`;

export const history: typeof pl.history = {
  list: {
    title: "História",
    shareTitle: "Oczko — história",
    export: "Export",
    exportLabel: "Exportovať históriu (JSON)",
    empty: "Tu sa objavia odohrané partie — so záznamom ťah po ťahu.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `Ešte ${count(n, "partia", "partie", "partií")} v Oczko Pro`,
    moreLabel: (n: number) => `Ešte ${n} v Oczko Pro`,
    /** A record's row. */
    aborted: "Partia prerušená",
    mine: "Partia je tvoja",
    wins: (name: string) => `Vyhráva ${name}`,
    family: "Rodinná hra",
    bank: "S bankárom",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Záznam",
    cannot: "Túto partiu sa v tejto verzii aplikácie nedá prehrať.",
    round: (n: number) => `Kolo ${n}`,
    deal: (n: number) => `Kolo ${n} — rozdanie`,
    stand: (who: string) => `${who}: Stačí`,
    hit: (who: string, v: Value) => `${who}: Ešte → ${v.persian ? "dve esá" : v.bust ? `cez (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "dve esá" : v.bust ? `cez ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · bank",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Rozhodnutie: ${grades[g]} · Stačí ${standPct} % / Ešte ${hitPct} %`,
    prev: "Predchádzajúci ťah",
    next: "Ďalší ťah",
    pause: "Zastaviť",
    play: "Prehrať",
    move: (i: number, n: number) => `Ťah ${i} z ${n}`,
    summary: (x: Record<Grade, number>) =>
      `Tvoje rozhodnutia: ${adj(x.best, "najlepšie", "najlepších")}, ${adj(x.good, "dobré", "dobrých")}, ${adj(x.risky, "riskantné", "riskantných")}, ${count(x.mistake, "chyba", "chyby", "chýb")}`,
    analysing: "Analyzujem…",
    analyse: "Analyzovať moje rozhodnutia",
    progress: "Priebeh záznamu",
  },
};
