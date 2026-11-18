// English: texts of the "profile" area (rank, statistics, badges, next rival).
import type { pl } from "../pl";

export const profile: typeof pl.profile = {
  title: "Profile",
  /** Ranks named after cards, weakest first (progress.ts). */
  ranks: ["Nine", "Ten", "Jack", "Queen", "King", "Ace", "Two aces"],
  /** Badges by id (progress.ts). */
  badges: {
    persian: { name: "Two aces", desc: "Two aces in one hand" },
    exact21: { name: "Exactly 21", desc: "A round finished on 21" },
    fiveCard: { name: "Five-card 21", desc: "21 with five or more cards" },
    edge: { name: "On the edge", desc: "A win with 21 after drawing on 17 or more" },
    ironBank: { name: "Iron bank", desc: "The bank wins every duel (2+ players)" },
    streak: { name: "Streak", desc: "5 rounds won in a row" },
    veteran: { name: "Veteran", desc: "100 matches played" },
  },

  rank: "Rank",
  rankLabel: (name: string, xp: number, next: { name: string; left: number } | null) =>
    `Rank: ${name}, ${xp} experience points${next ? `, ${next.left} more to reach ${next.name}` : ""}`,
  rankProgress: (xp: number, next: { name: string; at: number } | null) => (next ? `${xp} / ${next.at} to “${next.name}”` : `${xp} — top rank`),

  /** Tiles: a number above, these below. */
  tiles: {
    matches: "matches",
    won: "won",
    busts: "rounds gone bust",
    rounds: "rounds",
    roundsWon: "rounds with a point",
    standAvg: "average at “Stay”",
  },
  tileLabel: (label: string, value: string) => `${label}: ${value}`,
  /** "17.4" */
  average: (x: number) => x.toFixed(1),

  badgesHeader: (earned: number, all: number) => `Badges · ${earned} of ${all}`,
  badgeLabel: (name: string, desc: string, earned: boolean) => `${name}: ${desc}${earned ? "" : " (not earned yet)"}`,

  more: "Extended statistics",
  moreLabel: "Extended statistics in Oczko Pro",
  moreNote: "Modes, results against each opponent, next opponent — in Oczko Pro.",
  morePro: "Pro ›",

  nextRival: "Next opponent",
  /** "Wins against Ollie: 2 of 3" (withName is the plain name in English). */
  nextReason: (withName: string, won: number, matches: number) => `Wins against ${withName}: ${won} of ${matches}`,
  play: "Play",

  modes: "Modes",
  family: "Family game",
  bank: "With a banker",
  modeLine: (x: { matchesWon: number; matches: number; roundsWon: number; rounds: number }) => `${x.matchesWon}/${x.matches} matches · ${x.roundsWon}/${x.rounds} rounds`,
  rivals: "Opponents",
  rivalLine: (won: number, matches: number) => `${won} of ${matches}`,

  history: "Match history",
  historyLink: "Match history ›",
  reset: "Reset statistics",
  resetTitle: "Reset statistics?",
  resetMessage: "Rank, badges and results will start over. Your match history stays as it is.",
  resetConfirm: "Reset",
};
