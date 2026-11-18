// Czech: texts of the "lan" area (playing with friends over Wi‑Fi).
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";
import { count } from "./common";

/** "4 osoby", "6 osob". */
const people = (n: number) => count(n, "osoba", "osoby", "osob");

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Hostitel",
  defaultGuest: "Host",
  /** The host's table as others see it. */
  tableName: (host: string) => `Stůl: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Bravo",
    oops: "Jejda",
    faster: "Rychleji",
    goodGame: "Dobrá hra",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Zavřít stůl?",
    message: "Hra skončí pro všechny u stolu.",
  },
  errors: {
    openFailed: "Stůl se nepodařilo otevřít. Zkontroluj připojení k Wi‑Fi.",
    joinFailed: "Ke stolu se nepodařilo připojit.",
    badCode: "Takový kód v této síti neznám.",
  },
  menu: {
    title: "S přáteli",
    subtitle: "Každý na svém telefonu, ve stejné síti Wi‑Fi",
    nameLabel: "Tvoje jméno u stolu",
    namePlaceholder: "např. Olina",
    host: "Založit stůl",
    join: "Připojit se ke stolu",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Bez internetu: telefony se spojí v místní síti. ${pro ? `U stolu až ${people(max)} (Oczko Pro).` : `U stolu až ${people(free)} (${max}, když má hostitel Oczko Pro).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Přes Wi‑Fi: vyhrané partie ${matchesWon} z ${matches} · kola s bodem ${roundsWon}/${rounds}`,
  },
  host: {
    subtitle: "Tvůj stůl — přátelé se připojují",
    code: "Kód stolu",
    codeA11y: (spaced: string) => `Kód stolu: ${spaced}`,
    qr: "QR kód stolu — naskenuj ho v aplikaci Oczko",
    noWifi: "Připoj telefon k Wi‑Fi, aby se ukázal kód stolu.",
    seats: (n: number, max: number) => `U stolu · ${n} z ${max}`,
    addSeat: "Přidat místo",
    mode: "Režim",
    modeA11y: "Režim hry",
    family: "Rodinná hra",
    bank: "S bankéřem",
    target: "Do kolika bodů",
    targetA11y: "Délka partie",
    oneRound: "1 kolo",
    deal: "Rozdat karty",
  },
  slot: {
    /** "Olina (ty)" */
    me: (name: string) => `${name} (ty)`,
    online: "připojeno",
    offline: "odpojeno",
    remove: "Odebrat",
    removeA11y: (name: string) => `Odebrat: ${name}`,
    botA11y: (name: string, label: string) => `Bot: ${name}, ${label}. Změnit postavu`,
    botSub: (label: string) => `${label} · klepni pro změnu`,
    free: "Uvolnit",
    freeA11y: (name: string) => `Uvolnit místo: ${name}`,
    waiting: "Čeká se na hosta…",
    bot: "Bot",
    botA11yAdd: "Posadit bota",
    removeSeat: "Odebrat místo",
  },
  join: {
    scanTitle: "Naskenuj QR kód",
    cameraNote: "Fotoaparát je potřeba jen k naskenování kódu stolu.",
    allowCamera: "Povolit fotoaparát",
    title: "Připojit se ke stolu",
    found: "Stoly v této síti",
    searching: "Hledám… Pokud stůl nevidíš, zadej kód nebo naskenuj QR kód z telefonu hostitele.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, volná místa: ${open}` : ", jiná verze aplikace"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "S bankéřem" : "Rodinná hra"} · volno: ${open}${playing ? " · hraje se" : ""}`,
    otherVersion: "Jiná verze aplikace",
    code: "Kód stolu",
    codePlaceholder: "např. K7 4Q",
    join: "Připojit",
    scan: "Naskenovat QR kód",
  },
  guest: {
    table: "Stůl",
    connecting: "Připojuji…",
    lobby: "Čekáme, až hostitel rozdá karty.",
    full: "U stolu nejsou volná místa.",
    version: "Jiná verze aplikace — aktualizujte Oczko.",
    started: "Hra u tohoto stolu už běží.",
    removed: "Hostitel tě odebral od stolu.",
    hostLeft: "Hostitel zavřel stůl.",
    offline: "Bez spojení — připojuji znovu…",
    freeSeat: "Volné místo",
  },
  table: {
    offline: "Bez spojení se stolem — připojuji znovu…",
    away: (name: string) => `${name} — odpojení. Za chvíli zahraje bot.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} s na tah`,
    myMoveTime: (sec: number) => `Tvůj tah: ${sec} s, pak „Stačí“`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Bot hned",
    botNowA11y: "Ať bot zahraje hned",
    wait: "Počkat",
    waitA11y: "Počkat déle",
    reactTitle: "Rychlá reakce",
    reactA11y: (text: string) => `Reakce: ${text}`,
  },
};
