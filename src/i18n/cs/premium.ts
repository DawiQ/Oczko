// Czech: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { pl } from "../pl";
import { count } from "./common";

/** "1 den", "3 dny", "7 dní". */
const days = (n: number) => count(n, "den", "dny", "dní");

const MONTHS = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
/** "5. března 2027" (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "v App Storu", "v Google Play". */
const inStore = (store: string) => (store === "App Store" ? "v App Storu" : `v ${store}`);

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Okamžik…",
  adFailed: "Reklama není k dispozici — zkus to za chvíli.",
  restore: "Obnovit nákupy",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Týdně",
      monthly: "Měsíčně",
      twoMonths: "Na 2 měsíce",
      threeMonths: "Na 3 měsíce",
      sixMonths: "Na půl roku",
      yearly: "Ročně",
      lifetime: "Navždy",
      other: "Oczko Pro",
    },
    /** "/ rok" in the plan's note. */
    per: {
      weekly: "týden",
      monthly: "měsíc",
      twoMonths: "2 měsíce",
      threeMonths: "3 měsíce",
      sixMonths: "půl roku",
      yearly: "rok",
    },
    /** "každý rok" in the fine print. */
    every: {
      weekly: "každý týden",
      monthly: "každý měsíc",
      twoMonths: "každé 2 měsíce",
      threeMonths: "každé 3 měsíce",
      sixMonths: "jednou za půl roku",
      yearly: "každý rok",
    },
    days,
    lifetimeNote: (price: string) => `Jednorázově ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} zdarma, pak ${price} / ${per}`,
    buy: "Koupit Oczko Pro",
    tryFree: (trialDays: number) => `Vyzkoušet ${days(trialDays)} zdarma`,
    buyLifetime: (price: string) => `Koupit navždy · ${price}`,
    buyFor: (price: string) => `Koupit · ${price}`,
    fineLifetime: "Jednorázová platba, bez obnovování.",
    fineOther: "Platební podmínky uvede obchod před nákupem.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `${days(trialDays)} zdarma. Pak ` : ""}${price} ${every}, dokud předplatné nezrušíš v nastavení obchodu — můžeš to udělat kdykoli.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} ZDARMA`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Trenér bez limitu",
      history: "Posledních 50 partií",
      analysis: "Analýza každé partie",
      export: "Export historie",
      bigTable: "Stoly pro 7–8 lidí",
      lanSeats: "Stůl přes Wi‑Fi až pro 8 lidí",
      looks: "Všechny karty, sukna a rubové strany",
      stats: "Rozšířené statistiky",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Trenér bez limitu", note: "riziko přetažení a šance na výhru při každém tahu" },
      { title: "Analýza každé partie", note: "posledních 50 partií, záznamy, export" },
      { title: "Stoly pro 7–8 lidí", note: "u jednoho telefonu i přes Wi‑Fi (stačí hostitel s Pro)" },
      { title: "Rozšířené statistiky", note: "režimy, soupeři, další soupeř" },
      { title: "Karty, sukna a rubové strany", note: "u stolu přes Wi‑Fi vidí všichni vzhled hostitele" },
    ],
    lead: "Hraješ jako dosud — a k tomu trenér, analýza a velké stoly bez limitu.",
    buyFailed: "Nákup se nepodařil. Zkus to za chvíli znovu.",
    pending: "Obchod ještě potvrzuje platbu — Oczko Pro se zapne samo, jakmile to udělá.",
    nothingToRestore: "Na tomto účtu obchodu se nenašly žádné dřívější nákupy Oczko Pro.",
    noStore: "V této verzi aplikace zatím nejsou nákupy k dispozici.",
    noPrices: "Ceny se z obchodu nepodařilo načíst. Zkontroluj připojení k internetu.",
    plan: "Tarif",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "Mám kód",
    terms: "Podmínky",
    privacy: "Soukromí",
  },

  limit: {
    later: "Možná později",
    adLabel: (reward: string) => `Zhlédnout reklamu: ${reward}`,
    adTitle: (reward: string) => `Zhlédnout reklamu · ${reward}`,
    adLength: "asi 30 sekund",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Máš kód?",
    leadAndroid: "Zadej kód Oczko Pro. Potvrdíš ho v Google Play — Oczko Pro se zapne na tvém účtu obchodu.",
    leadIos: "Kódy Oczko Pro se zadávají v okně App Storu. Oczko Pro se zapne na tvém účtu Apple.",
    placeholder: "NAPŘ. OCZKO2026XYZ",
    code: "Kód",
    goAndroid: "Uplatnit v Google Play",
    goIos: "Zadat kód v App Storu",
    fine: "Kód platí jednou a jen pro jeden účet obchodu. Na jiném zařízení obnovíš Oczko Pro z kódu přes „Obnovit nákupy“.",
    openFailed: "Obchod se nepodařilo otevřít. Zkus to znovu.",
    finishIn: (store: string) => `Dokonči ${inStore(store)}`,
    stepOpened: (store: string) => `Otevřeli jsme ${store}`,
    stepConfirm: "Potvrď kód v obchodě",
    stepBack: "Vrať se sem — zkontrolujeme to sami",
    checkNow: "Zkontrolovat teď",
    otherCode: "Zadat jiný kód",
    checking: "Kontroluji účet obchodu…",
    accepted: "Kód přijat!",
    active: "OCZKO PRO AKTIVNÍ",
    gives: "Rady a analýzy bez limitu, velké stoly, všechny karty a sukna, bez reklam.",
    play: "Hrát",
    offline: "Bez připojení",
    notYet: "Oczko Pro zatím není vidět",
    offlineLead: "K obchodu se nepodařilo připojit. Zkontroluj internet a zkus to znovu.",
    notYetLead: "Obchod zatím kód na tomto účtu nepotvrdil. Možné důvody:",
    reasons: (store: string) => [
      `• uplatnění nebylo dokončeno ${inStore(store)},`,
      "• kód už byl použit nebo vypršel,",
      "• v obchodě je přihlášen jiný účet,",
      "• obchod potřebuje ještě chvíli.",
    ],
    retry: "Zkontrolovat znovu",
    again: "Zadat kód znovu",
    noExpiry: "Platnost bez omezení.",
    renews: (expires: number) => `Do ${date(expires)}, pak se v obchodě obnoví — zrušit to můžeš v nastavení obchodu.`,
    validUntil: (expires: number) => `Platí do ${date(expires)}.`,
  },

  looks: {
    title: "Vzhled",
    tabs: { deck: "Karty", felt: "Sukna", back: "Rubové strany" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Klasické", note: "dvě barvy" },
      "deck.four": { name: "Čtyřbarevné", note: "káry modré, kříže zelené" },
      "deck.large": { name: "Velké indexy", note: "čitelné i zdálky" },
      "deck.gold": { name: "Zlaté", note: "krémové se zlatou" },
      "deck.night": { name: "Noční", note: "tmavé karty" },
      "felt.green": { name: "Zelené", note: "klasické sukno" },
      "felt.burgundy": { name: "Vínové", note: "teplé a tmavé" },
      "felt.navy": { name: "Tmavě modré", note: "klidné" },
      "felt.walnut": { name: "Ořech", note: "dřevěná deska" },
      "felt.graphite": { name: "Grafit", note: "moderní" },
      "back.classic": { name: "Klasický", note: "modrý kostkovaný" },
      "back.copper": { name: "Měděný", note: "" },
      "back.green": { name: "Zelený", note: "" },
      "back.black": { name: "Černý", note: "" },
      "back.gold": { name: "Zlatý", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Náhled: karty ${deck}, sukno ${felt}, rub ${back}`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", používá se" : ""}${locked ? ", v Oczko Pro" : ""}`,
    inUse: "používá se",
    /** "do 21:05" — a trial's end. */
    trialUntil: (time: string) => `do ${time}`,
    previewOf: (name: string) => `„${name}“ · náhled`,
    tryIt: "▶ Vyzkoušet 24 h",
    allInPro: "Všechny v Pro",
  },
};
