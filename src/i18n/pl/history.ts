// Polish: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import { plural } from "../plural";

/** A hand's value in the replay: "perskie oczko", "fura (23)" / "fura 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

const grades: Record<Grade, string> = {
  best: "najlepsza",
  good: "dobra",
  risky: "ryzykowna",
  mistake: "błąd",
};

export const history = {
  list: {
    title: "Historia",
    shareTitle: "Oczko — historia",
    export: "Eksport",
    exportLabel: "Eksportuj historię (JSON)",
    empty: "Tu pojawią się rozegrane partie — z powtórką ruch po ruchu.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `Jeszcze ${n} ${plural(n, "partia", "partie", "partii")} w Oczko Pro`,
    moreLabel: (n: number) => `Jeszcze ${n} w Oczko Pro`,
    /** A record's row. */
    aborted: "Partia przerwana",
    mine: "Partia dla Ciebie",
    wins: (name: string) => `Wygrywa ${name}`,
    family: "Rodzinne",
    bank: "Z bankierem",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${rounds} ${plural(rounds, "runda", "rundy", "rund")} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Powtórka",
    cannot: "Tej partii nie da się odtworzyć w tej wersji aplikacji.",
    round: (n: number) => `Runda ${n}`,
    deal: (n: number) => `Runda ${n} — rozdanie`,
    stand: (who: string) => `${who}: Starczy`,
    hit: (who: string, v: Value) => `${who}: Dobieram → ${v.persian ? "perskie oczko" : v.bust ? `fura (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "perskie oczko" : v.bust ? `fura ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · bank",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Decyzja: ${grades[g]} · Starczy ${standPct}% / Dobieram ${hitPct}%`,
    prev: "Poprzedni ruch",
    next: "Następny ruch",
    pause: "Zatrzymaj",
    play: "Odtwarzaj",
    move: (i: number, n: number) => `Ruch ${i} z ${n}`,
    summary: (x: Record<Grade, number>) => `Twoje decyzje: ${x.best} najlepszych, ${x.good} dobrych, ${x.risky} ryzykownych, ${x.mistake} błędów`,
    analysing: "Analizuję…",
    analyse: "Analizuj moje decyzje",
    progress: "Postęp powtórki",
  },
};
