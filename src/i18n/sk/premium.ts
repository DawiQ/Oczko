// Slovak: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { pl } from "../pl";
import { count } from "./common";

const days = (n: number) => count(n, "deň", "dni", "dní");

const MONTHS = ["januára", "februára", "marca", "apríla", "mája", "júna", "júla", "augusta", "septembra", "októbra", "novembra", "decembra"];
/** "18. novembra 2026" (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "v App Store", "v Google Play". */
const inStore = (store: string) => `v ${store}`;

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Chvíľku…",
  adFailed: "Reklama nie je dostupná — skús to o chvíľu.",
  restore: "Obnoviť nákupy",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Týždenne",
      monthly: "Mesačne",
      twoMonths: "Na 2 mesiace",
      threeMonths: "Na 3 mesiace",
      sixMonths: "Na pol roka",
      yearly: "Ročne",
      lifetime: "Navždy",
      other: "Oczko Pro",
    },
    /** "/ rok" in the plan's note. */
    per: {
      weekly: "týždeň",
      monthly: "mesiac",
      twoMonths: "2 mesiace",
      threeMonths: "3 mesiace",
      sixMonths: "pol roka",
      yearly: "rok",
    },
    /** "každý rok" in the fine print. */
    every: {
      weekly: "každý týždeň",
      monthly: "každý mesiac",
      twoMonths: "každé 2 mesiace",
      threeMonths: "každé 3 mesiace",
      sixMonths: "každý polrok",
      yearly: "každý rok",
    },
    days,
    lifetimeNote: (price: string) => `Jednorazovo ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} zadarmo, potom ${price} / ${per}`,
    buy: "Kúpiť Oczko Pro",
    tryFree: (trialDays: number) => `Vyskúšaj ${days(trialDays)} zadarmo`,
    buyLifetime: (price: string) => `Kúpiť navždy · ${price}`,
    buyFor: (price: string) => `Kúpiť · ${price}`,
    fineLifetime: "Jednorazová platba, bez obnovovania.",
    fineOther: "Platobné podmienky uvedie obchod pred nákupom.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `${days(trialDays)} bez poplatku. Potom ` : ""}${price} ${every}, kým predplatné nezrušíš v nastaveniach obchodu — môžeš to urobiť kedykoľvek.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} ZADARMO`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Tréner bez limitu",
      history: "Posledných 50 partií",
      analysis: "Analýza každej partie",
      export: "Export histórie",
      bigTable: "Stoly pre 7–8 osôb",
      lanSeats: "Stôl cez Wi‑Fi až pre 8 osôb",
      looks: "Všetky karty, súkna a rubové strany",
      stats: "Rozšírené štatistiky",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Tréner bez limitu", note: "šanca prekročiť 21 a šance na výhru pri každom ťahu" },
      { title: "Analýza každej partie", note: "posledných 50 partií, záznamy, export" },
      { title: "Stoly pre 7–8 osôb", note: "na jednom telefóne aj cez Wi‑Fi (stačí hostiteľ s Pro)" },
      { title: "Rozšírené štatistiky", note: "režimy, súperi, ďalší súper" },
      { title: "Karty, súkna a rubové strany", note: "pri stole cez Wi‑Fi vidia všetci vzhľad hostiteľa" },
    ],
    lead: "Hráš ako doteraz — a k tomu tréner, analýza a veľké stoly bez limitov.",
    buyFailed: "Nákup sa nepodaril. Skús to o chvíľu znova.",
    pending: "Obchod ešte potvrdzuje platbu — Oczko Pro sa zapne samo, hneď ako to urobí.",
    nothingToRestore: "Na tomto účte obchodu sa nenašli žiadne predchádzajúce nákupy Oczko Pro.",
    noStore: "Nákupy v tejto verzii aplikácie ešte nie sú dostupné.",
    noPrices: "Ceny z obchodu sa nepodarilo načítať. Skontroluj pripojenie na internet.",
    plan: "Plán",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "Mám kód",
    terms: "Podmienky",
    privacy: "Súkromie",
  },

  limit: {
    later: "Možno neskôr",
    adLabel: (reward: string) => `Pozrieť reklamu: ${reward}`,
    adTitle: (reward: string) => `Pozrieť reklamu · ${reward}`,
    adLength: "asi 30 sekúnd",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Máš kód?",
    leadAndroid: "Zadaj kód Oczko Pro. Potvrdíš ho v Google Play — Oczko Pro sa zapne na tvojom účte obchodu.",
    leadIos: "Kódy Oczko Pro sa zadávajú v okne App Store. Oczko Pro sa zapne na tvojom účte Apple.",
    placeholder: "NAPR. OCZKO2026XYZ",
    code: "Kód",
    goAndroid: "Uplatniť v Google Play",
    goIos: "Zadať kód v App Store",
    fine: "Kód funguje raz a iba na jednom účte obchodu. Na inom zariadení obnovíš Oczko Pro z kódu cez „Obnoviť nákupy“.",
    openFailed: "Obchod sa nepodarilo otvoriť. Skús to znova.",
    finishIn: (store: string) => `Dokonči ${inStore(store)}`,
    stepOpened: (store: string) => `Otvorili sme ${store}`,
    stepConfirm: "Potvrď kód v obchode",
    stepBack: "Vráť sa sem — skontrolujeme to sami",
    checkNow: "Skontrolovať teraz",
    otherCode: "Zadať iný kód",
    checking: "Kontrolujem účet obchodu…",
    accepted: "Kód prijatý!",
    active: "OCZKO PRO AKTÍVNE",
    gives: "Rady a analýzy bez limitu, veľké stoly, všetky karty a súkna, bez reklám.",
    play: "Hrať",
    offline: "Bez pripojenia",
    notYet: "Oczko Pro ešte nevidno",
    offlineLead: "S obchodom sa nepodarilo spojiť. Skontroluj internet a skús to znova.",
    notYetLead: "Obchod ešte nepotvrdil kód na tomto účte. Možné dôvody:",
    reasons: (store: string) => [
      `• uplatnenie nie je dokončené ${inStore(store)},`,
      "• kód už bol použitý alebo mu vypršala platnosť,",
      "• v obchode je prihlásený iný účet,",
      "• obchod potrebuje ešte chvíľu.",
    ],
    retry: "Skontrolovať znova",
    again: "Zadať kód ešte raz",
    noExpiry: "Bez obmedzenia platnosti.",
    renews: (expires: number) => `Do ${date(expires)}, potom sa predplatné v obchode obnoví — zrušiť ho môžeš v nastaveniach obchodu.`,
    validUntil: (expires: number) => `Platí do ${date(expires)}.`,
  },

  looks: {
    title: "Vzhľad",
    tabs: { deck: "Karty", felt: "Súkna", back: "Rubové strany" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Klasické", note: "dve farby" },
      "deck.four": { name: "Štvorfarebné", note: "káry modré, kríže zelené" },
      "deck.large": { name: "Veľké indexy", note: "čitateľné z diaľky" },
      "deck.gold": { name: "Zlaté", note: "krémové so zlatou" },
      "deck.night": { name: "Nočné", note: "tmavé karty" },
      "felt.green": { name: "Zelené", note: "klasické súkno" },
      "felt.burgundy": { name: "Bordové", note: "teplé a tmavé" },
      "felt.navy": { name: "Tmavomodré", note: "pokojné" },
      "felt.walnut": { name: "Orech", note: "drevená doska stola" },
      "felt.graphite": { name: "Grafit", note: "moderné" },
      "back.classic": { name: "Klasická", note: "modrá kockovaná" },
      "back.copper": { name: "Medená", note: "" },
      "back.green": { name: "Zelená", note: "" },
      "back.black": { name: "Čierna", note: "" },
      "back.gold": { name: "Zlatá", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Náhľad: karty ${deck}, súkno ${felt}, rubová strana ${back}`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", používa sa" : ""}${locked ? ", v Oczko Pro" : ""}`,
    inUse: "používa sa",
    /** "do 21:05" — a trial's end. */
    trialUntil: (time: string) => `do ${time}`,
    previewOf: (name: string) => `„${name}“ · náhľad`,
    tryIt: "▶ Vyskúšať na 24 h",
    allInPro: "Všetky v Pro",
  },
};
