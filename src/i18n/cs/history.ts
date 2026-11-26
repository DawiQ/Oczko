// Czech: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { czechForm } from "../plural";
import { common } from "./common";

/** A hand's value in the replay: "dvě esa", "přes (23)" / "přes 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

/** The word after a number, by Czech plural rules (no number). */
const word = (n: number, one: string, few: string, many: string) => {
  const f = czechForm(n);
  return f === "one" ? one : f === "few" ? few : many;
};

const grades: Record<Grade, string> = {
  best: "nejlepší",
  good: "dobré",
  risky: "riskantní",
  mistake: "chyba",
};

export const history: typeof pl.history = {
  list: {
    title: "Historie",
    shareTitle: "Oczko — historie",
    export: "Export",
    exportLabel: "Exportovat historii (JSON)",
    empty: "Tady se objeví odehrané partie — se záznamem tah po tahu.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `Ještě ${n} ${word(n, "partie", "partie", "partií")} v Oczko Pro`,
    moreLabel: (n: number) => `Ještě ${n} v Oczko Pro`,
    /** A record's row. */
    aborted: "Přerušená partie",
    mine: "Partie pro tebe",
    wins: (name: string) => `Vyhrává ${name}`,
    family: "Rodinná hra",
    bank: "S bankéřem",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Záznam",
    cannot: "Tuto partii v této verzi aplikace nejde přehrát.",
    round: (n: number) => `Kolo ${n}`,
    deal: (n: number) => `Kolo ${n} — rozdání`,
    stand: (who: string) => `${who}: Stačí`,
    hit: (who: string, v: Value) => `${who}: Ještě → ${v.persian ? "dvě esa" : v.bust ? `přes (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "dvě esa" : v.bust ? `přes ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · bank",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Rozhodnutí: ${grades[g]} · Stačí ${standPct} % / Ještě ${hitPct} %`,
    prev: "Předchozí tah",
    next: "Další tah",
    pause: "Pozastavit",
    play: "Přehrát",
    move: (i: number, n: number) => `Tah ${i} z ${n}`,
    summary: (x: Record<Grade, number>) =>
      `Tvoje rozhodnutí: ${x.best} ${word(x.best, "nejlepší", "nejlepší", "nejlepších")}, ${x.good} ${word(x.good, "dobré", "dobrá", "dobrých")}, ${x.risky} ${word(x.risky, "riskantní", "riskantní", "riskantních")}, ${x.mistake} ${word(x.mistake, "chyba", "chyby", "chyb")}`,
    analysing: "Analyzuji…",
    analyse: "Analyzovat moje rozhodnutí",
    progress: "Průběh záznamu",
  },
};
