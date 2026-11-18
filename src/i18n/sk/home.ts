// Slovak: texts of the "home" area (the lobby, the tab bar, the settings).
import type { Tab } from "../../home/TabBar";
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — poľská hra 21 (Oko berie)",
  title: "Oczko",
  subtitle: "poľská hra 21 (Oko berie)",
  settings: "Nastavenia",
  newGame: "Nová hra",
  friends: "S priateľmi",
  friendsA11y: "S priateľmi cez Wi‑Fi",
  training: "Tréning",
  houseRules: "Tvoje domáce pravidlá",
  change: "Zmeniť",
  history: "História",
  historySub: "Odohrané partie a záznamy",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Rodinná hra · J 2, Q 3, K 4 · 52 kariet", "Dve esá vyhrávajú · Eso za 11"],
  /** A row for screen readers: "História. Odohrané partie…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Pokračovať v partii",
    button: "Pokračovať",
    scores: (list: { name: string; score: number }[]) => `Body: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Hrať",
    profile: "Profil",
    rules: "Pravidlá",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Nastavenia",
    sound: "Zvuk",
    haptics: "Vibrácie",
    trainer: "Tréner pri stole",
    trainerSub: "Šanca prekročiť 21 a šance na výhru pri tvojom ťahu",
    pace: "Tempo súperov",
    slow: "Pomalé",
    normal: "Normálne",
    fast: "Rýchle",
    houseRules: "Tvoje domáce pravidlá",
    resetTips: "Znova ukázať rady",
    resetTipsSub: "Nápovedy, keď sa niečo stane prvýkrát",
    language: "Jazyk",
    /** "Automaticky (Slovenčina)": the phone's language. */
    languageAuto: (current: string) => `Automaticky (${current})`,
  },
};
