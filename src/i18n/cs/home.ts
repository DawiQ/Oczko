// Czech: texts of the "home" area (the lobby, the tab bar, the settings).
import type { Tab } from "../../home/TabBar";
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — polská hra 21 (Oko bere)",
  title: "Oczko",
  subtitle: "polská hra 21 (Oko bere)",
  settings: "Nastavení",
  newGame: "Nová hra",
  friends: "S přáteli",
  friendsA11y: "S přáteli přes Wi‑Fi",
  training: "Trénink",
  houseRules: "Tvoje domácí pravidla",
  change: "Změnit",
  history: "Historie",
  historySub: "Odehrané partie a záznamy",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Rodinná hra · J 2, Q 3, K 4 · 52 karet", "Dvě esa · Eso za 11"],
  /** A row for screen readers: "Historie. Odehrané partie…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Pokračovat v partii",
    button: "Pokračovat",
    scores: (list: { name: string; score: number }[]) => `Body: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Hrát",
    profile: "Profil",
    rules: "Pravidla",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Nastavení",
    sound: "Zvuk",
    haptics: "Vibrace",
    trainer: "Trenér u stolu",
    trainerSub: "Riziko přetažení a šance na výhru při tvém tahu",
    pace: "Tempo soupeřů",
    slow: "Pomalé",
    normal: "Normální",
    fast: "Rychlé",
    houseRules: "Tvoje domácí pravidla",
    resetTips: "Znovu ukázat nápovědy",
    resetTipsSub: "Rady při prvních situacích",
    language: "Jazyk",
    /** "Automaticky (Čeština)": the phone's language. */
    languageAuto: (current: string) => `Automaticky (${current})`,
  },
};
