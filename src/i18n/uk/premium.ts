// Ukrainian: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { pl } from "../pl";
import { count } from "./common";

/** "1 день", "3 дні", "7 днів". */
const days = (n: number) => count(n, "день", "дні", "днів");

const MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
/** "5 березня 2027 р." (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} р.`;
};

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Хвилинку…",
  adFailed: "Реклама недоступна — спробуй трохи згодом.",
  restore: "Відновити покупки",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Щотижня",
      monthly: "Щомісяця",
      twoMonths: "На 2 місяці",
      threeMonths: "На 3 місяці",
      sixMonths: "На пів року",
      yearly: "Щороку",
      lifetime: "Назавжди",
      other: "Oczko Pro",
    },
    /** "/ рік" in the plan's note. */
    per: {
      weekly: "тиждень",
      monthly: "місяць",
      twoMonths: "2 місяці",
      threeMonths: "3 місяці",
      sixMonths: "пів року",
      yearly: "рік",
    },
    /** "щороку" in the fine print. */
    every: {
      weekly: "щотижня",
      monthly: "щомісяця",
      twoMonths: "кожні 2 місяці",
      threeMonths: "кожні 3 місяці",
      sixMonths: "раз на пів року",
      yearly: "щороку",
    },
    days,
    lifetimeNote: (price: string) => `Одноразово ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} безкоштовно, потім ${price} / ${per}`,
    buy: "Придбати Oczko Pro",
    tryFree: (trialDays: number) => `Спробувати ${days(trialDays)} безкоштовно`,
    buyLifetime: (price: string) => `Придбати назавжди · ${price}`,
    buyFor: (price: string) => `Придбати · ${price}`,
    fineLifetime: "Одноразовий платіж, без поновлень.",
    fineOther: "Умови оплати магазин покаже перед покупкою.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `${days(trialDays)} безкоштовно. Потім ` : ""}${price} ${every}, доки не скасуєш підписку в налаштуваннях магазину — це можна зробити будь-коли.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} БЕЗКОШТОВНО`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Тренер без ліміту",
      history: "Останні 50 партій",
      analysis: "Аналіз кожної партії",
      export: "Експорт історії",
      bigTable: "Столи на 7–8 осіб",
      lanSeats: "Стіл Wi‑Fi до 8 осіб",
      looks: "Усі колоди, сукна й сорочки",
      stats: "Розширена статистика",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Тренер без ліміту", note: "ризик перебору й шанси на виграш на кожному ході" },
      { title: "Аналіз кожної партії", note: "останні 50 партій, повтори, експорт" },
      { title: "Столи на 7–8 осіб", note: "на одному телефоні й через Wi‑Fi (вистачить Pro у господаря)" },
      { title: "Розширена статистика", note: "режими, суперники, наступний суперник" },
      { title: "Колоди, сукна й сорочки", note: "за столом Wi‑Fi усі бачать вигляд господаря" },
    ],
    lead: "Гра та сама — а тренер, аналіз і великі столи без лімітів.",
    buyFailed: "Покупка не вдалася. Спробуй ще раз трохи згодом.",
    pending: "Магазин ще підтверджує оплату — Oczko Pro ввімкнеться саме, щойно це станеться.",
    nothingToRestore: "У цьому обліковому записі магазину не знайдено попередніх покупок Oczko Pro.",
    noStore: "Покупки в цій версії застосунку ще недоступні.",
    noPrices: "Не вдалося отримати ціни з магазину. Перевір з'єднання з інтернетом.",
    plan: "План",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "Маю код",
    terms: "Умови",
    privacy: "Приватність",
  },

  limit: {
    later: "Може, пізніше",
    adLabel: (reward: string) => `Переглянути рекламу: ${reward}`,
    adTitle: (reward: string) => `Переглянути рекламу · ${reward}`,
    adLength: "близько 30 секунд",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Маєш код?",
    leadAndroid: "Введи код Oczko Pro. Підтвердиш його в Google Play — Oczko Pro ввімкнеться у твоєму обліковому записі магазину.",
    leadIos: "Коди Oczko Pro вводять у вікні App Store. Oczko Pro ввімкнеться у твоєму обліковому записі Apple.",
    placeholder: "НАПР. OCZKO2026XYZ",
    code: "Код",
    goAndroid: "Активувати в Google Play",
    goIos: "Ввести код в App Store",
    fine: "Код діє один раз і лише в одному обліковому записі магазину. Oczko Pro з коду можна відновити на іншому пристрої через «Відновити покупки».",
    openFailed: "Не вдалося відкрити магазин. Спробуй ще раз.",
    finishIn: (store: string) => `Заверши в ${store}`,
    stepOpened: (store: string) => `Ми відкрили ${store}`,
    stepConfirm: "Підтверди код у магазині",
    stepBack: "Повернися сюди — ми перевіримо самі",
    checkNow: "Перевірити зараз",
    otherCode: "Ввести інший код",
    checking: "Перевіряю обліковий запис магазину…",
    accepted: "Код прийнято!",
    active: "OCZKO PRO АКТИВНО",
    gives: "Підказки й аналіз без ліміту, великі столи, усі колоди й сукна, без реклами.",
    play: "Грати",
    offline: "Немає з'єднання",
    notYet: "Oczko Pro ще не видно",
    offlineLead: "Не вдалося з'єднатися з магазином. Перевір інтернет і спробуй ще раз.",
    notYetLead: "Магазин ще не підтвердив код у цьому обліковому записі. Можливо:",
    reasons: (store: string) => [
      `• активацію не завершено в ${store},`,
      "• код уже використано або строк його дії минув,",
      "• у магазині виконано вхід в інший обліковий запис,",
      "• магазину потрібно ще трохи часу.",
    ],
    retry: "Перевірити ще раз",
    again: "Ввести код ще раз",
    noExpiry: "Без обмеження строку.",
    renews: (expires: number) => `До ${date(expires)}, потім поновиться в магазині — скасувати можна в налаштуваннях магазину.`,
    validUntil: (expires: number) => `Діє до ${date(expires)}`,
  },

  looks: {
    title: "Вигляд",
    tabs: { deck: "Колоди", felt: "Сукна", back: "Сорочки" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Класична", note: "два кольори" },
      "deck.four": { name: "Чотириколірна", note: "бубни сині, трефи зелені" },
      "deck.large": { name: "Великі індекси", note: "добре видно здалеку" },
      "deck.gold": { name: "Золота", note: "кремова із золотом" },
      "deck.night": { name: "Нічна", note: "темні карти" },
      "felt.green": { name: "Зелене", note: "класичне сукно" },
      "felt.burgundy": { name: "Бордове", note: "тепле й темне" },
      "felt.navy": { name: "Темно-синє", note: "спокійне" },
      "felt.walnut": { name: "Горіх", note: "дерев'яна стільниця" },
      "felt.graphite": { name: "Графіт", note: "сучасне" },
      "back.classic": { name: "Класична", note: "синя в клітинку" },
      "back.copper": { name: "Мідна", note: "" },
      "back.green": { name: "Зелена", note: "" },
      "back.black": { name: "Чорна", note: "" },
      "back.gold": { name: "Золота", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Перегляд: ${deck}, сукно ${felt}, сорочка ${back}`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", вибрано" : ""}${locked ? ", в Oczko Pro" : ""}`,
    inUse: "вибрано",
    /** "до 21:05" — a trial's end. */
    trialUntil: (time: string) => `до ${time}`,
    previewOf: (name: string) => `«${name}» · перегляд`,
    tryIt: "▶ Спробувати 24 год",
    allInPro: "Усі в Pro",
  },
};
