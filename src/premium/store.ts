// Oczko Pro purchases through RevenueCat (react-native-purchases): the yearly
// plan (with the store's free trial) and the one-time purchase, behind a small
// interface the app (and the tests) use.
import Purchases, { PACKAGE_TYPE, type CustomerInfo, type PurchasesPackage } from "react-native-purchases";

import { Linking, Platform } from "react-native";

import { monetizationConfig } from "./config";

/** A promo code as typed: letters and digits only, upper case; null when it
 *  cannot be one (Google Play codes are 6+ letters and digits). */
export function cleanPromoCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[\s-]/g, "");
  return /^[A-Z0-9]{6,40}$/.test(s) ? s : null;
}

/** Google Play's redeem page with the code filled in. */
export const playRedeemUrl = (code: string) => `https://play.google.com/redeem?code=${encodeURIComponent(code)}`;

export interface Plan {
  id: string;
  kind: "yearly" | "lifetime" | "other";
  /** "19,99 zł" — the store's price in the player's currency. */
  price: string;
  /** Free trial length (null: none, or not offered to this account). */
  trialDays: number | null;
}

/** "pending": paid, but the store has not confirmed it yet (e.g. a cash
 *  payment); Pro turns on by itself when it does (onChange). */
export type PurchaseResult = "ok" | "pending" | "cancelled" | "error";

/** Oczko Pro on the store account: active, until when (null: for good, or not
 *  known), and whether the store renews it then. */
export interface ProStatus {
  active: boolean;
  expires: number | null;
  renews: boolean;
}

/** How a promo code is redeemed: typed in the app and confirmed in Google
 *  Play ("inApp"), or in the App Store's own sheet ("system"). */
export type CodeFlow = "inApp" | "system" | "none";

export interface StoreApi {
  /** Purchases are configured (keys present, native module there). */
  readonly available: boolean;
  readonly codeFlow: CodeFlow;
  isPro(): Promise<boolean>;
  /** Ask the store again (a code redeemed outside the app shows up here). */
  sync(): Promise<ProStatus>;
  /** Start redeeming a promo code (the cleaned code for "inApp", null for
   *  "system"); resolves once the store's screen is open. */
  redeem(code: string | null): Promise<boolean>;
  plans(): Promise<Plan[]>;
  purchase(planId: string): Promise<PurchaseResult>;
  /** Restore earlier purchases; resolves whether Pro is active. */
  restore(): Promise<boolean>;
  /** The store's subscription settings. */
  manage(): Promise<void>;
  /** Called when the purchase state changes (renewal, refund, another device). */
  onChange(fn: (pro: boolean) => void): () => void;
}

/** "P7D" / "P1W" / "P1M" -> days. */
export function isoDays(iso: string | null | undefined): number | null {
  const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(iso ?? "");
  if (!m) return null;
  const [y, mo, w, d] = m.slice(1).map((x) => Number(x ?? 0));
  const days = y * 365 + mo * 30 + w * 7 + d;
  return days > 0 ? days : null;
}

export function planOf(p: PurchasesPackage): Plan {
  const prod = p.product;
  const intro = prod.introPrice;
  const trial =
    intro && intro.price === 0
      ? isoDays(intro.period)
      : isoDays(prod.defaultOption?.freePhase?.billingPeriod?.iso8601 ?? null);
  return {
    id: p.identifier,
    kind: p.packageType === PACKAGE_TYPE.ANNUAL ? "yearly" : p.packageType === PACKAGE_TYPE.LIFETIME ? "lifetime" : "other",
    price: prod.priceString,
    trialDays: trial,
  };
}

/** No purchases in this build (no key, or the native module is missing). */
export const noStore: StoreApi = {
  available: false,
  codeFlow: "none",
  sync: async () => ({ active: false, expires: null, renews: false }),
  redeem: async () => false,
  isPro: async () => false,
  plans: async () => [],
  purchase: async () => "error",
  restore: async () => false,
  manage: async () => {},
  onChange: () => () => {},
};

export function revenueCatStore(): StoreApi {
  const { revenueCatKey, entitlement } = monetizationConfig();
  if (!revenueCatKey) return noStore;
  try {
    Purchases.configure({ apiKey: revenueCatKey });
  } catch {
    return noStore;
  }
  const active = (info: CustomerInfo) => !!info.entitlements.active[entitlement];
  const status = (info: CustomerInfo): ProStatus => {
    const e = info.entitlements.active[entitlement];
    return { active: !!e, expires: e?.expirationDateMillis ?? null, renews: !!e?.willRenew };
  };
  const android = Platform.OS === "android";
  let packages: PurchasesPackage[] = [];
  return {
    available: true,
    codeFlow: android ? "inApp" : Platform.OS === "ios" ? "system" : "none",
    isPro: async () => active(await Purchases.getCustomerInfo()),
    sync: async () => {
      if (android) return status((await Purchases.syncPurchasesForResult()).customerInfo);
      // iOS: the redeemed code arrives as a transaction; skip the cached state.
      await Purchases.invalidateCustomerInfoCache();
      return status(await Purchases.getCustomerInfo());
    },
    redeem: async (code) => {
      try {
        if (android) {
          if (!code) return false;
          await Linking.openURL(playRedeemUrl(code));
        } else await Purchases.presentCodeRedemptionSheet();
        return true;
      } catch {
        return false;
      }
    },
    plans: async () => {
      const offerings = await Purchases.getOfferings();
      packages = offerings.current?.availablePackages ?? [];
      return packages.map(planOf);
    },
    purchase: async (planId) => {
      const pkg = packages.find((p) => p.identifier === planId);
      if (!pkg) return "error";
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return active(customerInfo) ? "ok" : "pending";
      } catch (e) {
        return (e as { userCancelled?: boolean }).userCancelled ? "cancelled" : "error";
      }
    },
    restore: async () => active(await Purchases.restorePurchases()),
    manage: async () => {
      await Purchases.showManageSubscriptions();
    },
    onChange: (fn) => {
      const listener = (info: CustomerInfo) => fn(active(info));
      Purchases.addCustomerInfoUpdateListener(listener);
      return () => {
        Purchases.removeCustomerInfoUpdateListener(listener);
      };
    },
  };
}
