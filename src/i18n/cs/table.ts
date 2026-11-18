// Czech: texts of the table (statuses, captions, headlines, hints, panels,
// effects, the trainer). Gender-neutral (present tense, "ty", names).
import type { HandValue, Special } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { common, toPoints } from "./common";

export const table: typeof pl.table = {
  /** The two moves (buttons, the trainer's bars). */
  actions: {
    hit: "Ještě",
    stand: "Stačí",
    hitHint: "Vezme jednu kartu z balíčku",
    standHint: "Ukončí braní v tomto kole",
    skip: "Ukázat výsledek",
    skipHint: "Dohraje zbytek kola hned",
  },
  /** The short label under a seat. */
  status: {
    thinking: "přemýšlí…",
    persian: "Dvě esa!",
    stood: "Stačí",
    bust: "Přes!",
    maxed: "Plná ruka",
    playing: "na tahu",
  },
  /** A hand in words: "Olina: 19", "Hela: přes (24)". */
  hand: {
    /** Pontoon / five cards: "Ola: Pontoon". */
    special: (name: string, label: string) => `${name}: ${label}`,
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: dvě esa`,
    bust: (name: string, total: number) => `${name}: přes (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Olina má 19", "Hela má přes (24)". */
  reveal: {
    special: (name: string, label: string) => `${name} má ${label}`,
    cards: (name: string, n: number) => `${name} má ${common.cards(n)}`,
    persian: (name: string) => `${name} má dvě esa`,
    bust: (name: string, total: number) => `${name} má přes (${total})`,
    total: (name: string, total: number) => `${name} má ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Nová karta: ${card}. Máš ${total}`,
    hit: (name: string) => `${name} bere kartu`,
    myStand: (total: number) => `Stačí na ${total}`,
    stand: (name: string) => `${name}: Stačí`,
    myBust: (total: number) => `Přes! Máš ${total}`,
    bust: (name: string) => `${name}: Přes!`,
    myPersian: "Dvě esa!",
    persian: (name: string) => `${name}: Dvě esa!`,
    myMaxed: "Plná ruka — už nebereš",
    maxed: (name: string) => `${name}: plná ruka`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Rozdání",
    dealingBank: (bank: string) => `Rozdání · bank: ${bank}`,
    at21: "Máš 21 — Stačí?",
    myTurn: (total: number) => `Tvůj tah · máš ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} přemýšlí…`,
    showdown: "Odkrývání karet",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Partie je tvoje!",
    matchWon: (name: string) => `Partii vyhrává ${name}`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    bankLine: (won: number, n: number) => `Bank vyhrává ${won} z ${n} ${n === 1 ? "souboje" : "soubojů"}`,
    bankPoint: (points: number) => `Bod pro bank (+${points})`,
    bankNoPoint: "Bank bez bodu",
    duelWon: "Vyhraný souboj s bankem",
    duelLost: "Souboj pro bank",
    duelDraw: "Souboj nerozhodně",
    nobody: "Nikdo nezíská bod",
    allBust: "Všichni mají přes",
    draw: "Remíza — bez bodů",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "dvě esa",
    mine: "Bod pro tebe",
    mineSub: (how: string) => `Nejblíž 21: ty (${how})`,
    one: (name: string) => `Bod pro: ${name}`,
    oneSub: (name: string, how: string) => `Nejblíž 21: ${name} (${how})`,
    many: (names: string[]) => `Body pro: ${names.join(", ")}`,
    tieSub: (how: string) => `Remíza: ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "„Ještě“ bere kartu, „Stačí“ končí tah. Bod dostane, kdo je nejblíž 21.",
    first21: "Máš 21 — výš to nejde. Řekni „Stačí“.",
    firstBust: "Přes: víc než 21 prohrává. Od 17 výš je každá další karta velké riziko.",
    bank: "Hra s bankéřem: každý hraje jen s bankem, bank hraje poslední a vyhrává remízy.",
    persian: "Dvě esa vyhrávají nad vším.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Rozumím",
  /** The top band. */
  top: {
    menu: "Menu",
    round: (n: number) => `Kolo ${n}`,
    myScore: (score: number, target: number) => `Tvoje body: ${score} z ${target}`,
    family: "Rodinná hra",
    bank: "S bankéřem",
    single: (mode: string) => `${mode} · jedno kolo`,
    training: (mode: string) => `${mode} · trénink`,
    match: (mode: string, target: number) => `${mode} · ${toPoints(target)}`,
  },
  stock: (n: number) => `Balíček: ${common.cards(n)}`,
  /** "Body · do 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Body · do ${target}`,
  menu: {
    label: "Menu stolu",
    title: "Menu",
    rules: "Pravidla",
    exit: "Odejít do lobby",
    exitHint: "Partie se uloží",
    giveUp: "Vzdát partii",
    leave: "Opustit stůl",
    giveUpTitle: "Vzdát partii?",
    giveUpMessage: "Partie skončí bez uložení výsledku.",
    giveUpConfirm: "Vzdát",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `přes, ${total}`,
    total: (total: number) => `součet ${total}`,
    bank: "bank",
    dealer: "rozdává",
    bankMark: "BANK",
    /** The mark on the portrait of whoever deals ("rozdává"). */
    dealerMark: "R",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Tvoje ruka: ${v.persian ? "dvě esa" : v.bust ? `přes, ${v.total}` : `${v.total}`}`,
    persian: "dvě esa",
    bust: "přes",
    soft: "eso = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "AA",
  /** Pontoon's special hands. */
  specials: { pontoon: "Pontoon", fiveCard: "Pět karet" } as Record<Special, string>,
  roundEnd: {
    bust: "Přes",
    draw: "remíza",
    scores: (rows: { name: string; score: number }[], target: number) => `Body: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, do ${target}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (bank)" : ""}: ${v?.persian ? "dvě esa" : v?.bust ? `přes ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · bank" : ""}`,
    replay: "Toto kolo znovu",
    next: "Další kolo",
    hostDeals: "Další kolo rozdá hostitel…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${place}. místo: ${name}, ${common.points(score)}`,
    place: (place: number) => `${place}. místo`,
    badgeA11y: (name: string, desc: string) => `Nový odznak: ${name}. ${desc}`,
    badge: (name: string) => `Nový odznak: ${name}`,
    rematch: "Odveta",
    rematchHint: "Stejní soupeři, nové karty",
    newGame: "Nová hra",
    lobby: "Do lobby",
  },
  effects: {
    fura: "Přes!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Dvě esa!`,
    persianTitle: "Dvě\nesa!",
    persianSub: (name: string | null) => (name ? `${name} — dvě esa vyhrávají nad vším` : "Dvě esa — tahle ruka vyhrává nad vším"),
  },
  trainer: {
    lockedLabel: "Dnešní rady jsou vyčerpané. Víc v Oczko Pro",
    lockedTitle: "Trenér · dnešní rady vyčerpané",
    lockedMore: "Víc: Oczko Pro nebo reklama v nastavení (mimo kolo).",
    computingLabel: "Trenér počítá šance",
    computing: "Trenér · počítám šance…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Trenér: riziko přetažení ${bust}. Šance na výhru: „Stačí“ ${stand}, „Ještě“ ${hit}. Lepší: „${hitBest ? "Ještě" : "Stačí"}“.`,
    title: "Trenér",
    bustChance: "Riziko přetažení: ",
  },
};
