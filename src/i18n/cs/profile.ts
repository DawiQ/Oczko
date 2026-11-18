// Czech: texts of the "profile" area (rank, statistics, badges, next rival).
import type { pl } from "../pl";

/** "s Olinou", "se Zuzkou" (the preposition before the instrumental). */
const withPrep = (withName: string) => (/^[sSzZšŠžŽ]/.test(withName) ? `se ${withName}` : `s ${withName}`);

export const profile: typeof pl.profile = {
  title: "Profil",
  /** Ranks named after cards (gender-neutral), weakest first (progress.ts). */
  ranks: ["Devítka", "Desítka", "Kluk", "Dáma", "Král", "Eso", "Dvě esa"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Dvě esa", desc: "Eso a eso v jedné ruce" },
    exact21: { name: "Přesně 21", desc: "Kolo zakončené s 21" },
    fiveCard: { name: "Oczko z pěti karet", desc: "21 z pěti nebo více karet" },
    edge: { name: "Na hraně", desc: "Výhra s 21 po „Ještě“ na 17 nebo víc" },
    ironBank: { name: "Železný bank", desc: "Bank vyhraje všechny souboje (2+ hráčů)" },
    streak: { name: "Série", desc: "5 vyhraných kol za sebou" },
    veteran: { name: "Stovka", desc: "100 odehraných partií" },
  },

  rank: "Hodnost",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Hodnost: ${name}, zkušenosti: ${xp}${next ? `, do hodnosti ${next.name} zbývá: ${next.left}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} do hodnosti „${next.name}“` : `${xp} — nejvyšší hodnost`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "partií",
    won: "výher",
    busts: "přetažení",
    rounds: "kol",
    roundsWon: "kol s bodem",
    standAvg: "průměr při „Stačí“",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Odznaky · ${earned} z ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (zatím nezískaný)"}`,

  more: "Rozšířené statistiky",
  moreLabel: "Rozšířené statistiky v Oczko Pro",
  moreNote: "Režimy, výsledky s každým soupeřem, další soupeř — v Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Další soupeř",
  /** "Výhry s Olinou: 2 z 3" (withName: the instrumental, without "s"/"se"). */
  nextReason: (withName: string, won: number, matches: number) => `Výhry ${withPrep(withName)}: ${won} z ${matches}`,
  play: "Hrát",

  modes: "Režimy",
  family: "Rodinná hra",
  bank: "S bankéřem",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `partie ${x.matchesWon}/${x.matches} · kola ${x.roundsWon}/${x.rounds}`,
  rivals: "Soupeři",
  rivalLine: (won: number, matches: number) => `${won} z ${matches}`,

  history: "Historie partií",
  historyLink: "Historie partií ›",
  reset: "Vynulovat statistiky",
  resetTitle: "Vynulovat statistiky?",
  resetMessage: "Hodnost, odznaky a výsledky začnou od nuly. Historii partií to nezmění.",
  resetConfirm: "Vynulovat",
};
