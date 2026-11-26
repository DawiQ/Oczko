// Bosnian-Croatian-Serbian: texts of the table (statuses, captions, headlines,
// hints, panels, effects, the coach). Gender-neutral (present tense, nouns).
import type { HandValue, Special } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { common, count } from "./common";

export const table: typeof pl.table = {
  /** The two moves (buttons, the coach's bars). */
  actions: {
    hit: "Još",
    stand: "Dosta",
    hitHint: "Uzima jednu kartu iz špila",
    standHint: "Završava vučenje u ovoj rundi",
    skip: "Prikaži rezultat",
    skipHint: "Odmah odigrava ostatak runde",
  },
  /** The short label under a seat. */
  status: {
    thinking: "razmišlja…",
    persian: "Dva asa!",
    stood: "Dosta",
    bust: "Tropa!",
    maxed: "Puna ruka",
    playing: "na potezu",
  },
  /** A hand in words: "Olja: 19", "Jela: tropa (24)". */
  hand: {
    /** Pontoon / five cards: "Ola: Pontoon". */
    special: (name: string, label: string) => `${name}: ${label}`,
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: dva asa`,
    bust: (name: string, total: number) => `${name}: tropa (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Olja ima 19", "Jela ima tropu (24)". */
  reveal: {
    special: (name: string, label: string) => `${name} ima: ${label}`,
    cards: (name: string, n: number) => `${name} ima ${count(n, "kartu", "karte", "karata")}`,
    persian: (name: string) => `${name} ima dva asa`,
    bust: (name: string, total: number) => `${name} ima tropu (${total})`,
    total: (name: string, total: number) => `${name} ima ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Izvučena karta: ${card}. Imaš ${total}`,
    hit: (name: string) => `${name} vuče kartu`,
    myStand: (total: number) => `Dosta na ${total}`,
    stand: (name: string) => `${name}: Dosta`,
    myBust: (total: number) => `Tropa! Imaš ${total}`,
    bust: (name: string) => `${name}: Tropa!`,
    myPersian: "Dva asa!",
    persian: (name: string) => `${name}: Dva asa!`,
    myMaxed: "Puna ruka — nema više vučenja",
    maxed: (name: string) => `${name}: puna ruka`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Dijeljenje",
    dealingBank: (bank: string) => `Dijeljenje · bank: ${bank}`,
    at21: "Imaš 21 — Dosta?",
    myTurn: (total: number) => `Tvoj potez · imaš ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} razmišlja…`,
    showdown: "Otkrivanje karata",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Partija je tvoja!",
    matchWon: (name: string) => `Partiju osvaja ${name}`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    /** "od 1 dvoboja", "od 5 dvoboja": the genitive is the same. */
    bankLine: (won: number, n: number) => `Bank pobjeđuje u ${won} od ${n} dvoboja`,
    bankPoint: (points: number) => `Bod za bank (+${points})`,
    bankNoPoint: "Bank bez boda",
    duelWon: "Pobjeda u dvoboju s bankom",
    duelLost: "Dvoboj ide banku",
    duelDraw: "Dvoboj bez pobjednika",
    nobody: "Bod ne ide nikome",
    allBust: "Svi imaju tropu",
    draw: "Neriješeno — bez bodova",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "dva asa",
    mine: "Bod je tvoj",
    mineSub: (how: string) => `Najbliže 21: ti (${how})`,
    one: (name: string) => `Bod za: ${name}`,
    oneSub: (name: string, how: string) => `Najbliže 21: ${name} (${how})`,
    many: (names: string[]) => `Bodovi za: ${names.join(", ")}`,
    tieSub: (how: string) => `Neriješeno: ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "„Još“ uzima kartu, „Dosta“ završava potez. Bod ide rezultatu najbližem 21.",
    first21: "Imaš 21 — više od toga ne ide. Reci „Dosta“.",
    firstBust: "Tropa: više od 21 gubi. Na 17 i više svaka karta je velik rizik.",
    bank: "Igra s bankarom: svi igraju samo protiv banka, a bank igra posljednji i pobjeđuje pri neriješenom.",
    persian: "Dva asa pobjeđuju sve.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Razumijem",
  /** The top band. */
  top: {
    menu: "Meni",
    round: (n: number) => `Runda ${n}`,
    myScore: (score: number, target: number) => `Tvoji bodovi: ${score} od ${target}`,
    family: "Svi protiv svih",
    bank: "S bankarom",
    single: (mode: string) => `${mode} · jedna runda`,
    training: (mode: string) => `${mode} · trening`,
    match: (mode: string, target: number) => `${mode} · do ${target}`,
  },
  stock: (n: number) => `Špil: ${common.cards(n)}`,
  /** "Bodovi · do 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Bodovi · do ${target}`,
  menu: {
    label: "Meni stola",
    title: "Meni",
    rules: "Pravila",
    exit: "Nazad na početak",
    exitHint: "Partija će biti sačuvana",
    giveUp: "Predaj partiju",
    leave: "Ustani od stola",
    giveUpTitle: "Predati partiju?",
    giveUpMessage: "Partija će se završiti bez upisa rezultata.",
    giveUpConfirm: "Predaj",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `tropa, ${total}`,
    total: (total: number) => `rezultat ${total}`,
    bank: "bank",
    dealer: "dijeli",
    bankMark: "BANK",
    /** The mark on the portrait of whoever deals ("dijeli"). */
    dealerMark: "D",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Tvoja ruka: ${v.persian ? "dva asa" : v.bust ? `tropa, ${v.total}` : `${v.total}`}`,
    persian: "dva asa",
    bust: "tropa",
    soft: "as = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "AA",
  /** Pontoon's special hands. */
  specials: { pontoon: "Pontoon", fiveCard: "Pet karata" } as Record<Special, string>,
  roundEnd: {
    bust: "Tropa",
    draw: "neriješeno",
    scores: (rows: { name: string; score: number }[], target: number) => `Bodovi: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, igra se do ${target}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (bank)" : ""}: ${v?.persian ? "dva asa" : v?.bust ? `tropa ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · bank" : ""}`,
    replay: "Ova runda još jednom",
    next: "Sljedeća runda",
    hostDeals: "Domaćin dijeli sljedeću rundu…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${place}. mjesto: ${name}, ${common.points(score)}`,
    place: (place: number) => `${place}. mjesto`,
    badgeA11y: (name: string, desc: string) => `Nova značka: ${name}. ${desc}`,
    badge: (name: string) => `Nova značka: ${name}`,
    rematch: "Revanš",
    rematchHint: "Isti protivnici, nove karte",
    newGame: "Nova igra",
    lobby: "Na početak",
  },
  effects: {
    fura: "Tropa!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Dva asa!`,
    persianTitle: "Dva\nasa!",
    persianSub: (name: string | null) => (name ? `${name} — dva asa pobjeđuju sve` : "Dva asa — ova ruka pobjeđuje sve"),
  },
  trainer: {
    lockedLabel: "Današnji savjeti su potrošeni. Više uz Oczko Pro",
    lockedTitle: "Trener · današnji savjeti potrošeni",
    lockedMore: "Više: Oczko Pro ili reklama u opcijama (izvan runde).",
    computingLabel: "Trener računa šanse",
    computing: "Trener · računam šanse…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Trener: rizik trope ${bust}. Šanse za pobjedu: Dosta ${stand}, Još ${hit}. Bolje: ${hitBest ? "Još" : "Dosta"}.`,
    title: "Trener",
    bustChance: "Rizik trope: ",
  },
};
