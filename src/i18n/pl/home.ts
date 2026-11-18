// Polish: texts of the "home" area (the lobby, the tab bar, the settings).
import type { Tab } from "../../home/TabBar";

export const home = {
  logoA11y: "Oczko — gra w karty do 21",
  title: "Oczko",
  subtitle: "gra w karty do 21",
  settings: "Ustawienia",
  newGame: "Nowa gra",
  friends: "Ze znajomymi",
  friendsA11y: "Ze znajomymi przez Wi‑Fi",
  training: "Trening",
  houseRules: "Jak grasz u siebie",
  change: "Zmień",
  history: "Historia",
  historySub: "Rozegrane partie i powtórki",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Rodzinne · W 2, D 3, K 4 · 52 karty", "Perskie oczko · As za 11"],
  /** A row for screen readers: "Historia. Rozegrane partie…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Wznów partię",
    button: "Wznów",
    scores: (list: { name: string; score: number }[]) => `Punkty: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Graj",
    profile: "Profil",
    rules: "Zasady",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Ustawienia",
    sound: "Dźwięk",
    haptics: "Wibracje",
    trainer: "Trener przy stole",
    trainerSub: "Szansa na furę i szanse wygranej podczas ruchu",
    pace: "Tempo rywali",
    slow: "Wolne",
    normal: "Normalne",
    fast: "Szybkie",
    houseRules: "Jak grasz u siebie",
    resetTips: "Pokaż wskazówki od nowa",
    resetTipsSub: "Podpowiedzi przy pierwszych sytuacjach",
    language: "Język",
    /** "Automatycznie (Polski)": the phone's language. */
    languageAuto: (current: string) => `Automatycznie (${current})`,
  },
};
