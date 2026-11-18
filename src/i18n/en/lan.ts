// English: texts of the "lan" area (playing with friends over Wi‑Fi).
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";
import { germanicForm } from "../plural";

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Host",
  defaultGuest: "Guest",
  /** The host's table as others see it. */
  tableName: (host: string) => `Table: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Bravo",
    oops: "Oops",
    faster: "Hurry up",
    goodGame: "Good game",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Close the table?",
    message: "The game ends for everyone at the table.",
  },
  errors: {
    openFailed: "Couldn't open the table. Check your Wi‑Fi connection.",
    joinFailed: "Couldn't connect to the table.",
    badCode: "No table with this code on this network.",
  },
  menu: {
    title: "With friends",
    subtitle: "Everyone on their own phone, on the same Wi‑Fi",
    nameLabel: "Your name at the table",
    namePlaceholder: "e.g. Ollie",
    host: "Open a table",
    join: "Join a table",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `No internet needed: phones connect over the local network. ${pro ? `Up to ${max} people at the table (Oczko Pro).` : `Up to ${free} people at the table (${max} with the host's Oczko Pro).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Over Wi‑Fi: ${matchesWon} of ${matches} ${germanicForm(matches) === "one" ? "match" : "matches"} won · ${roundsWon}/${rounds} ${germanicForm(rounds) === "one" ? "round" : "rounds"} with a point`,
  },
  host: {
    subtitle: "Your table — friends join here",
    code: "Table code",
    codeA11y: (spaced: string) => `Table code: ${spaced}`,
    qr: "Table QR code — scan it in the Oczko app",
    noWifi: "Connect your phone to Wi‑Fi to show the table code.",
    seats: (n: number, max: number) => `At the table · ${n} of ${max}`,
    addSeat: "Add a seat",
    mode: "Mode",
    modeA11y: "Game mode",
    family: "Family game",
    bank: "With a banker",
    target: "Play to",
    targetA11y: "Match length",
    oneRound: "1 round",
    deal: "Deal the cards",
  },
  slot: {
    /** "Ollie (you)" */
    me: (name: string) => `${name} (you)`,
    online: "connected",
    offline: "disconnected",
    remove: "Remove",
    removeA11y: (name: string) => `Remove: ${name}`,
    botA11y: (name: string, label: string) => `Bot: ${name}, ${label}. Change character`,
    botSub: (label: string) => `${label} · tap to change`,
    free: "Open",
    freeA11y: (name: string) => `Open the seat: ${name}`,
    waiting: "Waiting for a guest…",
    bot: "Bot",
    botA11yAdd: "Seat a bot",
    removeSeat: "Remove seat",
  },
  join: {
    scanTitle: "Scan QR code",
    cameraNote: "The camera is only needed to scan the table code.",
    allowCamera: "Allow camera",
    title: "Join a table",
    found: "Tables on this network",
    searching: "Searching… If the table doesn't show up, type the code or scan the QR code on the host's phone.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, free seats: ${open}` : ", different app version"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "With a banker" : "Family game"} · free: ${open}${playing ? " · in play" : ""}`,
    otherVersion: "Different app version",
    code: "Table code",
    codePlaceholder: "e.g. K7 4Q",
    join: "Join",
    scan: "Scan QR code",
  },
  guest: {
    table: "Table",
    connecting: "Connecting…",
    lobby: "Waiting for the host to deal.",
    full: "There are no free seats at the table.",
    version: "Different app version — please update Oczko.",
    started: "A game is already on at this table.",
    removed: "The host removed you from the table.",
    hostLeft: "The host closed the table.",
    offline: "No connection — reconnecting…",
    freeSeat: "Free seat",
  },
  table: {
    offline: "Lost connection to the table — reconnecting…",
    away: (name: string) => `${name} — disconnected. A bot will play in a moment.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} s to move`,
    myMoveTime: (sec: number) => `Your move: ${sec} s, then “Stay”`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Bot now",
    botNowA11y: "Let a bot play now",
    wait: "Wait",
    waitA11y: "Wait longer",
    reactTitle: "Quick reaction",
    reactA11y: (text: string) => `Reaction: ${text}`,
  },
};
