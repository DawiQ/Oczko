// English: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { germanicForm } from "../plural";
import { common } from "./common";

/** A hand's value in the replay: "two aces", "bust (23)" / "bust 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

const grades: Record<Grade, string> = {
  best: "best",
  good: "good",
  risky: "risky",
  mistake: "mistake",
};

const count = (n: number, one: string, many: string) => `${n} ${germanicForm(n) === "one" ? one : many}`;

export const history: typeof pl.history = {
  list: {
    title: "History",
    shareTitle: "Oczko — history",
    export: "Export",
    exportLabel: "Export history (JSON)",
    empty: "Your matches will show up here — with a move-by-move replay.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `${count(n, "more match", "more matches")} in Oczko Pro`,
    moreLabel: (n: number) => `${n} more in Oczko Pro`,
    /** A record's row. */
    aborted: "Match abandoned",
    mine: "You win the match",
    wins: (name: string) => `${name} wins`,
    family: "Family game",
    bank: "With a banker",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Replay",
    cannot: "This match can't be replayed in this version of the app.",
    round: (n: number) => `Round ${n}`,
    deal: (n: number) => `Round ${n} — the deal`,
    stand: (who: string) => `${who}: Stay`,
    hit: (who: string, v: Value) => `${who}: Draw → ${v.persian ? "two aces" : v.bust ? `bust (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "two aces" : v.bust ? `bust ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · bank",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Decision: ${grades[g]} · Stay ${standPct}% / Draw ${hitPct}%`,
    prev: "Previous move",
    next: "Next move",
    pause: "Pause",
    play: "Play",
    move: (i: number, n: number) => `Move ${i} of ${n}`,
    summary: (x: Record<Grade, number>) =>
      `Your decisions: ${x.best} best, ${x.good} good, ${x.risky} risky, ${count(x.mistake, "mistake", "mistakes")}`,
    analysing: "Analysing…",
    analyse: "Analyse my decisions",
    progress: "Replay progress",
  },
};
