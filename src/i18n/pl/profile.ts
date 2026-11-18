// Polish: texts of the "profile" area (rank, statistics, badges, next rival).
import type { BadgeId } from "../../profile/progress";

export const profile = {
  title: "Profil",
  /** Ranks named after cards (gender-neutral), weakest first (progress.ts). */
  ranks: ["Dziewiątka", "Dziesiątka", "Walet", "Dama", "Król", "As", "Perskie oczko"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Perskie oczko", desc: "Dwa asy w jednej ręce" },
    exact21: { name: "Równe 21", desc: "Runda zakończona z 21" },
    fiveCard: { name: "Oczko z pięciu kart", desc: "21 z pięciu lub więcej kart" },
    edge: { name: "Na krawędzi", desc: "Wygrana z 21 po dobraniu przy 17 lub więcej" },
    ironBank: { name: "Żelazny bank", desc: "Bank wygrywa wszystkie pojedynki (2+ graczy)" },
    streak: { name: "Seria", desc: "5 wygranych rund z rzędu" },
    veteran: { name: "Weteran", desc: "100 rozegranych partii" },
  } as Record<BadgeId, { name: string; desc: string }>,

  rank: "Ranga",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Ranga: ${name}, ${xp} punktów doświadczenia${next ? `, do rangi ${next.name}: ${next.left}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} do rangi „${next.name}”` : `${xp} — najwyższa ranga`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "partii",
    won: "wygranych",
    busts: "rund z furą",
    rounds: "rund",
    roundsWon: "rund z punktem",
    standAvg: "średnio przy „Starczy”",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Odznaki · ${earned} z ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (jeszcze nie zdobyta)"}`,

  more: "Rozszerzone statystyki",
  moreLabel: "Rozszerzone statystyki w Oczko Pro",
  moreNote: "Tryby, wyniki z każdym rywalem, następny rywal — w Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Następny rywal",
  /** "Wygrane z Olą: 2 z 3" (withName: the name after "z"). */
  nextReason: (withName: string, won: number, matches: number) => `Wygrane z ${withName}: ${won} z ${matches}`,
  play: "Zagraj",

  modes: "Tryby",
  family: "Rodzinne",
  bank: "Z bankierem",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `${x.matchesWon}/${x.matches} partii · ${x.roundsWon}/${x.rounds} rund`,
  rivals: "Rywale",
  rivalLine: (won: number, matches: number) => `${won} z ${matches}`,

  history: "Historia partii",
  historyLink: "Historia partii ›",
  reset: "Wyzeruj statystyki",
  resetTitle: "Wyzerować statystyki?",
  resetMessage: "Ranga, odznaki i wyniki zaczną się od nowa. Historii partii to nie zmienia.",
  resetConfirm: "Wyzeruj",
};
