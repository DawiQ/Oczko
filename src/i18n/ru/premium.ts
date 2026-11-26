// Russian: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { pl } from "../pl";
import { count } from "./common";

/** "1 день", "3 дня", "7 дней". */
const days = (n: number) => count(n, "день", "дня", "дней");

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
/** "18 ноября 2026 г." (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} г.`;
};

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Минутку…",
  adFailed: "Реклама недоступна — попробуй чуть позже.",
  restore: "Восстановить покупки",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Неделя",
      monthly: "Месяц",
      twoMonths: "2 месяца",
      threeMonths: "3 месяца",
      sixMonths: "Полгода",
      yearly: "Год",
      lifetime: "Навсегда",
      other: "Oczko Pro",
    },
    /** "/ год" in the plan's note. */
    per: {
      weekly: "неделя",
      monthly: "месяц",
      twoMonths: "2 месяца",
      threeMonths: "3 месяца",
      sixMonths: "полгода",
      yearly: "год",
    },
    /** "каждый год" in the fine print. */
    every: {
      weekly: "каждую неделю",
      monthly: "каждый месяц",
      twoMonths: "каждые 2 месяца",
      threeMonths: "каждые 3 месяца",
      sixMonths: "каждые полгода",
      yearly: "каждый год",
    },
    days,
    lifetimeNote: (price: string) => `Один платёж: ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} бесплатно, потом ${price} / ${per}`,
    buy: "Купить Oczko Pro",
    tryFree: (trialDays: number) => `Попробовать ${days(trialDays)} бесплатно`,
    buyLifetime: (price: string) => `Купить навсегда · ${price}`,
    buyFor: (price: string) => `Купить · ${price}`,
    fineLifetime: "Разовый платёж, без продлений.",
    fineOther: "Условия оплаты магазин покажет перед покупкой.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `Бесплатно ${days(trialDays)}, затем ` : ""}${price} ${every}, пока ты не отменишь подписку в настройках магазина — это можно сделать в любой момент.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} БЕСПЛАТНО`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Тренер без ограничений",
      history: "Последние 50 партий",
      analysis: "Анализ каждой партии",
      export: "Экспорт истории",
      bigTable: "Столы на 7–8 человек",
      lanSeats: "Стол по Wi‑Fi до 8 человек",
      looks: "Все колоды, сукна и рубашки",
      stats: "Расширенная статистика",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Тренер без ограничений", note: "риск перебора и шансы на победу на каждом ходу" },
      { title: "Анализ каждой партии", note: "50 последних партий, повторы, экспорт" },
      { title: "Столы на 7–8 человек", note: "на одном телефоне и по Wi‑Fi (достаточно Pro у хозяина стола)" },
      { title: "Расширенная статистика", note: "режимы, соперники, следующий соперник" },
      { title: "Колоды, сукна и рубашки", note: "за столом по Wi‑Fi все видят оформление хозяина" },
    ],
    lead: "Игра остаётся прежней — а тренер, анализ и большие столы без ограничений.",
    buyFailed: "Покупка не удалась. Попробуй ещё раз чуть позже.",
    pending: "Магазин ещё подтверждает оплату — Oczko Pro включится само, как только это произойдёт.",
    nothingToRestore: "На этом аккаунте магазина не найдено прежних покупок Oczko Pro.",
    noStore: "В этой версии приложения покупки пока недоступны.",
    noPrices: "Не удалось загрузить цены из магазина. Проверь подключение к интернету.",
    plan: "Тариф",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "У меня есть код",
    terms: "Условия",
    privacy: "Конфиденциальность",
  },

  limit: {
    later: "Может, позже",
    adLabel: (reward: string) => `Посмотреть рекламу: ${reward}`,
    adTitle: (reward: string) => `Посмотреть рекламу · ${reward}`,
    adLength: "около 30 секунд",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Есть код?",
    leadAndroid: "Введи код Oczko Pro. Подтвердить его нужно в Google Play — Oczko Pro включится на твоём аккаунте магазина.",
    leadIos: "Коды Oczko Pro вводятся в окне App Store. Oczko Pro включится на твоём аккаунте Apple.",
    placeholder: "НАПР. OCZKO2026XYZ",
    code: "Код",
    goAndroid: "Активировать в Google Play",
    goIos: "Ввести код в App Store",
    fine: "Код действует один раз и только на одном аккаунте магазина. На другом устройстве Oczko Pro по коду восстанавливается через «Восстановить покупки».",
    openFailed: "Не удалось открыть магазин. Попробуй ещё раз.",
    finishIn: (store: string) => `Заверши в ${store}`,
    stepOpened: (store: string) => `Мы открыли ${store}`,
    stepConfirm: "Подтверди код в магазине",
    stepBack: "Вернись сюда — мы всё проверим сами",
    checkNow: "Проверить сейчас",
    otherCode: "Ввести другой код",
    checking: "Проверяю аккаунт магазина…",
    accepted: "Код принят!",
    active: "OCZKO PRO АКТИВНО",
    gives: "Подсказки и анализ без ограничений, большие столы, все колоды и сукна, без рекламы.",
    play: "Играть",
    offline: "Нет связи",
    notYet: "Oczko Pro пока не видно",
    offlineLead: "Не удалось подключиться к магазину. Проверь интернет и попробуй снова.",
    notYetLead: "Магазин ещё не подтвердил код на этом аккаунте. Возможно:",
    reasons: (store: string) => [
      `• активация в ${store} не завершена,`,
      "• код уже использован или истёк,",
      "• в магазине выполнен вход в другой аккаунт,",
      "• магазину нужно ещё немного времени.",
    ],
    retry: "Проверить снова",
    again: "Ввести код ещё раз",
    noExpiry: "Без срока действия.",
    renews: (expires: number) => `До ${date(expires)}, затем подписка продлится в магазине — отменить её можно в настройках магазина.`,
    validUntil: (expires: number) => `Действует до ${date(expires)}`,
  },

  looks: {
    title: "Оформление",
    tabs: { deck: "Колоды", felt: "Сукна", back: "Рубашки" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Классическая", note: "два цвета" },
      "deck.four": { name: "Четырёхцветная", note: "синие бубны, зелёные трефы" },
      "deck.large": { name: "Крупные индексы", note: "видно издалека" },
      "deck.gold": { name: "Золотая", note: "кремовая с золотом" },
      "deck.night": { name: "Ночная", note: "тёмные карты" },
      "felt.green": { name: "Зелёное", note: "классическое сукно" },
      "felt.burgundy": { name: "Бордовое", note: "тёплое и тёмное" },
      "felt.navy": { name: "Тёмно-синее", note: "спокойное" },
      "felt.walnut": { name: "Орех", note: "деревянная столешница" },
      "felt.graphite": { name: "Графит", note: "современное" },
      "back.classic": { name: "Классическая", note: "синяя клетка" },
      "back.copper": { name: "Медная", note: "" },
      "back.green": { name: "Зелёная", note: "" },
      "back.black": { name: "Чёрная", note: "" },
      "back.gold": { name: "Золотая", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Предпросмотр: колода «${deck}», сукно «${felt}», рубашка «${back}»`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", используется" : ""}${locked ? ", в Oczko Pro" : ""}`,
    inUse: "используется",
    /** "до 21:05" — a trial's end. */
    trialUntil: (time: string) => `до ${time}`,
    previewOf: (name: string) => `«${name}» · предпросмотр`,
    tryIt: "▶ Попробовать на 24 ч",
    allInPro: "Все в Pro",
  },
};
