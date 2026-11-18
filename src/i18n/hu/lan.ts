// Hungarian: texts of the "lan" area (playing with friends over Wi‑Fi).
import type { Reaction } from "../../lan/protocol";
import type { pl } from "../pl";

export const lan: typeof pl.lan = {
  /** Names when none was typed. */
  defaultHost: "Házigazda",
  defaultGuest: "Vendég",
  /** The host's table as others see it. */
  tableName: (host: string) => `Asztal: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Bravó",
    oops: "Hoppá",
    faster: "Gyorsabban",
    goodGame: "Jó játék",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Bezárod az asztalt?",
    message: "A játék mindenkinek véget ér az asztalnál.",
  },
  errors: {
    openFailed: "Nem sikerült megnyitni az asztalt. Ellenőrizd a Wi‑Fi-kapcsolatot.",
    joinFailed: "Nem sikerült csatlakozni az asztalhoz.",
    badCode: "Ebben a hálózatban nincs ilyen kód.",
  },
  menu: {
    title: "Barátokkal",
    subtitle: "Mindenki a saját telefonján, ugyanazon a Wi‑Fi-n",
    nameLabel: "A neved az asztalnál",
    namePlaceholder: "pl. Olga",
    host: "Asztal nyitása",
    join: "Csatlakozás asztalhoz",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Internet nélkül: a telefonok a helyi hálózaton kapcsolódnak. ${pro ? `Legfeljebb ${max} fő az asztalnál (Oczko Pro).` : `Legfeljebb ${free} fő az asztalnál (${max} fő, ha a házigazdának van Oczko Pro csomagja).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Wi‑Fi-n: ${matches} partiból ${matchesWon} győzelem · ${roundsWon}/${rounds} pontszerző kör`,
  },
  host: {
    subtitle: "A te asztalod — a barátok csatlakoznak",
    code: "Asztalkód",
    codeA11y: (spaced: string) => `Asztalkód: ${spaced}`,
    qr: "Az asztal QR-kódja — olvasd be az Oczko alkalmazásban",
    noWifi: "Csatlakoztasd a telefont Wi‑Fi-hez, hogy megjelenjen az asztalkód.",
    seats: (n: number, max: number) => `Az asztalnál · ${n} / ${max}`,
    addSeat: "Hely hozzáadása",
    mode: "Mód",
    modeA11y: "Játékmód",
    family: "Családi játék",
    bank: "Bankárral",
    target: "Hány pontig",
    targetA11y: "A parti hossza",
    oneRound: "1 kör",
    deal: "Osztás",
  },
  slot: {
    /** "Olga (te)" */
    me: (name: string) => `${name} (te)`,
    online: "csatlakozva",
    offline: "nincs kapcsolat",
    remove: "Eltávolítás",
    removeA11y: (name: string) => `Eltávolítás: ${name}`,
    botA11y: (name: string, label: string) => `Bot: ${name}, ${label}. Karakter cseréje`,
    botSub: (label: string) => `${label} · koppints a cseréhez`,
    free: "Szabad",
    freeA11y: (name: string) => `Hely felszabadítása: ${name}`,
    waiting: "Vendégre vár…",
    bot: "Bot",
    botA11yAdd: "Bot leültetése",
    removeSeat: "Hely törlése",
  },
  join: {
    scanTitle: "QR-kód beolvasása",
    cameraNote: "A kamera csak az asztalkód beolvasásához kell.",
    allowCamera: "Kamera engedélyezése",
    title: "Csatlakozás asztalhoz",
    found: "Asztalok a hálózaton",
    searching: "Keresés… Ha nem látod az asztalt, írd be a kódot, vagy olvasd be a QR-kódot a házigazda telefonjáról.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, szabad helyek: ${open}` : ", más alkalmazásverzió"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "Bankárral" : "Családi játék"} · szabad: ${open}${playing ? " · játék folyik" : ""}`,
    otherVersion: "Más alkalmazásverzió",
    code: "Asztalkód",
    codePlaceholder: "pl. K7 4Q",
    join: "Csatlakozás",
    scan: "QR-kód beolvasása",
  },
  guest: {
    table: "Asztal",
    connecting: "Kapcsolódás…",
    lobby: "Várjuk, hogy a házigazda kiossza a lapokat.",
    full: "Az asztalnál nincs szabad hely.",
    version: "Más alkalmazásverzió — frissítsétek az Oczko alkalmazást.",
    started: "Ennél az asztalnál már folyik a játék.",
    removed: "A házigazda eltávolított az asztaltól.",
    hostLeft: "A házigazda bezárta az asztalt.",
    offline: "Nincs kapcsolat — újracsatlakozás…",
    freeSeat: "Szabad hely",
  },
  table: {
    offline: "Nincs kapcsolat az asztallal — újracsatlakozás…",
    away: (name: string) => `${name} — megszakadt a kapcsolat. Hamarosan egy bot játszik helyette.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} mp a lépésre`,
    myMoveTime: (sec: number) => `Te lépsz: ${sec} mp, utána „Elég”`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Bot most",
    botNowA11y: "Most játsszon a bot",
    wait: "Várjunk",
    waitA11y: "Várjunk még",
    reactTitle: "Gyors reakció",
    reactA11y: (text: string) => `Reakció: ${text}`,
  },
};
