// Bosnian-Croatian-Serbian: texts of the "profile" area (rank, statistics,
// badges, next opponent).
import type { pl } from "../pl";
import { withPrep } from "./common";

export const profile: typeof pl.profile = {
  title: "Profil",
  /** Ranks named after cards, weakest first (progress.ts). */
  ranks: ["Devetka", "Desetka", "Dečko", "Dama", "Kralj", "As", "Dva asa"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Dva asa", desc: "Dva asa u jednoj ruci" },
    exact21: { name: "Ravno 21", desc: "Runda završena s 21" },
    fiveCard: { name: "21 s pet karata", desc: "21 s pet ili više karata" },
    edge: { name: "Na granici", desc: "Pobjeda s 21 nakon vučenja na 17 ili više" },
    ironBank: { name: "Nepobjedivi bank", desc: "Bank pobjeđuje u svim dvobojima (2+ igrača)" },
    streak: { name: "Niz", desc: "5 rundi s bodom zaredom" },
    veteran: { name: "Veteran", desc: "100 odigranih partija" },
  },

  rank: "Rang",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Rang: ${name}, iskustvo: ${xp}${next ? `, do ranga ${next.name}: ${next.left}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} do ranga „${next.name}“` : `${xp} — najviši rang`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "partija",
    won: "pobjeda",
    busts: "rundi s tropom",
    rounds: "rundi",
    roundsWon: "rundi s bodom",
    standAvg: "prosjek na „Dosta“",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Značke · ${earned} od ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (još nije osvojena)"}`,

  more: "Proširena statistika",
  moreLabel: "Proširena statistika u Oczko Pro",
  moreNote: "Načini igre, rezultati protiv svakog protivnika, sljedeći protivnik — u Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Sljedeći protivnik",
  /** "Partije s Oljom — pobjede: 2 od 3" (withName: the instrumental). */
  nextReason: (withName: string, won: number, matches: number) => `Partije ${withPrep(withName)} — pobjede: ${won} od ${matches}`,
  play: "Igraj",

  modes: "Načini igre",
  family: "Svi protiv svih",
  bank: "S bankarom",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `${x.matchesWon}/${x.matches} partija · ${x.roundsWon}/${x.rounds} rundi`,
  rivals: "Protivnici",
  rivalLine: (won: number, matches: number) => `${won} od ${matches}`,

  history: "Odigrane partije",
  historyLink: "Odigrane partije ›",
  reset: "Poništi statistiku",
  resetTitle: "Poništiti statistiku?",
  resetMessage: "Rang, značke i rezultati počinju od nule. Odigrane partije ostaju kakve jesu.",
  resetConfirm: "Poništi",
};
