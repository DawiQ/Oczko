// Russian: texts of the "lan" area (playing with friends over Wi‑Fi).
// Gender-neutral about the host and the guests (no past tense about them).
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";
import { gen } from "./common";

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Хозяин",
  defaultGuest: "Гость",
  /** The host's table as others see it. */
  tableName: (host: string) => `Стол: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Браво",
    oops: "Упс",
    faster: "Быстрее",
    goodGame: "Хорошая игра",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Закрыть стол?",
    message: "Игра закончится для всех за столом.",
  },
  errors: {
    openFailed: "Не удалось открыть стол. Проверь подключение к Wi‑Fi.",
    joinFailed: "Не удалось подключиться к столу.",
    badCode: "В этой сети нет стола с таким кодом.",
  },
  menu: {
    title: "С друзьями",
    subtitle: "Каждый на своём телефоне, в одной сети Wi‑Fi",
    nameLabel: "Твоё имя за столом",
    namePlaceholder: "например, Оля",
    host: "Открыть стол",
    join: "Присоединиться к столу",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Без интернета: телефоны соединяются по локальной сети. ${pro ? `До ${max} человек за столом (Oczko Pro).` : `До ${free} человек за столом (${max} — если у хозяина Oczko Pro).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `По Wi‑Fi: выиграно ${matchesWon} из ${gen(matches, "партии", "партий")} · раунды с баллом: ${roundsWon}/${rounds}`,
  },
  host: {
    subtitle: "Твой стол — друзья подключаются",
    code: "Код стола",
    codeA11y: (spaced: string) => `Код стола: ${spaced}`,
    qr: "QR-код стола — отсканируй его в приложении Oczko",
    noWifi: "Подключи телефон к Wi‑Fi, чтобы показать код стола.",
    seats: (n: number, max: number) => `За столом · ${n} из ${max}`,
    addSeat: "Добавить место",
    mode: "Режим",
    modeA11y: "Режим игры",
    family: "Семейная игра",
    bank: "С банкиром",
    target: "До скольких баллов",
    targetA11y: "Длина партии",
    oneRound: "1 раунд",
    deal: "Раздать карты",
  },
  slot: {
    /** "Оля (ты)" */
    me: (name: string) => `${name} (ты)`,
    online: "в сети",
    offline: "не в сети",
    remove: "Убрать",
    removeA11y: (name: string) => `Убрать: ${name}`,
    botA11y: (name: string, label: string) => `Бот: ${name}, ${label}. Сменить персонажа`,
    botSub: (label: string) => `${label} · нажми, чтобы сменить`,
    free: "Освободить",
    freeA11y: (name: string) => `Освободить место: ${name}`,
    waiting: "Ждём гостя…",
    bot: "Бот",
    botA11yAdd: "Посадить бота",
    removeSeat: "Убрать место",
  },
  join: {
    scanTitle: "Сканировать QR-код",
    cameraNote: "Камера нужна только для того, чтобы отсканировать код стола.",
    allowCamera: "Разрешить камеру",
    title: "Присоединиться к столу",
    found: "Столы в этой сети",
    searching: "Ищу… Если стола не видно, введи код или отсканируй QR-код с телефона хозяина.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, свободных мест: ${open}` : ", другая версия приложения"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "С банкиром" : "Семейная игра"} · свободно: ${open}${playing ? " · идёт игра" : ""}`,
    otherVersion: "Другая версия приложения",
    code: "Код стола",
    codePlaceholder: "например, K7 4Q",
    join: "Войти",
    scan: "Сканировать QR-код",
  },
  guest: {
    table: "Стол",
    connecting: "Подключаюсь…",
    lobby: "Ждём, пока хозяин раздаст карты.",
    full: "За столом нет свободных мест.",
    version: "Другая версия приложения — обновите Oczko.",
    started: "За этим столом игра уже идёт.",
    removed: "Тебя больше нет за столом — это решение хозяина стола.",
    hostLeft: "Стол закрыт хозяином.",
    offline: "Нет связи — переподключаюсь…",
    freeSeat: "Свободное место",
  },
  table: {
    offline: "Нет связи со столом — переподключаюсь…",
    away: (name: string) => `${name}: нет связи. Скоро здесь начнёт играть бот.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} с на ход`,
    myMoveTime: (sec: number) => `Твой ход: ${sec} с, потом «Хватит»`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Ход бота",
    botNowA11y: "Пусть бот сыграет сейчас",
    wait: "Ждать",
    waitA11y: "Подождать ещё",
    reactTitle: "Быстрая реакция",
    reactA11y: (text: string) => `Реакция: ${text}`,
  },
};
