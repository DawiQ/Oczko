// German: texts of the "profile" area (rank, statistics, badges, next rival).
import type { pl } from "../pl";

export const profile: typeof pl.profile = {
  title: "Profil",
  /** Ranks named after cards, weakest first (progress.ts). */
  ranks: ["Neun", "Zehn", "Bube", "Dame", "König", "Ass", "Feuer"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Feuer", desc: "Zwei Asse auf einer Hand" },
    exact21: { name: "Genau 21", desc: "Runde mit 21 beendet" },
    fiveCard: { name: "21 aus fünf Karten", desc: "21 mit fünf oder mehr Karten" },
    edge: { name: "Auf Messers Schneide", desc: "Sieg mit 21 nach „Noch eine“ bei 17 oder mehr" },
    ironBank: { name: "Eiserne Bank", desc: "Die Bank gewinnt jedes Duell (ab 2 Personen)" },
    streak: { name: "Serie", desc: "5 Runden in Folge gewonnen" },
    veteran: { name: "Routiniert", desc: "100 Partien gespielt" },
  },

  rank: "Rang",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Rang: ${name}, ${xp} Erfahrungspunkte${next ? `, noch ${next.left} bis zum Rang ${next.name}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} bis „${next.name}“` : `${xp} — höchster Rang`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "Partien",
    won: "gewonnen",
    busts: "Runden überkauft",
    rounds: "Runden",
    roundsWon: "Runden mit Punkt",
    standAvg: "Schnitt bei „Genug“",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17,4" */
  average: (x: number) => x.toFixed(1).replace(".", ","),

  badgesHeader: (earned: number, all: number) => `Abzeichen · ${earned} von ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (noch nicht erhalten)"}`,

  more: "Erweiterte Statistiken",
  moreLabel: "Erweiterte Statistiken in Oczko Pro",
  moreNote: "Modi, Bilanz gegen jeden Gegner, nächster Gegner — in Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Nächster Gegner",
  /** "Siege gegen Ella: 2 von 3" (withName is the plain name in German). */
  nextReason: (withName: string, won: number, matches: number) => `Siege gegen ${withName}: ${won} von ${matches}`,
  play: "Spielen",

  modes: "Modi",
  family: "Familienspiel",
  bank: "Mit Bankhalter",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `${x.matchesWon}/${x.matches} Partien · ${x.roundsWon}/${x.rounds} Runden`,
  rivals: "Gegner",
  rivalLine: (won: number, matches: number) => `${won} von ${matches}`,

  history: "Partieverlauf",
  historyLink: "Partieverlauf ›",
  reset: "Statistiken zurücksetzen",
  resetTitle: "Statistiken zurücksetzen?",
  resetMessage: "Rang, Abzeichen und Ergebnisse beginnen von vorn. Der Partieverlauf bleibt erhalten.",
  resetConfirm: "Zurücksetzen",
};
