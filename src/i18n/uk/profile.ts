// Ukrainian: texts of the "profile" area (rank, statistics, badges, next rival).
import type { BadgeId } from "../../profile/progress";
import type { pl } from "../pl";

export const profile: typeof pl.profile = {
  title: "Профіль",
  /** Ranks named after cards (gender-neutral), weakest first (progress.ts). */
  ranks: ["Дев'ятка", "Десятка", "Валет", "Дама", "Король", "Туз", "Два тузи"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Два тузи", desc: "Два тузи в одній руці" },
    exact21: { name: "Рівно 21", desc: "Раунд завершено з 21" },
    fiveCard: { name: "21 з п'яти карт", desc: "21 з п'яти або більше карт" },
    edge: { name: "На межі", desc: "Виграш з 21 після добору на 17 або більше" },
    ironBank: { name: "Залізний банк", desc: "Банк виграє всі поєдинки (2+ гравці)" },
    streak: { name: "Серія", desc: "5 виграних раундів поспіль" },
    veteran: { name: "Ветеран", desc: "100 зіграних партій" },
  } as Record<BadgeId, { name: string; desc: string }>,

  rank: "Ранг",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Ранг: ${name}, досвід: ${xp}${next ? `, до рангу «${next.name}»: ${next.left}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} до рангу «${next.name}»` : `${xp} — найвищий ранг`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "партій",
    won: "перемог",
    busts: "раундів з перебором",
    rounds: "раундів",
    roundsWon: "раундів із балом",
    standAvg: "у середньому на «Досить»",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Значки · ${earned} з ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (ще не отримано)"}`,

  more: "Розширена статистика",
  moreLabel: "Розширена статистика в Oczko Pro",
  moreNote: "Режими, результати з кожним суперником, наступний суперник — в Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Наступний суперник",
  /** "Перемоги над Олею: 2 з 3" (withName: the name in the instrumental). */
  nextReason: (withName: string, won: number, matches: number) => `Перемоги над ${withName}: ${won} з ${matches}`,
  play: "Зіграти",

  modes: "Режими",
  family: "Сімейна гра",
  bank: "З банкіром",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) =>
    `партії: ${x.matchesWon}/${x.matches} · раунди: ${x.roundsWon}/${x.rounds}`,
  rivals: "Суперники",
  rivalLine: (won: number, matches: number) => `${won} з ${matches}`,

  history: "Історія партій",
  historyLink: "Історія партій ›",
  reset: "Скинути статистику",
  resetTitle: "Скинути статистику?",
  resetMessage: "Ранг, значки й результати почнуться з нуля. Історії партій це не змінить.",
  resetConfirm: "Скинути",
};
