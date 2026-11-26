// German: texts of the table (statuses, captions, headlines, hints, panels,
// effects, the trainer). Gender-neutral ("du", names).
import type { HandValue, Special } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { germanicForm } from "../plural";
import { common } from "./common";

export const table: typeof pl.table = {
  /** The two moves (buttons, the trainer's bars). */
  actions: {
    hit: "Noch eine",
    stand: "Genug",
    hitHint: "Nimmt eine Karte vom Stapel",
    standHint: "Keine weiteren Karten in dieser Runde",
    skip: "Ergebnis zeigen",
    skipHint: "Spielt den Rest der Runde sofort aus",
  },
  /** The short label under a seat. */
  status: {
    thinking: "überlegt…",
    persian: "Feuer!",
    stood: "Genug",
    bust: "Überkauft!",
    maxed: "Volle Hand",
    playing: "am Zug",
  },
  /** A hand in words: "Ella: 19", "Helga: überkauft (24)". */
  hand: {
    /** Pontoon / five cards: "Ola: Pontoon". */
    special: (name: string, label: string) => `${name}: ${label}`,
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: Feuer`,
    bust: (name: string, total: number) => `${name}: überkauft (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Ella hat 19", "Helga ist überkauft (24)". */
  reveal: {
    special: (name: string, label: string) => `${name} hat ${label}`,
    cards: (name: string, n: number) => `${name} hat ${common.cards(n)}`,
    persian: (name: string) => `${name} hat Feuer`,
    bust: (name: string, total: number) => `${name} ist überkauft (${total})`,
    total: (name: string, total: number) => `${name} hat ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Neue Karte: ${card}. Du hast ${total}`,
    hit: (name: string) => `${name} nimmt eine Karte`,
    myStand: (total: number) => `Genug bei ${total}`,
    stand: (name: string) => `${name}: Genug`,
    myBust: (total: number) => `Überkauft! Du hast ${total}`,
    bust: (name: string) => `${name}: Überkauft!`,
    myPersian: "Feuer!",
    persian: (name: string) => `${name}: Feuer!`,
    myMaxed: "Volle Hand — keine Karte mehr",
    maxed: (name: string) => `${name}: volle Hand`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Austeilen",
    dealingBank: (bank: string) => `Austeilen · Bank: ${bank}`,
    at21: "Du hast 21 — Genug?",
    myTurn: (total: number) => `Du bist dran · du hast ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} überlegt…`,
    showdown: "Karten werden aufgedeckt",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Die Partie geht an dich!",
    matchWon: (name: string) => `${name} gewinnt die Partie`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    bankLine: (won: number, n: number) => `Die Bank gewinnt ${won} von ${n} ${germanicForm(n) === "one" ? "Duell" : "Duellen"}`,
    bankPoint: (points: number) => `Punkt für die Bank (+${points})`,
    bankNoPoint: "Kein Punkt für die Bank",
    duelWon: "Duell gegen die Bank gewonnen",
    duelLost: "Duell geht an die Bank",
    duelDraw: "Duell unentschieden",
    nobody: "Niemand punktet",
    allBust: "Alle sind überkauft",
    draw: "Unentschieden — keine Punkte",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "Feuer",
    mine: "Punkt für dich",
    mineSub: (how: string) => `Am nächsten an 21: du mit ${how}`,
    one: (name: string) => `Punkt für ${name}`,
    oneSub: (name: string, how: string) => `Am nächsten an 21: ${name} mit ${how}`,
    many: (names: string[]) => `Punkte für: ${names.join(", ")}`,
    tieSub: (how: string) => `Unentschieden bei ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "„Noch eine“ nimmt eine Karte, „Genug“ beendet deinen Zug. Den Punkt bekommt, wer am nächsten an 21 liegt.",
    first21: "Du hast 21 — mehr geht nicht. Sag „Genug“.",
    firstBust: "Überkauft: Wer über 21 kommt, verliert. Ab 17 ist jede Karte ein großes Risiko.",
    bank: "Mit Bankhalter: Alle spielen nur gegen die Bank. Die Bank ist zuletzt dran und gewinnt bei Unentschieden.",
    persian: "Feuer: Zwei Asse schlagen alles.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Verstanden",
  /** The top band. */
  top: {
    menu: "Menü",
    round: (n: number) => `Runde ${n}`,
    myScore: (score: number, target: number) => `Deine Punkte: ${score} von ${target}`,
    family: "Familienspiel",
    bank: "Mit Bankhalter",
    single: (mode: string) => `${mode} · eine Runde`,
    training: (mode: string) => `${mode} · Training`,
    match: (mode: string, target: number) => `${mode} · bis ${target} Pkt.`,
  },
  stock: (n: number) => `Stapel: ${common.cards(n)}`,
  /** "Punkte · bis 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Punkte · bis ${target}`,
  menu: {
    label: "Tischmenü",
    title: "Menü",
    rules: "Regeln",
    exit: "Zur Lobby",
    exitHint: "Die Partie wird gespeichert",
    giveUp: "Partie aufgeben",
    leave: "Tisch verlassen",
    giveUpTitle: "Partie aufgeben?",
    giveUpMessage: "Die Partie endet, ohne dass das Ergebnis gespeichert wird.",
    giveUpConfirm: "Aufgeben",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `überkauft, ${total}`,
    total: (total: number) => `Summe ${total}`,
    bank: "Bank",
    dealer: "teilt aus",
    bankMark: "BANK",
    /** The mark on the portrait of whoever deals ("Geber"). */
    dealerMark: "G",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Deine Hand: ${v.persian ? "Feuer" : v.bust ? `überkauft, ${v.total}` : `${v.total}`}`,
    persian: "Feuer",
    bust: "überkauft",
    soft: "Ass = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "AA",
  /** Pontoon's special hands. */
  specials: { pontoon: "Pontoon", fiveCard: "Fünf Karten" } as Record<Special, string>,
  roundEnd: {
    bust: "Überkauft",
    draw: "unentschieden",
    scores: (rows: { name: string; score: number }[], target: number) => `Punkte: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, bis ${target}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (Bank)" : ""}: ${v?.persian ? "Feuer" : v?.bust ? `überkauft ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · Bank" : ""}`,
    replay: "Runde noch einmal",
    next: "Nächste Runde",
    hostDeals: "Die nächste Runde teilt der Gastgeber aus…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${place}. Platz: ${name}, ${common.points(score)}`,
    place: (place: number) => `${place}. Platz`,
    badgeA11y: (name: string, desc: string) => `Neues Abzeichen: ${name}. ${desc}`,
    badge: (name: string) => `Neues Abzeichen: ${name}`,
    rematch: "Revanche",
    rematchHint: "Gleiche Gegner, neue Karten",
    newGame: "Neues Spiel",
    lobby: "Zur Lobby",
  },
  effects: {
    fura: "Überkauft!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Feuer!`,
    persianTitle: "Feuer!",
    persianSub: (name: string | null) => (name ? `${name} — zwei Asse schlagen alles` : "Zwei Asse — diese Hand schlägt alles"),
  },
  trainer: {
    lockedLabel: "Die Tipps für heute sind aufgebraucht. Mehr mit Oczko Pro",
    lockedTitle: "Trainer · Tipps für heute aufgebraucht",
    lockedMore: "Mehr: Oczko Pro oder Werbung mit Belohnung in den Einstellungen (außerhalb einer Runde).",
    computingLabel: "Der Trainer berechnet die Chancen",
    computing: "Trainer · Chancen werden berechnet…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Trainer: Risiko, sich zu überkaufen: ${bust}. Gewinnchance: „Genug“ ${stand}, „Noch eine“ ${hit}. Besser: „${hitBest ? "Noch eine" : "Genug"}“.`,
    title: "Trainer",
    bustChance: "Überkauf-Risiko: ",
  },
};
