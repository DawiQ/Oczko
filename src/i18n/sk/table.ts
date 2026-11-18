// Slovak: texts of the table (statuses, captions, headlines, hints, panels,
// effects, the coach). Gender-neutral (present tense, "ty", names).
import type { HandValue } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { common } from "./common";

/** "do 1 bodu", "do 10 bodov" (genitive after "do"). */
const toPoints = (n: number) => `do ${n} ${n === 1 ? "bodu" : "bodov"}`;

export const table: typeof pl.table = {
  /** The two moves (buttons, the coach's bars). */
  actions: {
    hit: "Ešte",
    stand: "Stačí",
    hitHint: "Vezme jednu kartu z balíčka",
    standHint: "Ukončí branie kariet v tomto kole",
    skip: "Ukázať výsledok",
    skipHint: "Hneď dohrá zvyšok kola",
  },
  /** The short label under a seat. */
  status: {
    thinking: "premýšľa…",
    persian: "Dve esá!",
    stood: "Stačí",
    bust: "Cez!",
    maxed: "Plná ruka",
    playing: "na ťahu",
  },
  /** A hand in words: "Olinka: 19", "Helka: cez (24)". */
  hand: {
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: dve esá`,
    bust: (name: string, total: number) => `${name}: cez (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Olinka má 19", "Helka má cez (24)". */
  reveal: {
    cards: (name: string, n: number) => `${name} má ${common.cards(n)}`,
    persian: (name: string) => `${name} má dve esá`,
    bust: (name: string, total: number) => `${name} má cez (${total})`,
    total: (name: string, total: number) => `${name} má ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Nová karta: ${card}. Máš ${total}`,
    hit: (name: string) => `${name} berie kartu`,
    myStand: (total: number) => `Stačí pri ${total}`,
    stand: (name: string) => `${name}: Stačí`,
    myBust: (total: number) => `Cez! Máš ${total}`,
    bust: (name: string) => `${name}: Cez!`,
    myPersian: "Dve esá!",
    persian: (name: string) => `${name}: Dve esá!`,
    myMaxed: "Plná ruka — ďalšie karty už nie",
    maxed: (name: string) => `${name}: plná ruka`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Rozdávanie",
    dealingBank: (bank: string) => `Rozdávanie · bank: ${bank}`,
    at21: "Máš 21 — Stačí?",
    myTurn: (total: number) => `Tvoj ťah · máš ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} premýšľa…`,
    showdown: "Odkrývanie kariet",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Partia je tvoja!",
    matchWon: (name: string) => `Partiu vyhráva ${name}`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    bankLine: (won: number, n: number) => `Bank vyhráva ${won} z ${n} ${n === 1 ? "súboja" : "súbojov"}`,
    bankPoint: (points: number) => `Bod pre bank (+${points})`,
    bankNoPoint: "Bank bez bodu",
    duelWon: "Súboj s bankom je tvoj",
    duelLost: "Súboj pre bank",
    duelDraw: "Nerozhodný súboj",
    nobody: "Nikto nezíska bod",
    allBust: "Všetci majú cez",
    draw: "Remíza — bez bodov",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "dve esá",
    mine: "Bod pre teba",
    mineSub: (how: string) => `Najbližšie k 21: ty (${how})`,
    one: (name: string) => `Bod pre: ${name}`,
    oneSub: (name: string, how: string) => `Najbližšie k 21: ${name} (${how})`,
    many: (names: string[]) => `Body pre: ${names.join(", ")}`,
    tieSub: (how: string) => `Remíza: ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "„Ešte“ vezme kartu, „Stačí“ ukončí ťah. Bod získa súčet najbližšie k 21.",
    first21: "Máš 21 — vyššie to nejde. Povedz „Stačí“.",
    firstBust: "Cez: viac ako 21 prehráva. Pri 17 a viac je každá ďalšia karta veľké riziko.",
    bank: "Hra s bankárom: každý hrá iba proti banku, bank ide posledný a vyhráva remízy.",
    persian: "Dve esá porazia všetko.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Rozumiem",
  /** The top band. */
  top: {
    menu: "Menu",
    round: (n: number) => `Kolo ${n}`,
    myScore: (score: number, target: number) => `Tvoje body: ${score} z ${target}`,
    family: "Rodinná hra",
    bank: "S bankárom",
    single: (mode: string) => `${mode} · jedno kolo`,
    training: (mode: string) => `${mode} · tréning`,
    match: (mode: string, target: number) => `${mode} · ${toPoints(target)}`,
  },
  stock: (n: number) => `Balíček: ${common.cards(n)}`,
  /** "Body · do 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Body · do ${target}`,
  menu: {
    label: "Menu stola",
    title: "Menu",
    rules: "Pravidlá",
    exit: "Odísť do lobby",
    exitHint: "Partia sa uloží",
    giveUp: "Vzdať partiu",
    leave: "Opustiť stôl",
    giveUpTitle: "Vzdať partiu?",
    giveUpMessage: "Partia sa skončí bez uloženia výsledku.",
    giveUpConfirm: "Vzdať",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `cez, ${total}`,
    total: (total: number) => `súčet ${total}`,
    bank: "bank",
    dealer: "rozdáva",
    bankMark: "BANK",
    /** The mark on the portrait of whoever deals ("rozdáva"). */
    dealerMark: "R",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Tvoja ruka: ${v.persian ? "dve esá" : v.bust ? `cez, ${v.total}` : `${v.total}`}`,
    persian: "dve esá",
    bust: "cez",
    soft: "eso = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "AA",
  roundEnd: {
    bust: "Cez",
    draw: "remíza",
    scores: (rows: { name: string; score: number }[], target: number) => `Body: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, hrá sa do ${target}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (bank)" : ""}: ${v?.persian ? "dve esá" : v?.bust ? `cez ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · bank" : ""}`,
    replay: "Toto kolo ešte raz",
    next: "Ďalšie kolo",
    hostDeals: "Hostiteľ rozdáva ďalšie kolo…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${place}. miesto: ${name}, ${common.points(score)}`,
    place: (place: number) => `${place}. miesto`,
    badgeA11y: (name: string, desc: string) => `Nový odznak: ${name}. ${desc}`,
    badge: (name: string) => `Nový odznak: ${name}`,
    rematch: "Odveta",
    rematchHint: "Tí istí súperi, nové karty",
    newGame: "Nová hra",
    lobby: "Do lobby",
  },
  effects: {
    fura: "Cez!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Dve esá!`,
    persianTitle: "Dve\nesá!",
    persianSub: (name: string | null) => (name ? `${name} — dve esá porazia všetko` : "Dve esá — táto ruka porazí všetko"),
  },
  trainer: {
    lockedLabel: "Dnešné rady sú vyčerpané. Viac v Oczko Pro",
    lockedTitle: "Tréner · dnešné rady vyčerpané",
    lockedMore: "Viac: Oczko Pro alebo reklama v nastaveniach (mimo kola).",
    computingLabel: "Tréner počíta šance",
    computing: "Tréner · počítam šance…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Tréner: šanca prekročiť 21: ${bust}. Šanca na výhru: Stačí ${stand}, Ešte ${hit}. Lepšie: ${hitBest ? "Ešte" : "Stačí"}.`,
    title: "Tréner",
    bustChance: "Šanca prekročiť 21: ",
  },
};
