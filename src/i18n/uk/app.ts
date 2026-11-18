// Ukrainian: texts of the "app" area (the root: resume, confirms, daily
// limits, the settings' extra rows).
import type { pl } from "../pl";
import { toPoints } from "./common";

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `Раунд ${round}`,
    family: "Сімейна гра",
    bank: "З банкіром",
    training: "тренування",
    single: "один раунд",
    target: (points: number) => toPoints(points),
    /** "Сімейна гра · до 10 балів · Ти, Оля, Марко" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "У тебе є незавершена партія",
    message: "Нова гра замінить збережену — ту вже не можна буде продовжити.",
    confirm: "Почати нову",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Сьогоднішній аналіз використано",
      text: "Без Oczko Pro — один аналіз партії на день. Завтра буде наступний, а ще один можна отримати зараз — за рекламу.",
      proLabel: "Аналіз без ліміту",
      adLabel: "+1 аналіз сьогодні",
    },
    bigTable: {
      title: "Стіл на 7–8 осіб",
      text: "Без Oczko Pro — один великий стіл на день. Сьогодні він уже був — наступний за рекламу або в Oczko Pro.",
      proLabel: "Великі столи без ліміту",
      adLabel: "+1 великий стіл сьогодні",
    },
    hints: {
      title: "Підказки тренера",
      text: "Без Oczko Pro — три підказки на день. Наступну отримаєш за рекламу — її показують, лише коли ти хочеш.",
      proLabel: "Тренер без ліміту",
      adLabel: "+1 підказка сьогодні",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Вигляд",
    looksSub: "Колоди, сукна й сорочки",
    hints: "Підказки тренера",
    hintsSub: (left: number) => `Сьогодні залишилося: ${left}. Більше — за рекламу або в Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Активно — керувати підпискою",
    proSub: "Тренер і аналіз без ліміту, великі столи, вигляд",
    code: "Маю код",
    codeSub: "Промокод Oczko Pro",
    adsPrivacy: "Приватність реклами",
    adsPrivacySub: "Згоди на рекламу (ЄС)",
  },
};
