// Russian: texts of the "profile" area (rank, statistics, badges, next rival).
import type { pl } from "../pl";

export const profile: typeof pl.profile = {
  title: "Профиль",
  /** Ranks named after cards, weakest first (progress.ts). */
  ranks: ["Девятка", "Десятка", "Валет", "Дама", "Король", "Туз", "Два туза"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Два туза", desc: "Два туза в одной руке" },
    exact21: { name: "Ровно 21", desc: "Раунд закончен с 21" },
    fiveCard: { name: "21 из пяти карт", desc: "21 из пяти или больше карт" },
    edge: { name: "На грани", desc: "Победа с 21 после добора при 17 и больше" },
    ironBank: { name: "Железный банк", desc: "Банк выигрывает все поединки (2+ игрока)" },
    streak: { name: "Серия", desc: "5 выигранных раундов подряд" },
    veteran: { name: "Ветеран", desc: "100 сыгранных партий" },
  },

  rank: "Ранг",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Ранг: ${name}, опыт: ${xp}${next ? `, до ранга «${next.name}» осталось ${next.left}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} до ранга «${next.name}»` : `${xp} — высший ранг`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "партий",
    won: "побед",
    busts: "раундов с перебором",
    rounds: "раундов",
    roundsWon: "раундов с баллом",
    standAvg: "в среднем на «Хватит»",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Значки · ${earned} из ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (ещё не получен)"}`,

  more: "Расширенная статистика",
  moreLabel: "Расширенная статистика в Oczko Pro",
  moreNote: "Режимы, результаты против каждого соперника, следующий соперник — в Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Следующий соперник",
  /** "Победы над Олей: 2 из 3" (withName: the instrumental after "над"). */
  nextReason: (withName: string, won: number, matches: number) => `Победы над ${withName}: ${won} из ${matches}`,
  play: "Сыграть",

  modes: "Режимы",
  family: "Семейная игра",
  bank: "С банкиром",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `партии ${x.matchesWon}/${x.matches} · раунды ${x.roundsWon}/${x.rounds}`,
  rivals: "Соперники",
  rivalLine: (won: number, matches: number) => `${won} из ${matches}`,

  history: "История партий",
  historyLink: "История партий ›",
  reset: "Сбросить статистику",
  resetTitle: "Сбросить статистику?",
  resetMessage: "Ранг, значки и результаты начнутся заново. История партий не изменится.",
  resetConfirm: "Сбросить",
};
