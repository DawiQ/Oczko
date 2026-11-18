// Slovak: texts of the "lan" area (playing with friends over Wi‑Fi).
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";
import { count } from "./common";

const people = (n: number) => count(n, "osoba", "osoby", "osôb");

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Hostiteľ",
  defaultGuest: "Hosť",
  /** The host's table as others see it. */
  tableName: (host: string) => `Stôl: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Bravo",
    oops: "Ups",
    faster: "Rýchlejšie",
    goodGame: "Dobrá hra",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Zavrieť stôl?",
    message: "Hra sa skončí pre všetkých pri stole.",
  },
  errors: {
    openFailed: "Stôl sa nepodarilo otvoriť. Skontroluj pripojenie k Wi‑Fi.",
    joinFailed: "K stolu sa nepodarilo pripojiť.",
    badCode: "Taký kód v tejto sieti nepoznám.",
  },
  menu: {
    title: "S priateľmi",
    subtitle: "Každý na svojom telefóne, v tej istej sieti Wi‑Fi",
    nameLabel: "Tvoje meno pri stole",
    namePlaceholder: "napr. Olinka",
    host: "Založiť stôl",
    join: "Pripojiť sa k stolu",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Bez internetu: telefóny sa spoja v miestnej sieti. ${pro ? `Pri stole najviac ${people(max)} (Oczko Pro).` : `Pri stole najviac ${people(free)} (${max}, ak má hostiteľ Oczko Pro).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Cez Wi‑Fi: vyhraté ${matchesWon} z ${matches} ${matches === 1 ? "partie" : "partií"} · ${roundsWon}/${rounds} kôl s bodom`,
  },
  host: {
    subtitle: "Tvoj stôl — priatelia sa pripájajú",
    code: "Kód stola",
    codeA11y: (spaced: string) => `Kód stola: ${spaced}`,
    qr: "QR kód stola — naskenuj ho v aplikácii Oczko",
    noWifi: "Pripoj telefón k Wi‑Fi, aby sa zobrazil kód stola.",
    seats: (n: number, max: number) => `Pri stole · ${n} z ${max}`,
    addSeat: "Pridať miesto",
    mode: "Režim",
    modeA11y: "Režim hry",
    family: "Rodinná hra",
    bank: "S bankárom",
    target: "Do koľkých bodov",
    targetA11y: "Dĺžka partie",
    oneRound: "1 kolo",
    deal: "Rozdať karty",
  },
  slot: {
    /** "Olinka (ty)" */
    me: (name: string) => `${name} (ty)`,
    online: "online",
    offline: "offline",
    remove: "Odstrániť",
    removeA11y: (name: string) => `Odstrániť: ${name}`,
    botA11y: (name: string, label: string) => `Bot: ${name}, ${label}. Zmeniť postavu`,
    botSub: (label: string) => `${label} · ťukni a zmeň`,
    free: "Uvoľniť",
    freeA11y: (name: string) => `Uvoľniť miesto: ${name}`,
    waiting: "Čaká sa na hosťa…",
    bot: "Bot",
    botA11yAdd: "Posadiť bota",
    removeSeat: "Odstrániť miesto",
  },
  join: {
    scanTitle: "Naskenovať QR kód",
    cameraNote: "Fotoaparát je potrebný iba na naskenovanie kódu stola.",
    allowCamera: "Povoliť fotoaparát",
    title: "Pripojiť sa k stolu",
    found: "Stoly v tejto sieti",
    searching: "Hľadám… Ak stôl nevidíš, zadaj kód alebo naskenuj QR kód z telefónu hostiteľa.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, voľné miesta: ${open}` : ", iná verzia aplikácie"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "S bankárom" : "Rodinná hra"} · voľné: ${open}${playing ? " · hra prebieha" : ""}`,
    otherVersion: "Iná verzia aplikácie",
    code: "Kód stola",
    codePlaceholder: "napr. K7 4Q",
    join: "Pripojiť sa",
    scan: "Naskenovať QR kód",
  },
  guest: {
    table: "Stôl",
    connecting: "Pripájam…",
    lobby: "Čakáme, kým hostiteľ rozdá karty.",
    full: "Pri stole nie sú voľné miesta.",
    version: "Iná verzia aplikácie — aktualizujte Oczko.",
    started: "Pri tomto stole už hra prebieha.",
    removed: "Už nie si pri stole — rozhodnutie hostiteľa.",
    hostLeft: "Stôl hostiteľa je zatvorený.",
    offline: "Bez pripojenia — znova sa pripájam…",
    freeSeat: "Voľné miesto",
  },
  table: {
    offline: "Spojenie so stolom sa prerušilo — znova sa pripájam…",
    away: (name: string) => `${name} — odpojenie. O chvíľu zahrá bot.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} s na ťah`,
    myMoveTime: (sec: number) => `Tvoj ťah: ${sec} s, potom „Stačí“`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Bot hneď",
    botNowA11y: "Nech bot zahrá hneď",
    wait: "Počkať",
    waitA11y: "Počkať dlhšie",
    reactTitle: "Rýchla reakcia",
    reactA11y: (text: string) => `Reakcia: ${text}`,
  },
};
