// Oczko Pro plans as the store offers them: the kind of each RevenueCat
// package (its package type, or the product's own period for a custom one)
// and the paywall's texts for it. Nothing here names a product: the owner
// sets the products, their order and the offering in RevenueCat.

export type PlanKind = "weekly" | "monthly" | "twoMonths" | "threeMonths" | "sixMonths" | "yearly" | "lifetime" | "other";

export interface Plan {
  /** The RevenueCat package identifier. */
  id: string;
  kind: PlanKind;
  /** "19,99 zł" — the store's price in the player's currency. */
  price: string;
  /** Free trial length (null: none, or not offered to this account). */
  trialDays: number | null;
}

/** RevenueCat's package types (`PACKAGE_TYPE` values). */
const BY_PACKAGE: Record<string, PlanKind> = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  TWO_MONTH: "twoMonths",
  THREE_MONTH: "threeMonths",
  SIX_MONTH: "sixMonths",
  ANNUAL: "yearly",
  LIFETIME: "lifetime",
};

/** A subscription period (ISO 8601) as a plan kind. */
const BY_PERIOD: Record<string, PlanKind> = {
  P7D: "weekly",
  P1W: "weekly",
  P1M: "monthly",
  P4W: "monthly",
  P2M: "twoMonths",
  P3M: "threeMonths",
  P6M: "sixMonths",
  P1Y: "yearly",
  P12M: "yearly",
};

/**
 * The kind of a package: its type set in RevenueCat; a custom (or unknown)
 * one by the product's period — a product without a period is a one-time
 * purchase, so Oczko Pro for good.
 */
export function planKind(packageType: string, subscriptionPeriod: string | null | undefined, oneTime: boolean): PlanKind {
  const byType = BY_PACKAGE[packageType];
  if (byType) return byType;
  if (subscriptionPeriod) return BY_PERIOD[subscriptionPeriod] ?? "other";
  return oneTime ? "lifetime" : "other";
}

export const isSubscription = (k: PlanKind) => k !== "lifetime" && k !== "other";

const TITLE: Record<PlanKind, string> = {
  weekly: "Tygodniowo",
  monthly: "Miesięcznie",
  twoMonths: "Na 2 miesiące",
  threeMonths: "Na 3 miesiące",
  sixMonths: "Na pół roku",
  yearly: "Rocznie",
  lifetime: "Na zawsze",
  other: "Oczko Pro",
};

/** "/ rok" in the plan's note. */
const PER: Partial<Record<PlanKind, string>> = {
  weekly: "tydzień",
  monthly: "miesiąc",
  twoMonths: "2 miesiące",
  threeMonths: "3 miesiące",
  sixMonths: "pół roku",
  yearly: "rok",
};

/** "co rok" in the fine print. */
const EVERY: Partial<Record<PlanKind, string>> = {
  weekly: "co tydzień",
  monthly: "co miesiąc",
  twoMonths: "co 2 miesiące",
  threeMonths: "co 3 miesiące",
  sixMonths: "co pół roku",
  yearly: "co rok",
};

export const days = (n: number) => (n === 1 ? "1 dzień" : `${n} dni`);

export const planTitle = (p: Plan): string => TITLE[p.kind];

export function planNote(p: Plan): string {
  if (p.kind === "lifetime") return `Jednorazowo ${p.price}`;
  const per = PER[p.kind];
  if (!per) return p.price;
  return p.trialDays ? `${days(p.trialDays)} za darmo, potem ${p.price} / ${per}` : `${p.price} / ${per}`;
}

export function ctaLabel(p: Plan | undefined): string {
  if (!p) return "Kup Oczko Pro";
  if (p.trialDays && isSubscription(p.kind)) return `Wypróbuj ${days(p.trialDays)} za darmo`;
  return p.kind === "lifetime" ? `Kup na zawsze · ${p.price}` : `Kup · ${p.price}`;
}

export function finePrint(p: Plan | undefined): string {
  if (!p) return "";
  if (p.kind === "lifetime") return "Płatność jednorazowa, bez odnowień.";
  const every = EVERY[p.kind];
  if (!every) return "Warunki płatności podaje sklep przed zakupem.";
  const trial = p.trialDays ? `Bez opłaty przez ${days(p.trialDays)}. Potem ` : "";
  return `${trial}${p.price} ${every}, dopóki nie anulujesz w ustawieniach sklepu — możesz to zrobić w każdej chwili.`;
}

/** The plan picked at first: the one with a free trial, else the first in the
 *  offering's order (set in RevenueCat). */
export const defaultPlan = (plans: readonly Plan[]): Plan | undefined => plans.find((p) => p.trialDays && isSubscription(p.kind)) ?? plans[0];
