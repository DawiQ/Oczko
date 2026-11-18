// English: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { pl } from "../pl";
import { germanicForm } from "../plural";

const days = (n: number) => `${n} ${germanicForm(n) === "one" ? "day" : "days"}`;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "5 March 2027" (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "One moment…",
  adFailed: "Ad unavailable — try again in a moment.",
  restore: "Restore purchases",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Weekly",
      monthly: "Monthly",
      twoMonths: "2 months",
      threeMonths: "3 months",
      sixMonths: "6 months",
      yearly: "Yearly",
      lifetime: "Lifetime",
      other: "Oczko Pro",
    },
    /** "/ year" in the plan's note. */
    per: {
      weekly: "week",
      monthly: "month",
      twoMonths: "2 months",
      threeMonths: "3 months",
      sixMonths: "6 months",
      yearly: "year",
    },
    /** "every year" in the fine print. */
    every: {
      weekly: "every week",
      monthly: "every month",
      twoMonths: "every 2 months",
      threeMonths: "every 3 months",
      sixMonths: "every 6 months",
      yearly: "every year",
    },
    days,
    lifetimeNote: (price: string) => `${price} once`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} free, then ${price} / ${per}`,
    buy: "Get Oczko Pro",
    tryFree: (trialDays: number) => `Try ${days(trialDays)} free`,
    buyLifetime: (price: string) => `Buy lifetime · ${price}`,
    buyFor: (price: string) => `Buy · ${price}`,
    fineLifetime: "One-time payment, no renewals.",
    fineOther: "The store shows the payment terms before you buy.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `Free for ${days(trialDays)}, then ` : ""}${price} ${every}. Renews automatically until you cancel in the store settings — you can do that at any time.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} FREE`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Unlimited Coach",
      history: "Your last 50 matches",
      analysis: "Analysis of every match",
      export: "History export",
      bigTable: "Tables for 7–8 people",
      lanSeats: "Wi‑Fi table for up to 8",
      looks: "All decks, felts and backs",
      stats: "Extended statistics",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Unlimited Coach", note: "chance to bust and chances to win on every move" },
      { title: "Analysis of every match", note: "last 50 matches, replays, export" },
      { title: "Tables for 7–8 people", note: "on one phone and over Wi‑Fi (only the host needs Pro)" },
      { title: "Extended statistics", note: "modes, opponents, next opponent" },
      { title: "Decks, felts and backs", note: "at a Wi‑Fi table everyone sees the host's look" },
    ],
    lead: "Play just as before — plus the Coach, analysis and big tables without limits.",
    buyFailed: "The purchase didn't go through. Try again in a moment.",
    pending: "The store is still confirming the payment — Oczko Pro will turn on by itself once it does.",
    nothingToRestore: "No earlier Oczko Pro purchases were found on this store account.",
    noStore: "Purchases aren't available in this version of the app yet.",
    noPrices: "Couldn't load prices from the store. Check your internet connection.",
    plan: "Plan",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "I have a code",
    terms: "Terms",
    privacy: "Privacy",
  },

  limit: {
    later: "Maybe later",
    adLabel: (reward: string) => `Watch an ad: ${reward}`,
    adTitle: (reward: string) => `Watch an ad · ${reward}`,
    adLength: "about 30 seconds",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Have a code?",
    leadAndroid: "Enter your Oczko Pro code. You'll confirm it in Google Play — Oczko Pro will turn on for your store account.",
    leadIos: "Oczko Pro codes are entered in the App Store window. Oczko Pro will turn on for your Apple account.",
    placeholder: "E.G. OCZKO2026XYZ",
    code: "Code",
    goAndroid: "Redeem in Google Play",
    goIos: "Enter code in App Store",
    fine: "A code works once and on one store account only. On another device, get Oczko Pro from a code back with “Restore purchases”.",
    openFailed: "Couldn't open the store. Try again.",
    finishIn: (store: string) => `Finish in ${store}`,
    stepOpened: (store: string) => `We opened ${store}`,
    stepConfirm: "Confirm the code in the store",
    stepBack: "Come back here — we'll check by ourselves",
    checkNow: "Check now",
    otherCode: "Enter another code",
    checking: "Checking your store account…",
    accepted: "Code accepted!",
    active: "OCZKO PRO ACTIVE",
    gives: "Unlimited hints and analysis, big tables, all decks and felts, no ads.",
    play: "Play",
    offline: "No connection",
    notYet: "No Oczko Pro yet",
    offlineLead: "Couldn't connect to the store. Check your internet and try again.",
    notYetLead: "The store hasn't confirmed the code on this account yet. Perhaps:",
    reasons: (store: string) => [
      `• the redemption wasn't finished in ${store},`,
      "• the code has already been used or has expired,",
      "• a different account is signed in to the store,",
      "• the store needs a little more time.",
    ],
    retry: "Check again",
    again: "Enter the code again",
    noExpiry: "No expiry date.",
    renews: (expires: number) => `Until ${date(expires)}, then it renews in the store — you can cancel it in the store settings.`,
    validUntil: (expires: number) => `Valid until ${date(expires)}.`,
  },

  looks: {
    title: "Look",
    tabs: { deck: "Decks", felt: "Felts", back: "Backs" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Classic", note: "two colours" },
      "deck.four": { name: "Four-colour", note: "blue diamonds, green clubs" },
      "deck.large": { name: "Large index", note: "easy to read from afar" },
      "deck.gold": { name: "Gold", note: "cream and gold" },
      "deck.night": { name: "Night", note: "dark cards" },
      "felt.green": { name: "Green", note: "classic felt" },
      "felt.burgundy": { name: "Burgundy", note: "warm and dark" },
      "felt.navy": { name: "Navy", note: "calm" },
      "felt.walnut": { name: "Walnut", note: "wooden tabletop" },
      "felt.graphite": { name: "Graphite", note: "modern" },
      "back.classic": { name: "Classic", note: "blue check" },
      "back.copper": { name: "Copper", note: "" },
      "back.green": { name: "Green", note: "" },
      "back.black": { name: "Black", note: "" },
      "back.gold": { name: "Gold", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Preview: ${deck} deck, ${felt} felt, ${back} back`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", in use" : ""}${locked ? ", in Oczko Pro" : ""}`,
    inUse: "in use",
    /** "until 21:05" — a trial's end. */
    trialUntil: (time: string) => `until ${time}`,
    previewOf: (name: string) => `“${name}” · preview`,
    tryIt: "▶ Try for 24 h",
    allInPro: "All in Pro",
  },
};
