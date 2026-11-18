// Ukrainian: texts of the table (statuses, captions, headlines, hints,
// panels, effects, the trainer). Gender-neutral (present tense, "ти", names).
import type { HandValue } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { eastSlavicForm } from "../plural";
import { common, toPoints } from "./common";

export const table: typeof pl.table = {
  /** The two moves (buttons, the trainer's bars). */
  actions: {
    hit: "Ще",
    stand: "Досить",
    hitHint: "Бере одну карту з колоди",
    standHint: "Більше не бере карт у цьому раунді",
    skip: "Показати результат",
    skipHint: "Розігрує решту раунду одразу",
  },
  /** The short label under a seat. */
  status: {
    thinking: "думає…",
    persian: "Два тузи!",
    stood: "Досить",
    bust: "Перебір!",
    maxed: "Повна рука",
    playing: "ходить",
  },
  /** A hand in words: "Оля: 19", "Галя: перебір (24)". */
  hand: {
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: два тузи`,
    bust: (name: string, total: number) => `${name}: перебір (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Оля має 19", "Галя має перебір (24)". */
  reveal: {
    cards: (name: string, n: number) => `${name} має ${common.cards(n)}`,
    persian: (name: string) => `${name} має два тузи`,
    bust: (name: string, total: number) => `${name} має перебір (${total})`,
    total: (name: string, total: number) => `${name} має ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Узята карта: ${card}. У тебе ${total}`,
    hit: (name: string) => `${name} бере карту`,
    myStand: (total: number) => `Досить на ${total}`,
    stand: (name: string) => `${name}: Досить`,
    myBust: (total: number) => `Перебір! У тебе ${total}`,
    bust: (name: string) => `${name}: Перебір!`,
    myPersian: "Два тузи!",
    persian: (name: string) => `${name}: Два тузи!`,
    myMaxed: "Повна рука — більше карт не можна",
    maxed: (name: string) => `${name}: повна рука`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Роздача",
    dealingBank: (bank: string) => `Роздача · банк: ${bank}`,
    at21: "У тебе 21 — досить?",
    myTurn: (total: number) => `Твій хід · у тебе ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} думає…`,
    showdown: "Карти відкриваються",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Партія твоя!",
    matchWon: (name: string) => `Партію виграє ${name}`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    bankLine: (won: number, n: number) => `Банк виграє ${won} з ${n} ${eastSlavicForm(n) === "one" ? "поєдинку" : "поєдинків"}`,
    bankPoint: (points: number) => `Бал банку (+${points})`,
    bankNoPoint: "Банк без бала",
    duelWon: "Поєдинок з банком виграно",
    duelLost: "Поєдинок за банком",
    duelDraw: "Поєдинок унічию",
    nobody: "Ніхто не отримує бала",
    allBust: "У всіх перебір",
    draw: "Нічия — без балів",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "два тузи",
    mine: "Бал твій",
    mineSub: (how: string) => `Найближче до 21: ти (${how})`,
    one: (name: string) => `Бал отримує ${name}`,
    oneSub: (name: string, how: string) => `Найближче до 21: ${name} (${how})`,
    many: (names: string[]) => `Бали отримують: ${names.join(", ")}`,
    tieSub: (how: string) => `Нічия: у кожного ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "«Ще» бере карту, «Досить» завершує хід. Бал отримує результат, найближчий до 21.",
    first21: "У тебе 21 — більше не буває. Скажи «Досить».",
    firstBust: "Перебір: понад 21 — програш. Від 17 і вище кожна карта — чималий ризик.",
    bank: "Гра з банкіром: кожен грає лише з банком, а банк ходить останнім і виграє нічиї.",
    persian: "Два тузи виграють у будь-якої руки.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Зрозуміло",
  /** The top band. */
  top: {
    menu: "Меню",
    round: (n: number) => `Раунд ${n}`,
    myScore: (score: number, target: number) => `Твої бали: ${score} з ${target}`,
    family: "Сімейна гра",
    bank: "З банкіром",
    single: (mode: string) => `${mode} · один раунд`,
    training: (mode: string) => `${mode} · тренування`,
    match: (mode: string, target: number) => `${mode} · ${toPoints(target)}`,
  },
  stock: (n: number) => `Колода: ${common.cards(n)}`,
  /** "Бали · до 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Бали · до ${target}`,
  menu: {
    label: "Меню стола",
    title: "Меню",
    rules: "Правила",
    exit: "Вийти в лобі",
    exitHint: "Партію буде збережено",
    giveUp: "Здати партію",
    leave: "Залишити стіл",
    giveUpTitle: "Здати партію?",
    giveUpMessage: "Партію буде завершено без запису результату.",
    giveUpConfirm: "Здати",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `перебір, ${total}`,
    total: (total: number) => `результат ${total}`,
    bank: "банк",
    dealer: "роздає",
    bankMark: "БАНК",
    /** The dealer's mark on the portrait. */
    dealerMark: "Р",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Твоя рука: ${v.persian ? "два тузи" : v.bust ? `перебір, ${v.total}` : `${v.total}`}`,
    persian: "два тузи",
    bust: "перебір",
    soft: "туз = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "ТТ",
  roundEnd: {
    bust: "Перебір",
    draw: "нічия",
    scores: (rows: { name: string; score: number }[], target: number) => `Бали: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, до ${target}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (банк)" : ""}: ${v?.persian ? "два тузи" : v?.bust ? `перебір ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · банк" : ""}`,
    replay: "Цей раунд ще раз",
    next: "Наступний раунд",
    hostDeals: "Господар роздає наступний раунд…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `Місце ${place}: ${name}, ${common.points(score)}`,
    place: (place: number) => `Місце ${place}`,
    badgeA11y: (name: string, desc: string) => `Новий значок: ${name}. ${desc}`,
    badge: (name: string) => `Новий значок: ${name}`,
    rematch: "Реванш",
    rematchHint: "Ті самі суперники, нові карти",
    newGame: "Нова гра",
    lobby: "У лобі",
  },
  effects: {
    fura: "Перебір!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Два тузи!`,
    persianTitle: "Два\nтузи!",
    persianSub: (name: string | null) => (name ? `${name} — два тузи виграють усе` : "Два тузи — ця рука виграє все"),
  },
  trainer: {
    lockedLabel: "Сьогоднішні підказки вичерпано. Більше — в Oczko Pro",
    lockedTitle: "Тренер · сьогоднішні підказки вичерпано",
    lockedMore: "Більше: Oczko Pro або реклама в налаштуваннях (поза раундом).",
    computingLabel: "Тренер рахує шанси",
    computing: "Тренер · рахую шанси…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Тренер: ризик перебору ${bust}. Досить ${stand}, Ще ${hit}. Краще: ${hitBest ? "Ще" : "Досить"}.`,
    title: "Тренер",
    bustChance: "Ризик перебору: ",
  },
};
