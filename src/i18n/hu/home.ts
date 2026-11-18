// Hungarian: texts of the "home" area (the lobby, the tab bar, the settings).
import type { Tab } from "../../home/TabBar";
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — a lengyel huszonegy",
  title: "Oczko",
  subtitle: "a lengyel huszonegy",
  settings: "Beállítások",
  newGame: "Új játék",
  friends: "Barátokkal",
  friendsA11y: "Barátokkal, Wi‑Fi-n",
  training: "Gyakorlás",
  houseRules: "Házi szabályaid",
  change: "Módosítás",
  history: "Előzmények",
  historySub: "Lejátszott partik és visszajátszások",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Családi játék · B 2, D 3, K 4 · 52 kártya", "Két ász · Ász = 11"],
  /** A row for screen readers: "Előzmények. Lejátszott partik…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Parti folytatása",
    button: "Folytatás",
    scores: (list: { name: string; score: number }[]) => `Pontok: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Játék",
    profile: "Profil",
    rules: "Szabályok",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Beállítások",
    sound: "Hang",
    haptics: "Rezgés",
    trainer: "Edző az asztalnál",
    trainerSub: "A túllépés esélye és a nyerési esélyek a lépésednél",
    pace: "Ellenfelek tempója",
    slow: "Lassú",
    normal: "Normál",
    fast: "Gyors",
    houseRules: "Házi szabályaid",
    resetTips: "Tippek mutatása újra",
    resetTipsSub: "Útmutatás, amikor valami először történik",
    language: "Nyelv",
    /** "Automatikus (Magyar)": the phone's language. */
    languageAuto: (current: string) => `Automatikus (${current})`,
  },
};
