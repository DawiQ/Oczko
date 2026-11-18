// Ukrainian: texts of the "lan" area (playing with friends over Wi‑Fi).
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";
import { eastSlavicForm } from "../plural";
import { common } from "./common";

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Господар",
  defaultGuest: "Гість",
  /** The host's table as others see it. */
  tableName: (host: string) => `Стіл: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Браво",
    oops: "Ой",
    faster: "Швидше",
    goodGame: "Гарна гра",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Закрити стіл?",
    message: "Гра завершиться для всіх за столом.",
  },
  errors: {
    openFailed: "Не вдалося відкрити стіл. Перевір з'єднання з Wi‑Fi.",
    joinFailed: "Не вдалося під'єднатися до стола.",
    badCode: "У цій мережі немає стола з таким кодом.",
  },
  menu: {
    title: "З друзями",
    subtitle: "Кожен на своєму телефоні, в одній мережі Wi‑Fi",
    nameLabel: "Твоє ім'я за столом",
    namePlaceholder: "напр. Оля",
    host: "Відкрити стіл",
    join: "Приєднатися до стола",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Без інтернету: телефони з'єднуються в локальній мережі. ${pro ? `До ${max} осіб за столом (Oczko Pro).` : `До ${free} осіб за столом (${max} — якщо в господаря Oczko Pro).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Через Wi‑Fi: виграно ${matchesWon} з ${matches} ${eastSlavicForm(matches) === "one" ? "партії" : "партій"} · раундів із балом: ${roundsWon}/${rounds}`,
  },
  host: {
    subtitle: "Твій стіл — друзі приєднуються",
    code: "Код стола",
    codeA11y: (spaced: string) => `Код стола: ${spaced}`,
    qr: "QR-код стола — відскануй у застосунку Oczko",
    noWifi: "Під'єднай телефон до Wi‑Fi, щоб показати код стола.",
    seats: (n: number, max: number) => `За столом · ${n} з ${max}`,
    addSeat: "Додати місце",
    mode: "Режим",
    modeA11y: "Режим гри",
    family: "Сімейна гра",
    bank: "З банкіром",
    target: "До скількох балів",
    targetA11y: "Тривалість партії",
    oneRound: common.rounds(1),
    deal: "Роздати карти",
  },
  slot: {
    /** "Оля (Ти)" */
    me: (name: string) => `${name} (Ти)`,
    online: "на зв'язку",
    offline: "немає зв'язку",
    remove: "Прибрати",
    removeA11y: (name: string) => `Прибрати: ${name}`,
    botA11y: (name: string, label: string) => `Бот: ${name}, ${label}. Змінити персонажа`,
    botSub: (label: string) => `${label} · торкнися, щоб змінити`,
    free: "Вільне",
    freeA11y: (name: string) => `Звільнити місце: ${name}`,
    waiting: "Чекає на гостя…",
    bot: "Бот",
    botA11yAdd: "Посадити бота",
    removeSeat: "Прибрати місце",
  },
  join: {
    scanTitle: "Сканувати QR-код",
    cameraNote: "Камера потрібна лише для того, щоб відсканувати код стола.",
    allowCamera: "Дозволити камеру",
    title: "Приєднатися до стола",
    found: "Столи в цій мережі",
    searching: "Шукаю… Якщо стола не видно, введи код або відскануй QR-код з телефона господаря.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, вільних місць: ${open}` : ", інша версія застосунку"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "З банкіром" : "Сімейна гра"} · вільно: ${open}${playing ? " · гра триває" : ""}`,
    otherVersion: "Інша версія застосунку",
    code: "Код стола",
    codePlaceholder: "напр. K7 4Q",
    join: "Приєднатися",
    scan: "Сканувати QR-код",
  },
  guest: {
    table: "Стіл",
    connecting: "Під'єднуюся…",
    lobby: "Чекаємо, поки господар роздасть карти.",
    full: "За столом немає вільних місць.",
    version: "Інша версія застосунку — оновіть Oczko.",
    started: "Гра за цим столом уже триває.",
    removed: "Тебе прибрано з-за стола — рішення господаря.",
    hostLeft: "Стіл закрито — рішення господаря.",
    offline: "Немає з'єднання — під'єднуюся знову…",
    freeSeat: "Вільне місце",
  },
  table: {
    offline: "Немає з'єднання зі столом — під'єднуюся знову…",
    away: (name: string) => `${name} — немає зв'язку. Незабаром зіграє бот.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} с на хід`,
    myMoveTime: (sec: number) => `Твій хід: ${sec} с, потім «Досить»`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Бот зараз",
    botNowA11y: "Нехай бот зіграє зараз",
    wait: "Чекати",
    waitA11y: "Почекати довше",
    reactTitle: "Швидка реакція",
    reactA11y: (text: string) => `Реакція: ${text}`,
  },
};
