// Bosnian-Croatian-Serbian: texts of the "home" area (the lobby, the tab bar,
// the settings).
import type { Tab } from "../../home/TabBar";
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — poljska igra 21, ajnc",
  title: "Oczko",
  subtitle: "poljska igra 21 · ajnc",
  settings: "Opcije",
  newGame: "Nova igra",
  friends: "S prijateljima",
  friendsA11y: "S prijateljima preko Wi‑Fi mreže",
  training: "Trening",
  houseRules: "Tvoja kućna pravila",
  change: "Promijeni",
  history: "Odigrane partije",
  historySub: "Rezultati i snimci partija",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Svi protiv svih · J 2, Q 3, K 4 · 52 karte", "Dva asa pobjeđuju · As = 11"],
  /** A row for screen readers: "Odigrane partije. Rezultati…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Nastavi partiju",
    button: "Nastavi",
    scores: (list: { name: string; score: number }[]) => `Bodovi: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Igraj",
    profile: "Profil",
    rules: "Pravila",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Opcije",
    sound: "Zvuk",
    haptics: "Vibracija",
    trainer: "Trener za stolom",
    trainerSub: "Rizik trope i šanse za pobjedu dok si na potezu",
    pace: "Tempo protivnika",
    slow: "Sporo",
    normal: "Normalno",
    fast: "Brzo",
    houseRules: "Tvoja kućna pravila",
    resetTips: "Opet prikaži savjete",
    resetTipsSub: "Savjeti kad se nešto dogodi prvi put",
    language: "Jezik",
    /** "Automatski (Bosanski · Hrvatski · Srpski)": the phone's language. */
    languageAuto: (current: string) => `Automatski (${current})`,
  },
};
