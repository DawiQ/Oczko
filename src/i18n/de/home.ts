// German: texts of the "home" area (the lobby, the tab bar, the settings).
import type { Tab } from "../../home/TabBar";
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — das polnische 17 und 4",
  title: "Oczko",
  subtitle: "das polnische 17 und 4",
  settings: "Einstellungen",
  newGame: "Neues Spiel",
  friends: "Mit Freunden",
  friendsA11y: "Mit Freunden über WLAN",
  training: "Training",
  houseRules: "Deine Hausregeln",
  change: "Ändern",
  history: "Verlauf",
  historySub: "Gespielte Partien und Wiederholungen",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Familienspiel · B 2, D 3, K 4 · 52 Karten", "Feuer (zwei Asse) · Ass = 11"],
  /** A row for screen readers: "Verlauf. Gespielte Partien…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Partie fortsetzen",
    button: "Weiter",
    scores: (list: { name: string; score: number }[]) => `Punkte: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Spielen",
    profile: "Profil",
    rules: "Regeln",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Einstellungen",
    sound: "Ton",
    haptics: "Vibration",
    trainer: "Trainer am Tisch",
    trainerSub: "Risiko, sich zu überkaufen, und Gewinnchancen bei deinem Zug",
    pace: "Tempo der Gegner",
    slow: "Langsam",
    normal: "Normal",
    fast: "Schnell",
    houseRules: "Deine Hausregeln",
    resetTips: "Tipps erneut zeigen",
    resetTipsSub: "Hinweise, wenn etwas zum ersten Mal passiert",
    language: "Sprache",
    /** "Automatisch (Deutsch)": the phone's language. */
    languageAuto: (current: string) => `Automatisch (${current})`,
  },
};
