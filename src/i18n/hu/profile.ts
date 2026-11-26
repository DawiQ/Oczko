// Hungarian: texts of the "profile" area (rank, statistics, badges, next rival).
import type { pl } from "../pl";

export const profile: typeof pl.profile = {
  title: "Profil",
  /** Ranks named after cards, weakest first (progress.ts). */
  ranks: ["Kilences", "Tízes", "Alsó", "Felső", "Király", "Ász", "Két ász"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Két ász", desc: "Két ász egy kézben" },
    exact21: { name: "Pontosan 21", desc: "21-gyel befejezett kör" },
    fiveCard: { name: "21 öt lapból", desc: "21 öt vagy több lapból" },
    edge: { name: "Pengeélen", desc: "Győzelem 21-gyel, miután 17-nél vagy többnél is kértél lapot" },
    ironBank: { name: "Vasbank", desc: "A bank minden párharcot megnyer (2+ játékos)" },
    streak: { name: "Sorozat", desc: "5 megnyert kör egymás után" },
    veteran: { name: "Veterán", desc: "100 lejátszott parti" },
  },

  rank: "Rang",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Rang: ${name}, ${xp} tapasztalati pont${next ? `, a következő rangig (${next.name}): ${next.left}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} · következő: „${next.name}”` : `${xp} — a legmagasabb rang`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "parti",
    won: "megnyert",
    busts: "kör túl sokkal",
    rounds: "kör",
    roundsWon: "pontszerző kör",
    standAvg: "átlag megálláskor",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Jelvények · ${earned} / ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (még nincs meg)"}`,

  more: "Bővített statisztikák",
  moreLabel: "Bővített statisztikák az Oczko Pro csomagban",
  moreNote: "Módok, eredmények minden ellenféllel, következő ellenfél — az Oczko Pro csomagban.",
  morePro: "Pro ›",

  nextRival: "Következő ellenfél",
  /** "Olgával: 2 győzelem 3 partiból" (withName: the name with "-val/-vel"). */
  nextReason: (withName: string, won: number, matches: number) => `${withName}: ${won} győzelem ${matches} partiból`,
  play: "Játék",

  modes: "Módok",
  family: "Családi játék",
  bank: "Bankárral",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `${x.matchesWon}/${x.matches} parti · ${x.roundsWon}/${x.rounds} kör`,
  rivals: "Ellenfelek",
  rivalLine: (won: number, matches: number) => `${won} / ${matches}`,

  history: "Partielőzmények",
  historyLink: "Partielőzmények ›",
  reset: "Statisztikák nullázása",
  resetTitle: "Nullázod a statisztikákat?",
  resetMessage: "A rang, a jelvények és az eredmények elölről kezdődnek. A partielőzményeket ez nem érinti.",
  resetConfirm: "Nullázás",
};
