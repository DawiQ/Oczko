// Ukrainian: texts of the "home" area (the lobby, the tab bar, the settings).
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — польська гра в 21",
  title: "Oczko",
  subtitle: "польська гра в 21",
  settings: "Налаштування",
  newGame: "Нова гра",
  friends: "З друзями",
  friendsA11y: "З друзями через Wi‑Fi",
  training: "Тренування",
  houseRules: "Твої домашні правила",
  change: "Змінити",
  history: "Історія",
  historySub: "Зіграні партії та повтори",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Сімейна гра · В 2, Д 3, К 4 · 52 карти", "Два тузи · Туз — 11"],
  /** A row for screen readers: "Історія. Зіграні партії…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Продовжити партію",
    button: "Продовжити",
    scores: (list: { name: string; score: number }[]) => `Бали: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Грати",
    profile: "Профіль",
    rules: "Правила",
  },
  settingsSheet: {
    title: "Налаштування",
    sound: "Звук",
    haptics: "Вібрація",
    trainer: "Тренер за столом",
    trainerSub: "Ризик перебору й шанси на виграш під час ходу",
    pace: "Темп суперників",
    slow: "Повільний",
    normal: "Звичайний",
    fast: "Швидкий",
    houseRules: "Твої домашні правила",
    resetTips: "Показати поради знову",
    resetTipsSub: "Підказки в перших ситуаціях",
    language: "Мова",
    /** "Автоматично (Українська)": the phone's language. */
    languageAuto: (current: string) => `Автоматично (${current})`,
  },
};
