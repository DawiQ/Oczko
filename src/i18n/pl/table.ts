// Polish: texts of the table (statuses, captions, headlines, hints, panels,
// effects, the trainer). Gender-neutral (no "dobrałeś/dobrałaś").
import type { HandValue, Special } from "../../engine/score";
import type { HintId } from "../../table/hints";
import { plural } from "../plural";
import { common } from "./common";

export const table = {
  /** The two moves (buttons, the trainer's bars). */
  actions: {
    hit: "Dobieram",
    stand: "Starczy",
    hitHint: "Bierze jedną kartę z talii",
    standHint: "Kończy dobieranie w tej rundzie",
    skip: "Pokaż wynik",
    skipHint: "Rozgrywa resztę rundy od razu",
  },
  /** The short label under a seat. */
  status: {
    thinking: "myśli…",
    persian: "Perskie oczko!",
    stood: "Starczy",
    bust: "Fura!",
    maxed: "Komplet kart",
    playing: "na ruchu",
  },
  /** A hand in words: "Ola: 19", "Hela: fura (24)". */
  hand: {
    /** Pontoon / five cards: "Ola: Pontoon". */
    special: (name: string, label: string) => `${name}: ${label}`,
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: perskie oczko`,
    bust: (name: string, total: number) => `${name}: fura (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Ola ma 19", "Hela ma furę (24)". */
  reveal: {
    special: (name: string, label: string) => `${name} ma ${label}`,
    cards: (name: string, n: number) => `${name} ma ${common.cards(n)}`,
    persian: (name: string) => `${name} ma perskie oczko`,
    bust: (name: string, total: number) => `${name} ma furę (${total})`,
    total: (name: string, total: number) => `${name} ma ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Dobrana karta: ${card}. Masz ${total}`,
    hit: (name: string) => `${name} dobiera kartę`,
    myStand: (total: number) => `Starczy przy ${total}`,
    stand: (name: string) => `${name}: Starczy`,
    myBust: (total: number) => `Fura! Masz ${total}`,
    bust: (name: string) => `${name}: Fura!`,
    myPersian: "Perskie oczko!",
    persian: (name: string) => `${name}: Perskie oczko!`,
    myMaxed: "Komplet kart — koniec dobierania",
    maxed: (name: string) => `${name}: komplet kart`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Rozdanie",
    dealingBank: (bank: string) => `Rozdanie · bank: ${bank}`,
    at21: "Masz 21 — Starczy?",
    myTurn: (total: number) => `Twój ruch · masz ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} myśli…`,
    showdown: "Odsłanianie kart",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Partia dla Ciebie!",
    matchWon: (name: string) => `Partię wygrywa ${name}`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    bankLine: (won: number, n: number) => `Bank wygrywa ${won} z ${n} ${plural(n, "pojedynku", "pojedynków", "pojedynków")}`,
    bankPoint: (points: number) => `Punkt dla banku (+${points})`,
    bankNoPoint: "Bank bez punktu",
    duelWon: "Wygrany pojedynek z bankiem",
    duelLost: "Pojedynek dla banku",
    duelDraw: "Pojedynek bez rozstrzygnięcia",
    nobody: "Nikt nie punktuje",
    allBust: "Wszyscy mają furę",
    draw: "Remis — bez punktów",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "perskie oczko",
    mine: "Punkt dla Ciebie",
    mineSub: (how: string) => `Najbliżej 21: Ty z ${how}`,
    one: (name: string) => `Punkt dla: ${name}`,
    oneSub: (name: string, how: string) => `Najbliżej 21: ${name} z ${how}`,
    many: (names: string[]) => `Punkty dla: ${names.join(", ")}`,
    tieSub: (how: string) => `Remis przy ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "„Dobieram” bierze kartę, „Starczy” kończy ruch. Punkt dostaje wynik najbliżej 21.",
    first21: "Masz 21 — wyżej się nie da. Powiedz „Starczy”.",
    firstBust: "Fura: więcej niż 21 przegrywa. Przy 17 i więcej każda karta to spore ryzyko.",
    bank: "Gra z bankierem: każdy gra tylko z bankiem, a bank rusza się ostatni i wygrywa remisy.",
    persian: "Perskie oczko: dwa asy wygrywają ze wszystkim.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Rozumiem",
  /** The top band. */
  top: {
    menu: "Menu",
    round: (n: number) => `Runda ${n}`,
    myScore: (score: number, target: number) => `Twoje punkty: ${score} z ${target}`,
    family: "Rodzinne",
    bank: "Z bankierem",
    single: (mode: string) => `${mode} · jedna runda`,
    training: (mode: string) => `${mode} · trening`,
    match: (mode: string, target: number) => `${mode} · do ${target} pkt`,
  },
  stock: (n: number) => `Talia: ${common.cards(n)}`,
  /** "Punkty · do 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Punkty · do ${target}`,
  menu: {
    label: "Menu stołu",
    title: "Menu",
    rules: "Zasady",
    exit: "Wyjdź do lobby",
    exitHint: "Partia zostanie zapisana",
    giveUp: "Poddaj partię",
    leave: "Opuść stół",
    giveUpTitle: "Poddać partię?",
    giveUpMessage: "Partia zostanie zakończona bez zapisu wyniku.",
    giveUpConfirm: "Poddaj",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `fura, ${total}`,
    total: (total: number) => `wynik ${total}`,
    bank: "bank",
    dealer: "rozdaje",
    bankMark: "BANK",
    /** The dealer's mark on the portrait. */
    dealerMark: "R",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Twoja ręka: ${v.persian ? "perskie oczko" : v.bust ? `fura, ${v.total}` : `${v.total}`}`,
    persian: "perskie",
    bust: "fura",
    soft: "as = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "AA",
  /** Pontoon's special hands. */
  specials: { pontoon: "Pontoon", fiveCard: "Pięć kart" } as Record<Special, string>,
  roundEnd: {
    bust: "Fura",
    draw: "remis",
    scores: (rows: { name: string; score: number }[], target: number) => `Punkty: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, do ${target}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (bank)" : ""}: ${v?.persian ? "perskie oczko" : v?.bust ? `fura ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · bank" : ""}`,
    replay: "Ta runda jeszcze raz",
    next: "Następna runda",
    hostDeals: "Gospodarz rozdaje następną rundę…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${place}. miejsce: ${name}, ${score} pkt`,
    place: (place: number) => `${place}. miejsce`,
    badgeA11y: (name: string, desc: string) => `Nowa odznaka: ${name}. ${desc}`,
    badge: (name: string) => `Nowa odznaka: ${name}`,
    rematch: "Rewanż",
    rematchHint: "Ci sami rywale, nowe karty",
    newGame: "Nowa gra",
    lobby: "Do lobby",
  },
  effects: {
    fura: "Fura!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Perskie oczko!`,
    persianTitle: "Perskie\noczko!",
    persianSub: (name: string | null) => (name ? `${name} — dwa asy wygrywają wszystko` : "Dwa asy — ta ręka wygrywa wszystko"),
  },
  trainer: {
    lockedLabel: "Dzisiejsze podpowiedzi wykorzystane. Więcej w Oczko Pro",
    lockedTitle: "Trener · dzisiejsze podpowiedzi wykorzystane",
    lockedMore: "Więcej: Oczko Pro albo reklama w ustawieniach (poza rundą).",
    computingLabel: "Trener liczy szanse",
    computing: "Trener · liczę szanse…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Trener: szansa na furę ${bust}. Starczy ${stand}, Dobieram ${hit}. Lepiej: ${hitBest ? "Dobieram" : "Starczy"}.`,
    title: "Trener",
    bustChance: "Szansa na furę: ",
  },
};
