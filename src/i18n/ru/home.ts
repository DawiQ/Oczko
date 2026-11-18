// Russian: texts of the "home" area (the lobby, the tab bar, the settings).
import type { Tab } from "../../home/TabBar";
import type { pl } from "../pl";

export const home: typeof pl.home = {
  logoA11y: "Oczko — польская игра в 21",
  title: "Oczko",
  subtitle: "польская игра в 21",
  settings: "Настройки",
  newGame: "Новая игра",
  friends: "С друзьями",
  friendsA11y: "С друзьями по Wi‑Fi",
  training: "Тренировка",
  houseRules: "Твои домашние правила",
  change: "Изменить",
  history: "История",
  historySub: "Сыгранные партии и повторы",
  /** House rules in two short lines (until the rules come from the onboarding). */
  defaultRulesSummary: ["Семейная игра · В 2, Д 3, К 4 · 52 карты", "Два туза · Туз = 11"],
  /** A row for screen readers: "История. Сыгранные партии…" */
  rowA11y: (title: string, subtitle: string) => `${title}. ${subtitle}`,
  resume: {
    title: "Продолжить партию",
    button: "Продолжить",
    scores: (list: { name: string; score: number }[]) => `Баллы: ${list.map((x) => `${x.name} ${x.score}`).join(", ")}`,
  },
  tabs: {
    play: "Играть",
    profile: "Профиль",
    rules: "Правила",
  } as Record<Tab, string>,
  settingsSheet: {
    title: "Настройки",
    sound: "Звук",
    haptics: "Вибрация",
    trainer: "Тренер за столом",
    trainerSub: "Риск перебора и шансы на победу во время хода",
    pace: "Темп соперников",
    slow: "Медленный",
    normal: "Обычный",
    fast: "Быстрый",
    houseRules: "Твои домашние правила",
    resetTips: "Показать советы заново",
    resetTipsSub: "Подсказки в первых ситуациях",
    language: "Язык",
    /** "Автоматически (Русский)": the phone's language. */
    languageAuto: (current: string) => `Автоматически (${current})`,
  },
};
