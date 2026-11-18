// German: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { pl } from "../pl";
import { germanicForm } from "../plural";

const days = (n: number) => `${n} ${germanicForm(n) === "one" ? "Tag" : "Tage"}`;

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
/** "5. März 2027" (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "im App Store", "in Google Play". */
const inStore = (store: string) => (store === "App Store" ? `im ${store}` : `in ${store}`);

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Einen Moment…",
  adFailed: "Werbung nicht verfügbar — versuch es gleich noch einmal.",
  restore: "Käufe wiederherstellen",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Wöchentlich",
      monthly: "Monatlich",
      twoMonths: "2 Monate",
      threeMonths: "3 Monate",
      sixMonths: "6 Monate",
      yearly: "Jährlich",
      lifetime: "Dauerhaft",
      other: "Oczko Pro",
    },
    /** "/ Jahr" in the plan's note. */
    per: {
      weekly: "Woche",
      monthly: "Monat",
      twoMonths: "2 Monate",
      threeMonths: "3 Monate",
      sixMonths: "6 Monate",
      yearly: "Jahr",
    },
    /** "pro Jahr" in the fine print. */
    every: {
      weekly: "pro Woche",
      monthly: "pro Monat",
      twoMonths: "alle 2 Monate",
      threeMonths: "alle 3 Monate",
      sixMonths: "alle 6 Monate",
      yearly: "pro Jahr",
    },
    days,
    lifetimeNote: (price: string) => `Einmalig ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} gratis, dann ${price} / ${per}`,
    buy: "Oczko Pro kaufen",
    tryFree: (trialDays: number) => `${days(trialDays)} gratis testen`,
    buyLifetime: (price: string) => `Dauerhaft kaufen · ${price}`,
    buyFor: (price: string) => `Kaufen · ${price}`,
    fineLifetime: "Einmalzahlung, keine Verlängerung.",
    fineOther: "Die Zahlungsbedingungen zeigt der Store vor dem Kauf.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `${days(trialDays)} kostenlos, danach ` : ""}${price} ${every}. Das Abo verlängert sich automatisch, bis du es in den Store-Einstellungen kündigst — das geht jederzeit.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} GRATIS`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Trainer ohne Limit",
      history: "Die letzten 50 Partien",
      analysis: "Analyse jeder Partie",
      export: "Verlauf exportieren",
      bigTable: "Tische für 7–8 Personen",
      lanSeats: "WLAN-Tisch für bis zu 8",
      looks: "Alle Karten, Tischtücher und Rückseiten",
      stats: "Erweiterte Statistiken",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Trainer ohne Limit", note: "Risiko, sich zu überkaufen, und Gewinnchancen bei jedem Zug" },
      { title: "Analyse jeder Partie", note: "die letzten 50 Partien, Wiederholungen, Export" },
      { title: "Tische für 7–8 Personen", note: "an einem Handy und per WLAN (Pro beim Gastgeber genügt)" },
      { title: "Erweiterte Statistiken", note: "Modi, Gegner, nächster Gegner" },
      { title: "Karten, Tischtücher und Rückseiten", note: "am WLAN-Tisch sehen alle das Aussehen des Gastgebers" },
    ],
    lead: "Du spielst wie bisher — dazu Trainer, Analyse und große Tische ohne Limit.",
    buyFailed: "Der Kauf hat nicht geklappt. Versuch es gleich noch einmal.",
    pending: "Der Store bestätigt die Zahlung noch — Oczko Pro wird automatisch aktiviert, sobald das passiert ist.",
    nothingToRestore: "Auf diesem Store-Konto wurden keine früheren Käufe von Oczko Pro gefunden.",
    noStore: "Käufe sind in dieser App-Version noch nicht verfügbar.",
    noPrices: "Die Preise konnten nicht aus dem Store geladen werden. Prüfe deine Internetverbindung.",
    plan: "Tarif",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "Ich habe einen Code",
    terms: "AGB",
    privacy: "Datenschutz",
  },

  limit: {
    later: "Vielleicht später",
    adLabel: (reward: string) => `Werbung ansehen: ${reward}`,
    adTitle: (reward: string) => `Werbung ansehen · ${reward}`,
    adLength: "etwa 30 Sekunden",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Hast du einen Code?",
    leadAndroid: "Gib deinen Code für Oczko Pro ein. Du bestätigst ihn in Google Play — dann wird Oczko Pro für dein Store-Konto aktiviert.",
    leadIos: "Codes für Oczko Pro gibst du im Fenster des App Stores ein. Oczko Pro wird dann für deinen Apple-Account aktiviert.",
    placeholder: "Z. B. OCZKO2026XYZ",
    code: "Code",
    goAndroid: "In Google Play einlösen",
    goIos: "Code im App Store eingeben",
    fine: "Ein Code lässt sich nur einmal und nur für ein Store-Konto einlösen. Auf einem anderen Gerät stellst du Oczko Pro aus einem Code über „Käufe wiederherstellen“ wieder her.",
    openFailed: "Der Store ließ sich nicht öffnen. Versuch es noch einmal.",
    finishIn: (store: string) => (store === "App Store" ? `Im ${store} abschließen` : `In ${store} abschließen`),
    stepOpened: (store: string) => (store === "App Store" ? `Der ${store} ist geöffnet` : `${store} ist geöffnet`),
    stepConfirm: "Bestätige den Code im Store",
    stepBack: "Komm hierher zurück — wir prüfen das selbst",
    checkNow: "Jetzt prüfen",
    otherCode: "Anderen Code eingeben",
    checking: "Store-Konto wird geprüft…",
    accepted: "Code angenommen!",
    active: "OCZKO PRO AKTIV",
    gives: "Tipps und Analysen ohne Limit, große Tische, alle Karten und Tischtücher, keine Werbung.",
    play: "Spielen",
    offline: "Keine Verbindung",
    notYet: "Noch kein Oczko Pro",
    offlineLead: "Keine Verbindung zum Store. Prüfe dein Internet und versuch es erneut.",
    notYetLead: "Der Store hat den Code auf diesem Konto noch nicht bestätigt. Mögliche Gründe:",
    reasons: (store: string) => [
      `• das Einlösen wurde ${inStore(store)} nicht abgeschlossen,`,
      "• der Code wurde schon verwendet oder ist abgelaufen,",
      "• im Store ist ein anderes Konto angemeldet,",
      "• der Store braucht noch einen Moment.",
    ],
    retry: "Erneut prüfen",
    again: "Code erneut eingeben",
    noExpiry: "Ohne Ablaufdatum.",
    renews: (expires: number) => `Bis ${date(expires)}, danach verlängert sich das Abo im Store — kündigen kannst du es in den Store-Einstellungen.`,
    validUntil: (expires: number) => `Gültig bis ${date(expires)}.`,
  },

  looks: {
    title: "Aussehen",
    tabs: { deck: "Karten", felt: "Tischtücher", back: "Rückseiten" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Klassisch", note: "zwei Farben" },
      "deck.four": { name: "Vierfarbig", note: "Karo blau, Kreuz grün" },
      "deck.large": { name: "Große Indizes", note: "gut lesbar aus der Ferne" },
      "deck.gold": { name: "Gold", note: "cremeweiß mit Gold" },
      "deck.night": { name: "Nacht", note: "dunkle Karten" },
      "felt.green": { name: "Grün", note: "klassisches Tuch" },
      "felt.burgundy": { name: "Bordeaux", note: "warm und dunkel" },
      "felt.navy": { name: "Marineblau", note: "ruhig" },
      "felt.walnut": { name: "Nussbaum", note: "Tischplatte aus Holz" },
      "felt.graphite": { name: "Graphit", note: "modern" },
      "back.classic": { name: "Klassisch", note: "blau kariert" },
      "back.copper": { name: "Kupfer", note: "" },
      "back.green": { name: "Grün", note: "" },
      "back.black": { name: "Schwarz", note: "" },
      "back.gold": { name: "Gold", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Vorschau: Karten ${deck}, Tischtuch ${felt}, Rückseite ${back}`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", aktiv" : ""}${locked ? ", in Oczko Pro" : ""}`,
    inUse: "aktiv",
    /** "bis 21:05" — a trial's end. */
    trialUntil: (time: string) => `bis ${time}`,
    previewOf: (name: string) => `„${name}“ · Vorschau`,
    tryIt: "▶ 24 h testen",
    allInPro: "Alle in Pro",
  },
};
