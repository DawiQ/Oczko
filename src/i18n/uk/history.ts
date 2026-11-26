// Ukrainian: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { eastSlavicForm } from "../plural";
import { common } from "./common";

/** A hand's value in the replay: "два тузи", "перебір (23)" / "перебір 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

/** The word after a number, by Ukrainian plural rules (no number). */
const word = (n: number, one: string, few: string, many: string) => {
  const f = eastSlavicForm(n);
  return f === "one" ? one : f === "few" ? few : many;
};

const grades: Record<Grade, string> = {
  best: "найкраще",
  good: "добре",
  risky: "ризиковане",
  mistake: "помилка",
};

export const history: typeof pl.history = {
  list: {
    title: "Історія",
    shareTitle: "Oczko — історія",
    export: "Експорт",
    exportLabel: "Експортувати історію (JSON)",
    empty: "Тут з'являться зіграні партії — з повтором хід за ходом.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `Ще ${n} ${word(n, "партія", "партії", "партій")} в Oczko Pro`,
    moreLabel: (n: number) => `Ще ${n} в Oczko Pro`,
    /** A record's row. */
    aborted: "Партію перервано",
    mine: "Партія твоя",
    wins: (name: string) => `Виграє ${name}`,
    family: "Сімейна гра",
    bank: "З банкіром",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Повтор",
    cannot: "Цю партію не можна відтворити в цій версії застосунку.",
    round: (n: number) => `Раунд ${n}`,
    deal: (n: number) => `Раунд ${n} — роздача`,
    stand: (who: string) => `${who}: Досить`,
    hit: (who: string, v: Value) => `${who}: Ще → ${v.persian ? "два тузи" : v.bust ? `перебір (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "два тузи" : v.bust ? `перебір ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · банк",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Рішення: ${grades[g]} · Досить ${standPct}% / Ще ${hitPct}%`,
    prev: "Попередній хід",
    next: "Наступний хід",
    pause: "Пауза",
    play: "Відтворити",
    move: (i: number, n: number) => `Хід ${i} з ${n}`,
    summary: (x: Record<Grade, number>) =>
      `Твої рішення: найкращих — ${x.best}, добрих — ${x.good}, ризикованих — ${x.risky}, помилок — ${x.mistake}`,
    analysing: "Аналізую…",
    analyse: "Проаналізувати мої рішення",
    progress: "Прогрес повтору",
  },
};
