// Bosnian-Croatian-Serbian: texts of the "premium" area (Oczko Pro, plans,
// limits, codes, looks). Words that differ between the countries are avoided
// ("tjedan/nedelja", "uvjeti/uslovi", "kupnja/kupovina", "postavke/podešavanja").
import type { pl } from "../pl";
import { count } from "./common";

/** "1 dan", "3 dana", "7 dana". */
const days = (n: number) => count(n, "dan", "dana", "dana");

/** "18. 11. 2026." — numeric: month names differ between the countries
 *  (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}.`;
};

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Trenutak…",
  adFailed: "Reklama nije dostupna — pokušaj opet za koji trenutak.",
  restore: "Vrati kupljeno",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Svakih 7 dana",
      monthly: "Mjesečno",
      twoMonths: "Na 2 mjeseca",
      threeMonths: "Na 3 mjeseca",
      sixMonths: "Na pola godine",
      yearly: "Godišnje",
      lifetime: "Zauvijek",
      other: "Oczko Pro",
    },
    /** "/ godina" in the plan's note. */
    per: {
      weekly: "7 dana",
      monthly: "mjesec",
      twoMonths: "2 mjeseca",
      threeMonths: "3 mjeseca",
      sixMonths: "pola godine",
      yearly: "godina",
    },
    /** "svake godine" in the fine print. */
    every: {
      weekly: "svakih 7 dana",
      monthly: "svakog mjeseca",
      twoMonths: "svaka 2 mjeseca",
      threeMonths: "svaka 3 mjeseca",
      sixMonths: "svakih pola godine",
      yearly: "svake godine",
    },
    days,
    lifetimeNote: (price: string) => `Jednokratno ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} besplatno, zatim ${price} / ${per}`,
    buy: "Kupi Oczko Pro",
    tryFree: (trialDays: number) => `Isprobaj ${days(trialDays)} besplatno`,
    buyLifetime: (price: string) => `Kupi zauvijek · ${price}`,
    buyFor: (price: string) => `Kupi · ${price}`,
    fineLifetime: "Jednokratno plaćanje, bez obnavljanja.",
    fineOther: "Trgovina prikazuje sve o plaćanju prije nego što platiš.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `Besplatno ${days(trialDays)}, zatim ` : ""}${price} ${every}, dok pretplatu ne otkažeš u opcijama trgovine — to možeš bilo kad.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} BESPLATNO`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Trener bez ograničenja",
      history: "Zadnjih 50 partija",
      analysis: "Analiza svake partije",
      export: "Izvoz partija",
      bigTable: "Stolovi za 7–8 osoba",
      lanSeats: "Wi‑Fi igra do 8 osoba",
      looks: "Svi špilovi, čoje i poleđine",
      stats: "Proširena statistika",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Trener bez ograničenja", note: "rizik trope i šanse za pobjedu pri svakom potezu" },
      { title: "Analiza svake partije", note: "zadnjih 50 partija, snimci, izvoz" },
      { title: "Stolovi za 7–8 osoba", note: "na jednom telefonu i preko Wi‑Fi mreže (dovoljno je da domaćin ima Pro)" },
      { title: "Proširena statistika", note: "načini igre, protivnici, sljedeći protivnik" },
      { title: "Špilovi, čoje i poleđine", note: "za Wi‑Fi stolom svi vide domaćinov izgled" },
    ],
    lead: "Igra ostaje ista — a trener, analiza i veliki stolovi su bez ograničenja.",
    buyFailed: "Plaćanje nije uspjelo. Pokušaj opet za koji trenutak.",
    pending: "Trgovina još potvrđuje plaćanje — Oczko Pro će se uključiti sam čim to bude gotovo.",
    nothingToRestore: "Na ovom računu u trgovini nema ranije kupljenog Oczko Pro.",
    noStore: "Plaćanje u aplikaciji još nije dostupno u ovoj verziji.",
    noPrices: "Cijene nije moguće učitati iz trgovine. Provjeri internet vezu.",
    plan: "Plan",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "Imam kod",
    terms: "Pravila upotrebe",
    privacy: "Privatnost",
  },

  limit: {
    later: "Možda kasnije",
    adLabel: (reward: string) => `Pogledaj reklamu: ${reward}`,
    adTitle: (reward: string) => `Pogledaj reklamu · ${reward}`,
    adLength: "oko 30 sekundi",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Imaš kod?",
    leadAndroid: "Upiši kod za Oczko Pro i potvrdi ga u trgovini Google Play — Oczko Pro se uključuje na tvom računu u trgovini.",
    leadIos: "Kodovi za Oczko Pro upisuju se u prozoru trgovine App Store. Oczko Pro se uključuje na tvom Apple računu.",
    placeholder: "NPR. OCZKO2026XYZ",
    code: "Kod",
    goAndroid: "Iskoristi u Google Play",
    goIos: "Upiši kod u App Store",
    fine: "Kod vrijedi jednom i samo na jednom računu u trgovini. Oczko Pro iz koda vraćaš na drugom uređaju preko „Vrati kupljeno“.",
    openFailed: "Trgovinu nije moguće otvoriti. Pokušaj opet.",
    finishIn: (store: string) => `Dovrši u trgovini ${store}`,
    stepOpened: (store: string) => `Otvorena je trgovina ${store}`,
    stepConfirm: "Potvrdi kod u trgovini",
    stepBack: "Vrati se ovamo — aplikacija sama provjerava",
    checkNow: "Provjeri sada",
    otherCode: "Upiši drugi kod",
    checking: "Provjeravam račun u trgovini…",
    accepted: "Kod je prihvaćen!",
    active: "OCZKO PRO JE AKTIVAN",
    gives: "Savjeti i analize bez ograničenja, veliki stolovi, svi špilovi i čoje, bez reklama.",
    play: "Igraj",
    offline: "Nema veze",
    notYet: "Oczko Pro se još ne vidi",
    offlineLead: "Povezivanje s trgovinom nije uspjelo. Provjeri internet i pokušaj opet.",
    notYetLead: "Trgovina još nije potvrdila kod na ovom računu. Mogući razlozi:",
    reasons: (store: string) => [
      `• postupak u trgovini ${store} nije dovršen,`,
      "• kod je već upotrijebljen ili mu je istekao rok,",
      "• u trgovini je prijavljen drugi račun,",
      "• trgovini treba još malo vremena.",
    ],
    retry: "Provjeri opet",
    again: "Upiši kod još jednom",
    noExpiry: "Bez roka važenja.",
    renews: (expires: number) => `Pretplata se obnavlja u trgovini, a otkazati je možeš u opcijama trgovine. Sljedeće obnavljanje: ${date(expires)}`,
    validUntil: (expires: number) => `Vrijedi do ${date(expires)}`,
  },

  looks: {
    title: "Izgled",
    tabs: { deck: "Špilovi", felt: "Čoje", back: "Poleđine" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Klasičan", note: "dvije boje" },
      "deck.four": { name: "Četiri boje", note: "plavi karo, zeleni tref" },
      "deck.large": { name: "Velike oznake", note: "čitljiv iz daljine" },
      "deck.gold": { name: "Zlatni", note: "krem i zlato" },
      "deck.night": { name: "Noćni", note: "tamne karte" },
      "felt.green": { name: "Zelena", note: "klasična čoja" },
      "felt.burgundy": { name: "Bordo", note: "topla i tamna" },
      "felt.navy": { name: "Tamnoplava", note: "smirena" },
      "felt.walnut": { name: "Orah", note: "drvena ploča" },
      "felt.graphite": { name: "Grafit", note: "moderna" },
      "back.classic": { name: "Klasična", note: "plava, na kockice" },
      "back.copper": { name: "Bakrena", note: "" },
      "back.green": { name: "Zelena", note: "" },
      "back.black": { name: "Crna", note: "" },
      "back.gold": { name: "Zlatna", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Pregled: špil ${deck}, čoja ${felt}, poleđina ${back}`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", u upotrebi" : ""}${locked ? ", u Oczko Pro" : ""}`,
    inUse: "u upotrebi",
    /** "do 21:05" — a trial's end. */
    trialUntil: (time: string) => `do ${time}`,
    previewOf: (name: string) => `„${name}“ · pregled`,
    tryIt: "▶ Isprobaj 24 h",
    allInPro: "Sve u Pro",
  },
};
