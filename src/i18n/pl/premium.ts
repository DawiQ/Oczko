// Polish: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { LookKind } from "../../premium/looks";
import type { PlanKind } from "../../premium/plans";
import type { PaywallReason } from "../../premium/PremiumProvider";

const days = (n: number) => (n === 1 ? "1 dzień" : `${n} dni`);

const MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
/** "5 marca 2027" (no Intl: Hermes' support is partial). */
const date = (ms: number) => {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Chwileczkę…",
  adFailed: "Reklama niedostępna — spróbuj za chwilę.",
  restore: "Przywróć zakupy",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Tygodniowo",
      monthly: "Miesięcznie",
      twoMonths: "Na 2 miesiące",
      threeMonths: "Na 3 miesiące",
      sixMonths: "Na pół roku",
      yearly: "Rocznie",
      lifetime: "Na zawsze",
      other: "Oczko Pro",
    } as Record<PlanKind, string>,
    /** "/ rok" in the plan's note. */
    per: {
      weekly: "tydzień",
      monthly: "miesiąc",
      twoMonths: "2 miesiące",
      threeMonths: "3 miesiące",
      sixMonths: "pół roku",
      yearly: "rok",
    } as Partial<Record<PlanKind, string>>,
    /** "co rok" in the fine print. */
    every: {
      weekly: "co tydzień",
      monthly: "co miesiąc",
      twoMonths: "co 2 miesiące",
      threeMonths: "co 3 miesiące",
      sixMonths: "co pół roku",
      yearly: "co rok",
    } as Partial<Record<PlanKind, string>>,
    days,
    lifetimeNote: (price: string) => `Jednorazowo ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} za darmo, potem ${price} / ${per}`,
    buy: "Kup Oczko Pro",
    tryFree: (trialDays: number) => `Wypróbuj ${days(trialDays)} za darmo`,
    buyLifetime: (price: string) => `Kup na zawsze · ${price}`,
    buyFor: (price: string) => `Kup · ${price}`,
    fineLifetime: "Płatność jednorazowa, bez odnowień.",
    fineOther: "Warunki płatności podaje sklep przed zakupem.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `Bez opłaty przez ${days(trialDays)}. Potem ` : ""}${price} ${every}, dopóki nie anulujesz w ustawieniach sklepu — możesz to zrobić w każdej chwili.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} ZA DARMO`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Trener bez limitu",
      history: "50 ostatnich partii",
      analysis: "Analiza każdej partii",
      export: "Eksport historii",
      bigTable: "Stoły dla 7–8 osób",
      lanSeats: "Stół Wi‑Fi do 8 osób",
      looks: "Wszystkie talie, sukna i rewersy",
      stats: "Rozszerzone statystyki",
      profile: "Oczko Pro",
    } as Record<PaywallReason, string>,
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Trener bez limitu", note: "szansa na furę i szanse wygranej przy każdym ruchu" },
      { title: "Analiza każdej partii", note: "50 ostatnich partii, powtórki, eksport" },
      { title: "Stoły dla 7–8 osób", note: "przy telefonie i przez Wi‑Fi (wystarczy gospodarz z Pro)" },
      { title: "Rozszerzone statystyki", note: "tryby, rywale, następny rywal" },
      { title: "Talie, sukna i rewersy", note: "przy stole Wi‑Fi wygląd gospodarza widzą wszyscy" },
    ] as { title: string; note: string }[],
    lead: "Gra jak dotąd — a trener, analiza i duże stoły bez limitów.",
    buyFailed: "Zakup się nie udał. Spróbuj jeszcze raz za chwilę.",
    pending: "Sklep jeszcze potwierdza płatność — Oczko Pro włączy się samo, gdy to zrobi.",
    nothingToRestore: "Nie znaleziono wcześniejszych zakupów Oczko Pro na tym koncie sklepu.",
    noStore: "Zakupy nie są jeszcze dostępne w tej wersji aplikacji.",
    noPrices: "Nie udało się pobrać cen ze sklepu. Sprawdź połączenie z internetem.",
    plan: "Plan",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "Mam kod",
    terms: "Regulamin",
    privacy: "Prywatność",
  },

  limit: {
    later: "Może później",
    adLabel: (reward: string) => `Obejrzyj reklamę: ${reward}`,
    adTitle: (reward: string) => `Obejrzyj reklamę · ${reward}`,
    adLength: "około 30 sekund",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Masz kod?",
    leadAndroid: "Wpisz kod Oczko Pro. Potwierdzisz go w Google Play — Oczko Pro włączy się na Twoim koncie sklepu.",
    leadIos: "Kody Oczko Pro wpisuje się w okienku App Store. Oczko Pro włączy się na Twoim koncie Apple.",
    placeholder: "NP. OCZKO2026XYZ",
    code: "Kod",
    goAndroid: "Zrealizuj w Google Play",
    goIos: "Wpisz kod w App Store",
    fine: "Kod działa raz i tylko na jednym koncie sklepu. Oczko Pro z kodu przywrócisz na innym urządzeniu przez „Przywróć zakupy”.",
    openFailed: "Nie udało się otworzyć sklepu. Spróbuj jeszcze raz.",
    finishIn: (store: string) => `Dokończ w ${store}`,
    stepOpened: (store: string) => `Otworzyliśmy ${store}`,
    stepConfirm: "Potwierdź kod w sklepie",
    stepBack: "Wróć tutaj — sprawdzimy sami",
    checkNow: "Sprawdź teraz",
    otherCode: "Wpisz inny kod",
    checking: "Sprawdzam konto sklepu…",
    accepted: "Kod przyjęty!",
    active: "OCZKO PRO AKTYWNE",
    gives: "Podpowiedzi i analizy bez limitu, duże stoły, wszystkie talie i sukna, bez reklam.",
    play: "Graj",
    offline: "Brak połączenia",
    notYet: "Jeszcze nie widać Oczko Pro",
    offlineLead: "Nie udało się połączyć ze sklepem. Sprawdź internet i spróbuj ponownie.",
    notYetLead: "Sklep nie potwierdził jeszcze kodu na tym koncie. Możliwe, że:",
    reasons: (store: string) => [
      `• realizacja nie została dokończona w ${store},`,
      "• kod został już wykorzystany albo wygasł,",
      "• w sklepie jest zalogowane inne konto,",
      "• sklep potrzebuje jeszcze chwili.",
    ],
    retry: "Sprawdź ponownie",
    again: "Wpisz kod jeszcze raz",
    noExpiry: "Bez terminu ważności.",
    renews: (expires: number) => `Do ${date(expires)}, potem odnowi się w sklepie — możesz to anulować w ustawieniach sklepu.`,
    validUntil: (expires: number) => `Ważne do ${date(expires)}.`,
  },

  looks: {
    title: "Wygląd",
    tabs: { deck: "Talie", felt: "Sukna", back: "Rewersy" } as Record<LookKind, string>,
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Klasyczna", note: "dwa kolory" },
      "deck.four": { name: "Czterokolorowa", note: "karo niebieskie, trefl zielony" },
      "deck.large": { name: "Duże indeksy", note: "czytelna z daleka" },
      "deck.gold": { name: "Złota", note: "kremowa ze złotem" },
      "deck.night": { name: "Nocna", note: "ciemne karty" },
      "felt.green": { name: "Zielone", note: "klasyczne sukno" },
      "felt.burgundy": { name: "Bordowe", note: "ciepłe i ciemne" },
      "felt.navy": { name: "Granatowe", note: "spokojne" },
      "felt.walnut": { name: "Orzech", note: "drewniany blat" },
      "felt.graphite": { name: "Grafit", note: "nowoczesne" },
      "back.classic": { name: "Klasyczny", note: "niebieski w kratkę" },
      "back.copper": { name: "Miedziany", note: "" },
      "back.green": { name: "Zielony", note: "" },
      "back.black": { name: "Czarny", note: "" },
      "back.gold": { name: "Złoty", note: "" },
    } as Record<string, { name: string; note: string }>,
    previewLabel: (deck: string, felt: string, back: string) => `Podgląd: ${deck}, sukno ${felt}, rewers ${back}`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", w użyciu" : ""}${locked ? ", w Oczko Pro" : ""}`,
    inUse: "w użyciu",
    /** "do 21:05" — a trial's end. */
    trialUntil: (time: string) => `do ${time}`,
    previewOf: (name: string) => `„${name}” · podgląd`,
    tryIt: "▶ Wypróbuj 24 h",
    allInPro: "Wszystkie w Pro",
  },
};
