// Bosnian-Croatian-Serbian: texts of the "lan" area (playing with friends
// over Wi‑Fi). "sto"/"stol" differ between the countries, so the table is
// named only in the cases they share ("stola", "stolu", "za stolom").
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";
import { form } from "./common";

/** "do 4 osobe", "do 8 osoba" (the genitive after "do"). */
const people = (n: number) => form(n, "osobe", "osobe", "osoba");

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Domaćin",
  defaultGuest: "Gost",
  /** The host's table as others see it. */
  tableName: (host: string) => `Igra: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Bravo",
    oops: "Ups",
    faster: "Brže",
    goodGame: "Dobra igra",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Završiti igru za stolom?",
    message: "Igra se završava za sve za stolom.",
  },
  errors: {
    openFailed: "Igru nije moguće pokrenuti. Provjeri vezu s Wi‑Fi mrežom.",
    joinFailed: "Povezivanje sa stolom nije uspjelo.",
    badCode: "U ovoj mreži nema stola s tim kodom.",
  },
  menu: {
    title: "S prijateljima",
    subtitle: "Svi na svojim telefonima, u istoj Wi‑Fi mreži",
    nameLabel: "Tvoje ime za stolom",
    namePlaceholder: "npr. Olja",
    host: "Budi domaćin",
    join: "Pridruži se stolu",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Bez interneta: telefoni se povezuju u lokalnoj mreži. ${pro ? `Do ${max} ${people(max)} za stolom (Oczko Pro).` : `Do ${free} ${people(free)} za stolom (${max} uz domaćinov Oczko Pro).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Preko Wi‑Fi mreže: pobjede u ${matchesWon} od ${matches} ${form(matches, "partije", "partije", "partija")} · runde s bodom: ${roundsWon}/${rounds}`,
  },
  host: {
    subtitle: "Ti si domaćin — prijatelji se pridružuju",
    code: "Kod stola",
    codeA11y: (spaced: string) => `Kod stola: ${spaced}`,
    qr: "QR kod stola — skeniraj ga u aplikaciji Oczko",
    noWifi: "Poveži telefon s Wi‑Fi mrežom da bi se prikazao kod stola.",
    seats: (n: number, max: number) => `Za stolom · ${n} od ${max}`,
    addSeat: "Dodaj mjesto",
    mode: "Način",
    modeA11y: "Način igre",
    family: "Svi protiv svih",
    bank: "S bankarom",
    target: "Do koliko bodova",
    targetA11y: "Trajanje partije",
    oneRound: "1 runda",
    deal: "Podijeli karte",
  },
  slot: {
    /** "Olja (ti)" */
    me: (name: string) => `${name} (ti)`,
    online: "na vezi",
    offline: "nije na vezi",
    remove: "Ukloni",
    removeA11y: (name: string) => `Ukloni: ${name}`,
    botA11y: (name: string, label: string) => `Bot: ${name}, ${label}. Promijeni lik`,
    botSub: (label: string) => `${label} · dodirni za promjenu`,
    free: "Slobodno",
    freeA11y: (name: string) => `Oslobodi mjesto: ${name}`,
    waiting: "Čeka se gost…",
    bot: "Bot",
    botA11yAdd: "Dodaj bota",
    removeSeat: "Ukloni mjesto",
  },
  join: {
    scanTitle: "Skeniraj QR kod",
    cameraNote: "Kamera je potrebna samo za skeniranje koda stola.",
    allowCamera: "Dozvoli kameru",
    title: "Pridruži se stolu",
    found: "Stolovi u ovoj mreži",
    searching: "Tražim… Ako stola nema ovdje, upiši kod ili skeniraj QR kod s telefona domaćina.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, slobodna mjesta: ${open}` : ", druga verzija aplikacije"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "S bankarom" : "Svi protiv svih"} · slobodno: ${open}${playing ? " · igra traje" : ""}`,
    otherVersion: "Druga verzija aplikacije",
    code: "Kod stola",
    codePlaceholder: "npr. K7 4Q",
    join: "Pridruži se",
    scan: "Skeniraj QR kod",
  },
  guest: {
    table: "Igra",
    connecting: "Povezujem…",
    lobby: "Čekamo da domaćin podijeli karte.",
    full: "Za stolom nema slobodnih mjesta.",
    version: "Druga verzija aplikacije — ažurirajte Oczko.",
    started: "Igra za ovim stolom već traje.",
    removed: "Domaćin: više nisi za ovim stolom.",
    hostLeft: "Domaćin: igra za stolom je završena.",
    offline: "Nema veze — ponovo se povezujem…",
    freeSeat: "Slobodno mjesto",
  },
  table: {
    offline: "Nema veze sa stolom — ponovo se povezujem…",
    away: (name: string) => `${name} — veza je prekinuta. Uskoro igra bot.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} s za potez`,
    myMoveTime: (sec: number) => `Tvoj potez: ${sec} s, zatim „Dosta“`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Bot odmah",
    botNowA11y: "Neka bot igra odmah",
    wait: "Čekaj",
    waitA11y: "Čekaj još",
    reactTitle: "Brza reakcija",
    reactA11y: (text: string) => `Reakcija: ${text}`,
  },
};
