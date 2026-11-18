// Slovak: texts of the "profile" area (rank, statistics, badges, next rival).
import type { pl } from "../pl";
import { common } from "./common";

/** "s Kubom", "so Zuzkou" ("so" before s, z, š, ž). */
const withPrep = (withName: string) => `${/^[szšž]/i.test(withName) ? "so" : "s"} ${withName}`;

export const profile: typeof pl.profile = {
  title: "Profil",
  /** Ranks named after cards, weakest first (progress.ts). */
  ranks: ["Deviatka", "Desiatka", "Chlapec", "Dáma", "Kráľ", "Eso", "Dve esá"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Dve esá", desc: "Dve esá v jednej ruke" },
    exact21: { name: "Presne 21", desc: "Kolo ukončené s 21" },
    fiveCard: { name: "21 z piatich kariet", desc: "21 z piatich alebo viacerých kariet" },
    edge: { name: "Na hrane", desc: "Výhra s 21 po ďalšej karte pri 17 a viac" },
    ironBank: { name: "Železný bank", desc: "Bank vyhrá všetky súboje (2+ hráčov)" },
    streak: { name: "Séria", desc: "5 vyhraných kôl za sebou" },
    veteran: { name: "Veterán", desc: "100 odohraných partií" },
  },

  rank: "Hodnosť",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Hodnosť: ${name}, ${common.points(xp)} skúseností${next ? `, do hodnosti ${next.name}: ${next.left}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} do hodnosti „${next.name}“` : `${xp} — najvyššia hodnosť`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "partií",
    won: "výhier",
    busts: "kôl nad 21",
    rounds: "kôl",
    roundsWon: "kôl s bodom",
    standAvg: "priemer pri „Stačí“",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Odznaky · ${earned} z ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (ešte nezískaný)"}`,

  more: "Rozšírené štatistiky",
  moreLabel: "Rozšírené štatistiky v Oczko Pro",
  moreNote: "Režimy, výsledky proti každému súperovi, ďalší súper — v Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Ďalší súper",
  /** "Výhry s Olinkou: 2 z 3" (withName: the name in the instrumental). */
  nextReason: (withName: string, won: number, matches: number) => `Výhry ${withPrep(withName)}: ${won} z ${matches}`,
  play: "Zahrať",

  modes: "Režimy",
  family: "Rodinná hra",
  bank: "S bankárom",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `${x.matchesWon}/${x.matches} partií · ${x.roundsWon}/${x.rounds} kôl`,
  rivals: "Súperi",
  rivalLine: (won: number, matches: number) => `${won} z ${matches}`,

  history: "História partií",
  historyLink: "História partií ›",
  reset: "Vynulovať štatistiky",
  resetTitle: "Vynulovať štatistiky?",
  resetMessage: "Hodnosť, odznaky a výsledky začnú odznova. História partií sa nezmení.",
  resetConfirm: "Vynulovať",
};
