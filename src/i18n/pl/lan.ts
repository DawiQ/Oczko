// Polish: texts of the "lan" area (playing with friends over Wi‑Fi).
import type { Reaction } from "../../lan/protocol";

export const lan = {
  /** Names when none was typed. */
  defaultHost: "Gospodarz",
  defaultGuest: "Gość",
  /** The host's table as others see it. */
  tableName: (host: string) => `Stół: ${host}`,
  /** Quick reactions by id (sent as ids, shown in the viewer's language). */
  reactions: {
    bravo: "Brawo",
    oops: "Ups",
    faster: "Szybciej",
    goodGame: "Dobra gra",
  } as Record<Reaction, string>,
  closeConfirm: {
    title: "Zamknąć stół?",
    message: "Gra skończy się dla wszystkich przy stole.",
  },
  errors: {
    openFailed: "Nie udało się otworzyć stołu. Sprawdź połączenie z Wi‑Fi.",
    joinFailed: "Nie udało się połączyć ze stołem.",
    badCode: "Nie znam takiego kodu w tej sieci.",
  },
  menu: {
    title: "Ze znajomymi",
    subtitle: "Każdy na swoim telefonie, w tej samej sieci Wi‑Fi",
    nameLabel: "Twoje imię przy stole",
    namePlaceholder: "np. Ola",
    host: "Załóż stół",
    join: "Dołącz do stołu",
    /** No internet needed; how many seats (with or without the host's Pro). */
    note: (pro: boolean, free: number, max: number) =>
      `Bez internetu: telefony łączą się w lokalnej sieci. ${pro ? `Do ${max} osób przy stole (Oczko Pro).` : `Do ${free} osób przy stole (${max} z Oczko Pro gospodarza).`}`,
    stats: (matchesWon: number, matches: number, roundsWon: number, rounds: number) =>
      `Przez Wi‑Fi: ${matchesWon} z ${matches} partii wygranych · ${roundsWon}/${rounds} rund z punktem`,
  },
  host: {
    subtitle: "Twój stół — znajomi dołączają",
    code: "Kod stołu",
    codeA11y: (spaced: string) => `Kod stołu: ${spaced}`,
    qr: "Kod QR stołu — zeskanuj w aplikacji Oczko",
    noWifi: "Połącz telefon z Wi‑Fi, żeby pokazać kod stołu.",
    seats: (n: number, max: number) => `Przy stole · ${n} z ${max}`,
    addSeat: "Dodaj miejsce",
    mode: "Tryb",
    modeA11y: "Tryb gry",
    family: "Rodzinne",
    bank: "Z bankierem",
    target: "Do ilu punktów",
    targetA11y: "Długość partii",
    oneRound: "1 runda",
    deal: "Rozdaj karty",
  },
  slot: {
    /** "Ola (Ty)" */
    me: (name: string) => `${name} (Ty)`,
    online: "połączony",
    offline: "rozłączony",
    remove: "Usuń",
    removeA11y: (name: string) => `Usuń: ${name}`,
    botA11y: (name: string, label: string) => `Bot: ${name}, ${label}. Zmień postać`,
    botSub: (label: string) => `${label} · stuknij, by zmienić`,
    free: "Wolne",
    freeA11y: (name: string) => `Zwolnij miejsce: ${name}`,
    waiting: "Czeka na gościa…",
    bot: "Bot",
    botA11yAdd: "Posadź bota",
    removeSeat: "Usuń miejsce",
  },
  join: {
    scanTitle: "Skanuj kod QR",
    cameraNote: "Aparat jest potrzebny tylko do zeskanowania kodu stołu.",
    allowCamera: "Zezwól na aparat",
    title: "Dołącz do stołu",
    found: "Stoły w tej sieci",
    searching: "Szukam… Jeśli stołu nie widać, wpisz kod albo zeskanuj QR z telefonu gospodarza.",
    /** A found table for screen readers (null: another app version). */
    tableA11y: (name: string, open: number | null) => `${name}${open !== null ? `, wolne miejsca: ${open}` : ", inna wersja aplikacji"}`,
    tableLine: (bank: boolean, open: number, playing: boolean) => `${bank ? "Z bankierem" : "Rodzinne"} · wolne: ${open}${playing ? " · gra trwa" : ""}`,
    otherVersion: "Inna wersja aplikacji",
    code: "Kod stołu",
    codePlaceholder: "np. K7 4Q",
    join: "Dołącz",
    scan: "Skanuj kod QR",
  },
  guest: {
    table: "Stół",
    connecting: "Łączę…",
    lobby: "Czekamy, aż gospodarz rozda karty.",
    full: "Przy stole nie ma wolnych miejsc.",
    version: "Inna wersja aplikacji — zaktualizujcie Oczko.",
    started: "Gra przy tym stole już trwa.",
    removed: "Gospodarz usunął Cię ze stołu.",
    hostLeft: "Gospodarz zamknął stół.",
    offline: "Brak połączenia — łączę ponownie…",
    freeSeat: "Wolne miejsce",
  },
  table: {
    offline: "Brak połączenia ze stołem — łączę ponownie…",
    away: (name: string) => `${name} — rozłączenie. Za chwilę zagra bot.`,
    moveTime: (name: string, sec: number) => `${name}: ${sec} s na ruch`,
    myMoveTime: (sec: number) => `Twój ruch: ${sec} s, potem „Starczy”`,
    reaction: (name: string, text: string) => `${name}: ${text}`,
    botNow: "Bot teraz",
    botNowA11y: "Niech bot zagra teraz",
    wait: "Czekaj",
    waitA11y: "Poczekaj dłużej",
    reactTitle: "Szybka reakcja",
    reactA11y: (text: string) => `Reakcja: ${text}`,
  },
};
