// English: texts of the "home" area (the lobby, the tab bar, the settings).
import type { Tab } from "../../home/TabBar";
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — the Polish game of 21",
  title: "Oczko",
  subtitle: "the Polish game of 21",
  settings: "Settings",
  newGame: "New game",
  friends: "With friends",
  friendsA11y: "With friends over Wi‑Fi",
  training: "Practice",
  houseRules: "Your house rules",
  change: "Change",
  history: "History",
  historySub: "Played matches and replays",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Family game · J 2, Q 3, K 4 · 52 cards", "Two aces win · Ace = 11"],
  /** A row for screen readers: "History. Played matches…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Resume match",
    button: "Resume",
    scores: (list: { name: string; score: number }[]) => `Points: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Play",
    profile: "Profile",
    rules: "Rules",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Settings",
    sound: "Sound",
    haptics: "Vibration",
    trainer: "Coach at the table",
    trainerSub: "Chance to bust and chances to win during your move",
    pace: "Opponents' pace",
    slow: "Slow",
    normal: "Normal",
    fast: "Fast",
    houseRules: "Your house rules",
    resetTips: "Show tips again",
    resetTipsSub: "Hints the first time something comes up",
    language: "Language",
    /** "Automatic (English)": the phone's language. */
    languageAuto: (current: string) => `Automatic (${current})`,
  },
};
