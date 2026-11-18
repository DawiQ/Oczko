// English: texts of the table (statuses, captions, headlines, hints, panels,
// effects, the coach). Gender-neutral ("you", names).
import type { HandValue, Special } from "../../engine/score";
import type { HintId } from "../../table/hints";
import type { pl } from "../pl";
import { germanicForm } from "../plural";
import { common } from "./common";

/** 1 → "1st", 2 → "2nd", 3 → "3rd", 11 → "11th". */
const ordinal = (n: number): string => {
  const h = n % 100;
  if (h >= 11 && h <= 13) return `${n}th`;
  const d = n % 10;
  return `${n}${d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}`;
};

export const table: typeof pl.table = {
  /** The two moves (buttons, the coach's bars). */
  actions: {
    hit: "Draw",
    stand: "Stay",
    hitHint: "Takes one card from the deck",
    standHint: "Stops drawing for this round",
    skip: "Show result",
    skipHint: "Plays out the rest of the round at once",
  },
  /** The short label under a seat. */
  status: {
    thinking: "thinking…",
    persian: "Two aces!",
    stood: "Stay",
    bust: "Bust!",
    maxed: "Full hand",
    playing: "to move",
  },
  /** A hand in words: "Ollie: 19", "Hattie: bust (24)". */
  hand: {
    /** Pontoon / five cards: "Ola: Pontoon". */
    special: (name: string, label: string) => `${name}: ${label}`,
    cards: (name: string, n: number) => `${name}: ${common.cards(n)}`,
    persian: (name: string) => `${name}: two aces`,
    bust: (name: string, total: number) => `${name}: bust (${total})`,
    total: (name: string, total: number) => `${name}: ${total}`,
  },
  /** A shown hand: "Ollie has 19", "Hattie is bust (24)". */
  reveal: {
    special: (name: string, label: string) => `${name} has ${label}`,
    cards: (name: string, n: number) => `${name} has ${common.cards(n)}`,
    persian: (name: string) => `${name} has two aces`,
    bust: (name: string, total: number) => `${name} is bust (${total})`,
    total: (name: string, total: number) => `${name} has ${total}`,
  },
  /** One event, from the person's point of view ("my…": the person's own). */
  event: {
    myHit: (card: string, total: number) => `You drew: ${card}. You have ${total}`,
    hit: (name: string) => `${name} draws a card`,
    myStand: (total: number) => `Stay at ${total}`,
    stand: (name: string) => `${name}: Stay`,
    myBust: (total: number) => `Bust! You have ${total}`,
    bust: (name: string) => `${name}: Bust!`,
    myPersian: "Two aces!",
    persian: (name: string) => `${name}: Two aces!`,
    myMaxed: "Full hand — no more cards",
    maxed: (name: string) => `${name}: full hand`,
  },
  /** The live caption under the table. */
  caption: {
    dealing: "Dealing",
    dealingBank: (bank: string) => `Dealing · bank: ${bank}`,
    at21: "You have 21 — Stay?",
    myTurn: (total: number) => `Your turn · you have ${total}`,
    /** The last event, then whose turn it is. */
    then: (last: string, turn: string) => `${last} · ${turn}`,
    thinking: (name: string) => `${name} is thinking…`,
    showdown: "Revealing the cards",
  },
  /** The round's (or match's) outcome. */
  headline: {
    matchMine: "You win the match!",
    matchWon: (name: string) => `${name} wins the match`,
    matchSub: (points: number, rounds: number) => `${common.points(points)} · ${common.rounds(rounds)}`,
    bankLine: (won: number, n: number) => `The bank wins ${won} of ${n} ${germanicForm(n) === "one" ? "duel" : "duels"}`,
    bankPoint: (points: number) => `Point for the bank (+${points})`,
    bankNoPoint: "No point for the bank",
    duelWon: "You beat the bank",
    duelLost: "The bank wins the duel",
    duelDraw: "Duel tied",
    nobody: "Nobody scores",
    allBust: "Everyone is bust",
    draw: "Tie — no points",
    /** The winning hand when it is two aces (otherwise its total). */
    persian: "two aces",
    mine: "Point for you",
    mineSub: (how: string) => `Closest to 21: you, with ${how}`,
    one: (name: string) => `Point for ${name}`,
    oneSub: (name: string, how: string) => `Closest to 21: ${name}, with ${how}`,
    many: (names: string[]) => `Points for: ${names.join(", ")}`,
    tieSub: (how: string) => `Tied at ${how}`,
  },
  /** One-time tips. */
  hints: {
    firstTurn: "“Draw” takes a card, “Stay” ends your turn. The total closest to 21 gets the point.",
    first21: "You have 21 — you can't go higher. Say “Stay”.",
    firstBust: "Bust: over 21 loses. At 17 or more, every card is a big risk.",
    bank: "With a banker: everyone plays only against the bank; the bank moves last and wins ties.",
    persian: "Two aces (perskie oczko) beat everything.",
  } as Record<HintId, string>,
  hintOk: "OK",
  hintOkLabel: "Got it",
  /** The top band. */
  top: {
    menu: "Menu",
    round: (n: number) => `Round ${n}`,
    myScore: (score: number, target: number) => `Your points: ${score} of ${target}`,
    family: "Family game",
    bank: "With a banker",
    single: (mode: string) => `${mode} · one round`,
    training: (mode: string) => `${mode} · practice`,
    match: (mode: string, target: number) => `${mode} · to ${target} pts`,
  },
  stock: (n: number) => `Deck: ${common.cards(n)}`,
  /** "Points · to 5" (the menu, the round's end). */
  pointsTo: (target: number) => `Points · to ${target}`,
  menu: {
    label: "Table menu",
    title: "Menu",
    rules: "Rules",
    exit: "Back to the lobby",
    exitHint: "The match will be saved",
    giveUp: "Give up the match",
    leave: "Leave the table",
    giveUpTitle: "Give up the match?",
    giveUpMessage: "The match will end without saving the result.",
    giveUpConfirm: "Give up",
  },
  /** A rival's seat. */
  seat: {
    bust: (total: number) => `bust, ${total}`,
    total: (total: number) => `total ${total}`,
    bank: "bank",
    dealer: "deals",
    bankMark: "BANK",
    /** The mark on the portrait of whoever deals. */
    dealerMark: "D",
  },
  /** My hand at the bottom. */
  myHand: {
    label: (v: HandValue) => `Your hand: ${v.persian ? "two aces" : v.bust ? `bust, ${v.total}` : `${v.total}`}`,
    persian: "two aces",
    bust: "bust",
    soft: "ace = 11",
  },
  /** Two aces, in short (a hand's total). */
  persianShort: "AA",
  /** Pontoon's special hands. */
  specials: { pontoon: "Pontoon", fiveCard: "Five Card Trick" } as Record<Special, string>,
  roundEnd: {
    bust: "Bust",
    draw: "tie",
    scores: (rows: { name: string; score: number }[], target: number) => `Points: ${rows.map((x) => `${x.name} ${x.score}`).join(", ")}, playing to ${target}`,
    row: (name: string, isBank: boolean, v: HandValue | undefined, outcome: string) =>
      `${name}${isBank ? " (bank)" : ""}: ${v?.persian ? "two aces" : v?.bust ? `bust ${v.total}` : v?.total ?? ""}, ${outcome}`,
    who: (name: string, isBank: boolean) => `${name}${isBank ? " · bank" : ""}`,
    replay: "Replay this round",
    next: "Next round",
    hostDeals: "The host deals the next round…",
  },
  matchEnd: {
    placeA11y: (place: number, name: string, score: number) => `${ordinal(place)} place: ${name}, ${common.points(score)}`,
    place: (place: number) => `${ordinal(place)} place`,
    badgeA11y: (name: string, desc: string) => `New badge: ${name}. ${desc}`,
    badge: (name: string) => `New badge: ${name}`,
    rematch: "Rematch",
    rematchHint: "Same opponents, new cards",
    newGame: "New game",
    lobby: "To the lobby",
  },
  effects: {
    fura: "Bust!",
    persianA11y: (name: string | null) => `${name ? `${name}: ` : ""}Two aces!`,
    persianTitle: "Two\naces!",
    persianSub: (name: string | null) => (name ? `${name} — two aces beat everything` : "Two aces — this hand beats everything"),
  },
  trainer: {
    lockedLabel: "Today's hints are used up. More with Oczko Pro",
    lockedTitle: "Coach · today's hints used up",
    lockedMore: "More: Oczko Pro, or an ad with a reward in Settings (outside a round).",
    computingLabel: "The coach is working out the chances",
    computing: "Coach · working out the chances…",
    label: (bust: string, stand: string, hit: string, hitBest: boolean) =>
      `Coach: chance to bust ${bust}. Chance to win: Stay ${stand}, Draw ${hit}. Better: ${hitBest ? "Draw" : "Stay"}.`,
    title: "Coach",
    bustChance: "Chance to bust: ",
  },
};
