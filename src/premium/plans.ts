// Oczko Pro plans as the store offers them: the kind of each RevenueCat
// package (its package type, or the product's own period for a custom one)
// and the paywall's texts for it. Nothing here names a product: the owner
// sets the products, their order and the offering in RevenueCat.
import { pl, type Strings } from "../i18n/pl";

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

export const days = (n: number, s: Strings = pl) => s.premium.plans.days(n);

export const planTitle = (p: Plan, s: Strings = pl): string => s.premium.plans.title[p.kind];

export function planNote(p: Plan, s: Strings = pl): string {
  const t = s.premium.plans;
  if (p.kind === "lifetime") return t.lifetimeNote(p.price);
  const per = t.per[p.kind];
  if (!per) return p.price;
  return p.trialDays ? t.trialNote(p.trialDays, p.price, per) : t.note(p.price, per);
}

export function ctaLabel(p: Plan | undefined, s: Strings = pl): string {
  const t = s.premium.plans;
  if (!p) return t.buy;
  if (p.trialDays && isSubscription(p.kind)) return t.tryFree(p.trialDays);
  return p.kind === "lifetime" ? t.buyLifetime(p.price) : t.buyFor(p.price);
}

export function finePrint(p: Plan | undefined, s: Strings = pl): string {
  if (!p) return "";
  const t = s.premium.plans;
  if (p.kind === "lifetime") return t.fineLifetime;
  const every = t.every[p.kind];
  if (!every) return t.fineOther;
  return t.fine(p.trialDays, p.price, every);
}

/** The plan picked at first: the one with a free trial, else the first in the
 *  offering's order (set in RevenueCat). */
export const defaultPlan = (plans: readonly Plan[]): Plan | undefined => plans.find((p) => p.trialDays && isSubscription(p.kind)) ?? plans[0];
