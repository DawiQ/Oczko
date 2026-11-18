// Hungarian: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { common } from "./common";

/** A hand's value in the replay: "két ász", "túl sok (23)" / "túl sok 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

const grades: Record<Grade, string> = {
  best: "legjobb",
  good: "jó",
  risky: "kockázatos",
  mistake: "hiba",
};

export const history: typeof pl.history = {
  list: {
    title: "Előzmények",
    shareTitle: "Oczko — előzmények",
    export: "Exportálás",
    exportLabel: "Előzmények exportálása (JSON)",
    empty: "Itt jelennek meg a lejátszott partik — lépésről lépésre visszajátszással.",
    /** The locked records (Oczko Pro). Hungarian numbers take the singular. */
    more: (n: number) => `Még ${n} parti az Oczko Pro csomagban`,
    moreLabel: (n: number) => `Még ${n} az Oczko Pro csomagban`,
    /** A record's row. */
    aborted: "Megszakított parti",
    mine: "Tiéd a parti",
    wins: (name: string) => `${name} nyert`,
    family: "Családi játék",
    bank: "Bankárral",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Visszajátszás",
    cannot: "Ez a parti az alkalmazás ezen verziójában nem játszható vissza.",
    round: (n: number) => `${n}. kör`,
    deal: (n: number) => `${n}. kör — osztás`,
    stand: (who: string) => `${who}: Elég`,
    hit: (who: string, v: Value) => `${who}: Kérek → ${v.persian ? "két ász" : v.bust ? `túl sok (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "két ász" : v.bust ? `túl sok ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · bank",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Döntés: ${grades[g]} · Elég ${standPct}% / Kérek ${hitPct}%`,
    prev: "Előző lépés",
    next: "Következő lépés",
    pause: "Szünet",
    play: "Lejátszás",
    move: (i: number, n: number) => `Lépés: ${i} / ${n}`,
    summary: (x: Record<Grade, number>) =>
      `Döntéseid: ${x.best} legjobb, ${x.good} jó, ${x.risky} kockázatos, ${x.mistake} hiba`,
    analysing: "Elemzés…",
    analyse: "Döntéseim elemzése",
    progress: "A visszajátszás állása",
  },
};
