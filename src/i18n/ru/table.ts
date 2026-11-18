// Russian: texts of the table (statuses, captions, headlines, hints, panels,
// effects, the coach). Gender-neutral (no past tense about people at the table).
import type { HandValue, Special } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { common, gen, toPoints } from "./common";

export const table: typeof pl.table = {
  /** The two moves (buttons, the coach's bars). */
  actions: {
    hit: "Ещё",
    stand: "Хватит",
    hitHint: "Берёт одну карту из колоды",
    standHint: "Заканчивает набор карт в этом раунде",
    skip: "Показать результат",
    skipHint: "Сразу доигрывает остаток раунда",
  },
  /** The short label under a seat. */
  status: {
    thinking: "думает…",
    persian: "Два туза!",
    stood: "Хватит",
    bust: "Перебор!",
    maxed: "Полная рука",
    playing: "ходит",
  },
  /** A hand in words: "Оля: 19", "Галя: перебор (24)". */
  hand: {
    /** Pontoon / five cards: "Ola: Pontoon". */
    special: (name: string, label: string) => `${name}: ${label}`,
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: два туза`,
    bust: (name: string, total: number) => `${name}: перебор (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Оля — 19", "Галя — перебор (24)" (no case ending on the name). */
  reveal: {
    special: (name: string, label: string) => `${name}: ${label}`,
    cards: (name: string, n: number) => `${name} — ${common.cards(n)}`,
    persian: (name: string) => `${name} — два туза`,
    bust: (name: string, total: number) => `${name} — перебор (${total})`,
    total: (name: string, total: number) => `${name} — ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Новая карта: ${card}. У тебя ${total}`,
    hit: (name: string) => `${name} берёт карту`,
    myStand: (total: number) => `Хватит на ${total}`,
    stand: (name: string) => `${name}: Хватит`,
    myBust: (total: number) => `Перебор! У тебя ${total}`,
    bust: (name: string) => `${name}: Перебор!`,
    myPersian: "Два туза!",
    persian: (name: string) => `${name}: Два туза!`,
    myMaxed: "Полная рука — карт больше не будет",
    maxed: (name: string) => `${name}: полная рука`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Раздача",
    dealingBank: (bank: string) => `Раздача · банк: ${bank}`,
    at21: "У тебя 21 — хватит?",
    myTurn: (total: number) => `Твой ход · у тебя ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} думает…`,
    showdown: "Открываем карты",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Партия твоя!",
    matchWon: (name: string) => `Партию выигрывает ${name}`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    bankLine: (won: number, n: number) => `Банк выигрывает ${won} из ${gen(n, "поединка", "поединков")}`,
    bankPoint: (points: number) => `Балл банку (+${points})`,
    bankNoPoint: "Банк без балла",
    duelWon: "Поединок с банком выигран",
    duelLost: "Поединок за банком",
    duelDraw: "Поединок вничью",
    nobody: "Балла нет ни у кого",
    allBust: "У всех перебор",
    draw: "Ничья — без баллов",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "два туза",
    mine: "Балл твой",
    mineSub: (how: string) => `Ближе всех к 21: ты — ${how}`,
    one: (name: string) => `Балл: ${name}`,
    oneSub: (name: string, how: string) => `Ближе всех к 21: ${name} — ${how}`,
    many: (names: string[]) => `Баллы: ${names.join(", ")}`,
    tieSub: (how: string) => `Ничья: ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "«Ещё» — взять карту, «Хватит» — закончить ход. Балл получает сумма, ближайшая к 21.",
    first21: "У тебя 21 — больше не бывает. Скажи «Хватит».",
    firstBust: "Перебор: больше 21 — проигрыш. При 17 и выше каждая карта — большой риск.",
    bank: "Игра с банкиром: каждый играет только с банком, а банк ходит последним и выигрывает ничьи.",
    persian: "Два туза бьют всё.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Понятно",
  /** The top band. */
  top: {
    menu: "Меню",
    round: (n: number) => `Раунд ${n}`,
    myScore: (score: number, target: number) => `Твои баллы: ${score} из ${target}`,
    family: "Семейная игра",
    bank: "С банкиром",
    single: (mode: string) => `${mode} · один раунд`,
    training: (mode: string) => `${mode} · тренировка`,
    match: (mode: string, target: number) => `${mode} · ${toPoints(target)}`,
  },
  stock: (n: number) => `Колода: ${common.cards(n)}`,
  /** "Баллы · до 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Баллы · до ${target}`,
  menu: {
    label: "Меню стола",
    title: "Меню",
    rules: "Правила",
    exit: "Выйти в лобби",
    exitHint: "Партия сохранится",
    giveUp: "Сдать партию",
    leave: "Выйти из-за стола",
    giveUpTitle: "Сдать партию?",
    giveUpMessage: "Партия закончится без сохранения результата.",
    giveUpConfirm: "Сдать",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `перебор, ${total}`,
    total: (total: number) => `сумма ${total}`,
    bank: "банк",
    dealer: "раздаёт",
    bankMark: "БАНК",
    /** The mark on the portrait of whoever deals. */
    dealerMark: "Р",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Твои карты: ${v.persian ? "два туза" : v.bust ? `перебор, ${v.total}` : `${v.total}`}`,
    persian: "два туза",
    bust: "перебор",
    soft: "туз = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "ТТ",
  /** Pontoon's special hands. */
  specials: { pontoon: "Pontoon", fiveCard: "Пять карт" } as Record<Special, string>,
  roundEnd: {
    bust: "Перебор",
    draw: "ничья",
    scores: (rows: { name: string; score: number }[], target: number) =>
      `Баллы: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, игра ${toPoints(target)}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (банк)" : ""}: ${v?.persian ? "два туза" : v?.bust ? `перебор ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · банк" : ""}`,
    replay: "Этот раунд ещё раз",
    next: "Следующий раунд",
    hostDeals: "Хозяин стола раздаёт следующий раунд…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${place}-е место: ${name}, ${common.points(score)}`,
    place: (place: number) => `${place}-е место`,
    badgeA11y: (name: string, desc: string) => `Новый значок: ${name}. ${desc}`,
    badge: (name: string) => `Новый значок: ${name}`,
    rematch: "Реванш",
    rematchHint: "Те же соперники, новые карты",
    newGame: "Новая игра",
    lobby: "В лобби",
  },
  effects: {
    fura: "Перебор!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Два туза!`,
    persianTitle: "Два\nтуза!",
    persianSub: (name: string | null) => (name ? `${name} — два туза бьют всё` : "Два туза — эта рука бьёт всё"),
  },
  trainer: {
    lockedLabel: "Подсказки на сегодня закончились. Больше — в Oczko Pro",
    lockedTitle: "Тренер · подсказки на сегодня закончились",
    lockedMore: "Ещё: Oczko Pro или реклама в настройках (вне раунда).",
    computingLabel: "Тренер считает шансы",
    computing: "Тренер · считаю шансы…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Тренер: риск перебора ${bust}. Шансы на победу: Хватит ${stand}, Ещё ${hit}. Лучше: ${hitBest ? "Ещё" : "Хватит"}.`,
    title: "Тренер",
    bustChance: "Риск перебора: ",
  },
};
