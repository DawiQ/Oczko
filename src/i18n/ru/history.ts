// Russian: texts of the "history" area (the list, the replay, the analysis).
import type { Grade } from "../../history/analysis";
import type { pl } from "../pl";
import { common, count } from "./common";

/** A hand's value in the replay: "два туза", "перебор (23)" / "перебор 23", "18". */
interface Value {
  total: number;
  persian: boolean;
  bust: boolean;
}

/** After "Решение:" (neuter). */
const grades: Record<Grade, string> = {
  best: "лучшее",
  good: "хорошее",
  risky: "рискованное",
  mistake: "ошибка",
};

export const history: typeof pl.history = {
  list: {
    title: "История",
    shareTitle: "Oczko — история",
    export: "Экспорт",
    exportLabel: "Экспортировать историю (JSON)",
    empty: "Здесь появятся сыгранные партии — с повтором ход за ходом.",
    /** The locked records (Oczko Pro). */
    more: (n: number) => `Ещё ${count(n, "партия", "партии", "партий")} в Oczko Pro`,
    moreLabel: (n: number) => `Ещё ${n} в Oczko Pro`,
    /** A record's row. */
    aborted: "Партия прервана",
    mine: "Партия твоя",
    wins: (name: string) => `Выигрывает ${name}`,
    family: "Семейная игра",
    bank: "С банкиром",
    line: (mode: string, rounds: number, rivals: string) => `${mode} · ${common.rounds(rounds)} · ${rivals}`,
    rowLabel: (title: string, line: string, date: string) => `${title}, ${line}, ${date}`,
  },

  replay: {
    title: "Повтор",
    cannot: "Эту партию нельзя воспроизвести в этой версии приложения.",
    round: (n: number) => `Раунд ${n}`,
    deal: (n: number) => `Раунд ${n} — раздача`,
    stand: (who: string) => `${who}: Хватит`,
    hit: (who: string, v: Value) => `${who}: Ещё → ${v.persian ? "два туза" : v.bust ? `перебор (${v.total})` : v.total}`,
    seatLabel: (name: string, v: Value) => `${name}: ${v.persian ? "два туза" : v.bust ? `перебор ${v.total}` : v.total}`,
    /** After the bank's name. */
    bankMark: " · банк",
    grades,
    decision: (g: Grade, standPct: number, hitPct: number) => `Решение: ${grades[g]} · Хватит ${standPct}% / Ещё ${hitPct}%`,
    prev: "Предыдущий ход",
    next: "Следующий ход",
    pause: "Пауза",
    play: "Воспроизвести",
    move: (i: number, n: number) => `Ход ${i} из ${n}`,
    summary: (x: Record<Grade, number>) =>
      `Твои решения: лучших — ${x.best}, хороших — ${x.good}, рискованных — ${x.risky}, ошибок — ${x.mistake}`,
    analysing: "Анализирую…",
    analyse: "Проанализировать мои решения",
    progress: "Прогресс повтора",
  },
};
