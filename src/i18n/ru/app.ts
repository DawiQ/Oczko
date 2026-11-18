// Russian: texts of the "app" area (the root: resume, confirms, daily limits,
// the settings' extra rows).
import type { pl } from "../pl";
import { toPoints } from "./common";

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `Раунд ${round}`,
    family: "Семейная игра",
    bank: "С банкиром",
    training: "тренировка",
    single: "один раунд",
    target: (points: number) => toPoints(points),
    /** "Семейная игра · до 10 баллов · Ты, Оля, Марк" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "У тебя есть незаконченная партия",
    message: "Новая игра заменит сохранённую — ту уже нельзя будет продолжить.",
    confirm: "Начать новую",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Анализ на сегодня использован",
      text: "Без Oczko Pro — один анализ партии в день. Завтра будет следующий, а ещё один прямо сейчас — за рекламу.",
      proLabel: "Анализ без ограничений",
      adLabel: "+1 анализ сегодня",
    },
    bigTable: {
      title: "Стол на 7–8 человек",
      text: "Без Oczko Pro — один большой стол в день. Сегодняшний уже был — следующий за рекламу или в Oczko Pro.",
      proLabel: "Большие столы без ограничений",
      adLabel: "+1 большой стол сегодня",
    },
    hints: {
      title: "Подсказки тренера",
      text: "Без Oczko Pro — три подсказки в день. Следующую можно получить за рекламу — она показывается только по твоему желанию.",
      proLabel: "Тренер без ограничений",
      adLabel: "+1 подсказка сегодня",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Оформление",
    looksSub: "Колоды, сукна и рубашки",
    hints: "Подсказки тренера",
    hintsSub: (left: number) => `Сегодня осталось: ${left}. Больше — за рекламу или в Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Активно — управление подпиской",
    proSub: "Тренер и анализ без ограничений, большие столы, оформление",
    code: "У меня есть код",
    codeSub: "Промокод Oczko Pro",
    adsPrivacy: "Конфиденциальность рекламы",
    adsPrivacySub: "Согласие на рекламу (ЕС)",
  },
};
