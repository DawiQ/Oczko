// German: texts of the "lan" area (playing with friends over Wi‑Fi).
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";
import { germanicForm } from "../plural";

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Gastgeber",
  defaultGuest: "Gast",
  /** The host's table as others see it. */
  tableName: (host: string) => `Tisch: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Bravo",
    oops: "Hoppla",
    faster: "Schneller",
    goodGame: "Gutes Spiel",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Tisch schließen?",
    message: "Das Spiel endet für alle am Tisch.",
  },
  errors: {
    openFailed: "Der Tisch konnte nicht eröffnet werden. Prüfe deine WLAN-Verbindung.",
    joinFailed: "Keine Verbindung zum Tisch möglich.",
    badCode: "Diesen Code gibt es in diesem Netz nicht.",
  },
  menu: {
    title: "Mit Freunden",
    subtitle: "Alle am eigenen Handy, im selben WLAN",
    nameLabel: "Dein Name am Tisch",
    namePlaceholder: "z. B. Ella",
    host: "Tisch eröffnen",
    join: "Tisch beitreten",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Ohne Internet: Die Handys verbinden sich im lokalen Netz. ${pro ? `Bis zu ${max} Personen am Tisch (Oczko Pro).` : `Bis zu ${free} Personen am Tisch (${max} mit Oczko Pro beim Gastgeber).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Über WLAN: ${matchesWon} von ${matches} ${germanicForm(matches) === "one" ? "Partie" : "Partien"} gewonnen · ${roundsWon}/${rounds} ${germanicForm(rounds) === "one" ? "Runde" : "Runden"} mit Punkt`,
  },
  host: {
    subtitle: "Dein Tisch — Freunde setzen sich dazu",
    code: "Tischcode",
    codeA11y: (spaced: string) => `Tischcode: ${spaced}`,
    qr: "QR-Code des Tisches — in der Oczko-App scannen",
    noWifi: "Verbinde dein Handy mit dem WLAN, um den Tischcode zu zeigen.",
    seats: (n: number, max: number) => `Am Tisch · ${n} von ${max}`,
    addSeat: "Platz hinzufügen",
    mode: "Modus",
    modeA11y: "Spielmodus",
    family: "Familienspiel",
    bank: "Mit Bankhalter",
    target: "Spielen bis",
    targetA11y: "Länge der Partie",
    oneRound: "1 Runde",
    deal: "Karten austeilen",
  },
  slot: {
    /** "Ella (du)" */
    me: (name: string) => `${name} (du)`,
    online: "verbunden",
    offline: "getrennt",
    remove: "Entfernen",
    removeA11y: (name: string) => `Entfernen: ${name}`,
    botA11y: (name: string, label: string) => `Bot: ${name}, ${label}. Figur wechseln`,
    botSub: (label: string) => `${label} · tippen zum Wechseln`,
    free: "Frei",
    freeA11y: (name: string) => `Platz freigeben: ${name}`,
    waiting: "Wartet auf einen Gast…",
    bot: "Bot",
    botA11yAdd: "Einen Bot hinsetzen",
    removeSeat: "Platz entfernen",
  },
  join: {
    scanTitle: "QR-Code scannen",
    cameraNote: "Die Kamera wird nur zum Scannen des Tischcodes gebraucht.",
    allowCamera: "Kamera erlauben",
    title: "Tisch beitreten",
    found: "Tische in diesem Netz",
    searching: "Suche läuft… Wenn der Tisch nicht erscheint, gib den Code ein oder scanne den QR-Code am Handy des Gastgebers.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, freie Plätze: ${open}` : ", andere App-Version"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "Mit Bankhalter" : "Familienspiel"} · frei: ${open}${playing ? " · Spiel läuft" : ""}`,
    otherVersion: "Andere App-Version",
    code: "Tischcode",
    codePlaceholder: "z. B. K7 4Q",
    join: "Beitreten",
    scan: "QR-Code scannen",
  },
  guest: {
    table: "Tisch",
    connecting: "Verbinde…",
    lobby: "Warten, bis der Gastgeber austeilt.",
    full: "Am Tisch ist kein Platz mehr frei.",
    version: "Andere App-Version — bitte Oczko aktualisieren.",
    started: "An diesem Tisch läuft schon ein Spiel.",
    removed: "Der Gastgeber hat dich vom Tisch entfernt.",
    hostLeft: "Der Gastgeber hat den Tisch geschlossen.",
    offline: "Keine Verbindung — verbinde neu…",
    freeSeat: "Freier Platz",
  },
  table: {
    offline: "Keine Verbindung zum Tisch — verbinde neu…",
    away: (name: string) => `${name} — Verbindung getrennt. Gleich spielt ein Bot.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} s für den Zug`,
    myMoveTime: (sec: number) => `Dein Zug: ${sec} s, dann „Genug“`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Bot jetzt",
    botNowA11y: "Jetzt einen Bot spielen lassen",
    wait: "Warten",
    waitA11y: "Länger warten",
    reactTitle: "Schnelle Reaktion",
    reactA11y: (text: string) => `Reaktion: ${text}`,
  },
};
