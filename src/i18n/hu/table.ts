// Hungarian: texts of the table (statuses, captions, headlines, hints,
// panels, effects, the trainer). Names inserted by functions never take a
// suffix ("Név: …", or the name as the subject).
import type { HandValue } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { common } from "./common";

export const table: typeof pl.table = {
  /** The two moves (buttons, the trainer's bars). */
  actions: {
    hit: "Kérek",
    stand: "Elég",
    hitHint: "Egy lapot húz a pakliból",
    standHint: "Ebben a körben nem kér több lapot",
    skip: "Eredmény",
    skipHint: "Azonnal lejátssza a kör hátralévő részét",
  },
  /** The short label under a seat. */
  status: {
    thinking: "gondolkodik…",
    persian: "Két ász!",
    stood: "Elég",
    bust: "Túl sok!",
    maxed: "Tele a kéz",
    playing: "soron van",
  },
  /** A hand in words: "Olga: 19", "Hella: túl sok (24)". */
  hand: {
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: két ász`,
    bust: (name: string, total: number) => `${name}: túl sok (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Olga: 19 (felfordítva)" — no suffix on the name. */
  reveal: {
    cards: (name: string, n: number) => `${name}: ${common.cards(n)} (felfordítva)`,
    persian: (name: string) => `${name}: két ász (felfordítva)`,
    bust: (name: string, total: number) => `${name}: túl sok, ${total} (felfordítva)`,
    total: (name: string, total: number) => `${name}: ${total} (felfordítva)`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `Új lap: ${card}. Összesen ${total}`,
    hit: (name: string) => `${name} kér egy lapot`,
    myStand: (total: number) => `Elég · összesen ${total}`,
    stand: (name: string) => `${name}: Elég`,
    myBust: (total: number) => `Túl sok! Összesen ${total}`,
    bust: (name: string) => `${name}: Túl sok!`,
    myPersian: "Két ász!",
    persian: (name: string) => `${name}: Két ász!`,
    myMaxed: "Tele a kéz — nincs több lap",
    maxed: (name: string) => `${name}: tele a kéz`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Osztás",
    dealingBank: (bank: string) => `Osztás · bank: ${bank}`,
    at21: "Megvan a 21 — Elég?",
    myTurn: (total: number) => `Te jössz · összesen ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} gondolkodik…`,
    showdown: "A lapok felfordítása",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "Tiéd a parti!",
    matchWon: (name: string) => `${name} nyeri a partit`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    /** "A bank 2 párharcot nyer 3 közül" (no suffix on a number). */
    bankLine: (won: number, n: number) => `A bank ${won} párharcot nyer ${n} közül`,
    bankPoint: (points: number) => `Pont a banknak (+${points})`,
    bankNoPoint: "A bank nem kap pontot",
    duelWon: "Nyertél a bank ellen",
    duelLost: "A párharc a banké",
    duelDraw: "A párharc döntetlen",
    nobody: "Senki sem kap pontot",
    allBust: "Mindenkinek túl sok",
    draw: "Döntetlen — nincs pont",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "két ász",
    mine: "Tiéd a pont",
    mineSub: (how: string) => `Legközelebb a 21-hez: te (${how})`,
    one: (name: string) => `Pontot kap: ${name}`,
    oneSub: (name: string, how: string) => `Legközelebb a 21-hez: ${name} (${how})`,
    many: (names: string[]) => `Pontot kap: ${names.join(", ")}`,
    tieSub: (how: string) => `Döntetlen (${how})`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "A „Kérek” egy lapot ad, az „Elég” befejezi a lépésedet. A pontot az kapja, aki a legközelebb van a 21-hez.",
    first21: "Megvan a 21 — ennél jobb nem lehet. Mondd azt: „Elég”.",
    firstBust: "Túl sok: 21 fölött a kéz veszít. 17-től felfelé minden lap komoly kockázat.",
    bank: "Játék bankárral: mindenki csak a bank ellen játszik, a bank lép utoljára, és döntetlennél nyer.",
    persian: "Két ász: mindent üt.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Értem",
  /** The top band. */
  top: {
    menu: "Menü",
    round: (n: number) => `${n}. kör`,
    myScore: (score: number, target: number) => `Pontjaid: ${score} / ${target}`,
    family: "Családi játék",
    bank: "Bankárral",
    single: (mode: string) => `${mode} · egy kör`,
    training: (mode: string) => `${mode} · gyakorlás`,
    match: (mode: string, target: number) => `${mode} · ${target} pontig`,
  },
  stock: (n: number) => `Pakli: ${common.cards(n)}`,
  /** "Pontok · 5-ig" (the menu, the round's end; "-ig" has one form). */
  pointsTo: (target: number) => `Pontok · ${target}-ig`,
  menu: {
    label: "Asztalmenü",
    title: "Menü",
    rules: "Szabályok",
    exit: "Vissza a lobbiba",
    exitHint: "A partit elmentjük",
    giveUp: "Parti feladása",
    leave: "Asztal elhagyása",
    giveUpTitle: "Feladod a partit?",
    giveUpMessage: "A parti véget ér, az eredményt nem mentjük el.",
    giveUpConfirm: "Feladom",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `túl sok, ${total}`,
    total: (total: number) => `összesen ${total}`,
    bank: "bank",
    dealer: "oszt",
    bankMark: "BANK",
    /** The mark on the portrait of whoever deals ("osztó"). */
    dealerMark: "O",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `A kezed: ${v.persian ? "két ász" : v.bust ? `túl sok, ${v.total}` : `${v.total}`}`,
    persian: "két ász",
    bust: "túl sok",
    soft: "ász = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "AA",
  roundEnd: {
    bust: "Túl sok",
    draw: "döntetlen",
    scores: (rows: { name: string; score: number }[], target: number) => `Pontok: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, ${target}-ig`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (bank)" : ""}: ${v?.persian ? "két ász" : v?.bust ? `túl sok ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · bank" : ""}`,
    replay: "Ez a kör még egyszer",
    next: "Következő kör",
    hostDeals: "A következő kört a házigazda osztja…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${place}. hely: ${name}, ${common.points(score)}`,
    place: (place: number) => `${place}. hely`,
    badgeA11y: (name: string, desc: string) => `Új jelvény: ${name}. ${desc}`,
    badge: (name: string) => `Új jelvény: ${name}`,
    rematch: "Visszavágó",
    rematchHint: "Ugyanazok az ellenfelek, új lapok",
    newGame: "Új játék",
    lobby: "A lobbiba",
  },
  effects: {
    fura: "Túl sok!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Két ász!`,
    persianTitle: "Két\nász!",
    persianSub: (name: string | null) => (name ? `${name} — két ász, mindent üt` : "Két ász — ez a kéz mindent üt"),
  },
  trainer: {
    lockedLabel: "A mai tanácsok elfogytak. Továbbiak az Oczko Pro csomaggal",
    lockedTitle: "Edző · a mai tanácsok elfogytak",
    lockedMore: "Továbbiak: Oczko Pro, vagy reklám a beállításokban (körön kívül).",
    computingLabel: "Az edző számolja az esélyeket",
    computing: "Edző · számolom az esélyeket…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Edző: a túllépés esélye ${bust}. Nyerési esély: „Elég” ${stand}, „Kérek” ${hit}. Jobb: „${hitBest ? "Kérek" : "Elég"}”.`,
    title: "Edző",
    bustChance: "Túllépés esélye: ",
  },
};
