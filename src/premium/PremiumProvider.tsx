// Oczko Pro for the whole app: whether it is active (RevenueCat, remembered for
// offline starts), today's free allowances and ad rewards (wallet.ts), and the
// Oczko Pro screen, opened from wherever a limit is reached.
//
// Without a provider (isolated component tests) everything is unlocked.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { readJSON, writeJSON, type KV } from "../storage/kv";
import { adMobAds, noAds, type AdsApi } from "./ads";
import { isFreeLook } from "./looks";
import { PaywallScreen } from "./PaywallScreen";
import { RedeemScreen } from "./RedeemScreen";
import { noStore, revenueCatStore, type CodeFlow, type Plan, type ProStatus, type PurchaseResult, type StoreApi } from "./store";
import {
  analysesLeft,
  bigTablesLeft,
  emptyWallet,
  grant,
  hintsLeft,
  looksLikeWallet,
  mergeWallets,
  rollover,
  spend as spendFrom,
  trialEnds,
  type Reward,
  type Spendable,
  type Wallet,
} from "./wallet";

export const WALLET_KEY = "oczko.premium.v1";
export const PRO_CACHE_KEY = "oczko.pro.v1";

/** Why the Oczko Pro screen opened (its headline follows it). */
export type PaywallReason = "hints" | "history" | "analysis" | "export" | "bigTable" | "lanSeats" | "looks" | "stats" | "profile";

export interface Premium {
  pro: boolean;
  /** Purchases work in this build (RevenueCat configured). */
  storeAvailable: boolean;
  /** Rewarded ads can be offered (never to Pro). */
  adsAvailable: boolean;
  hintsLeft: number;
  analysesLeft: number;
  bigTablesLeft: number;
  /** Use one (false: nothing left — show the limit). Pro always true. */
  spend(kind: Spendable): boolean;
  /** Show a rewarded ad and grant the reward; resolves whether it was granted. */
  watchAd(reward: Reward): Promise<boolean>;
  lookUnlocked(id: string): boolean;
  /** End of a look's 24 h trial (null: no trial running). */
  lookTrialEnds(id: string): number | null;
  showPaywall(reason: PaywallReason): void;
  plans(): Promise<Plan[]>;
  purchase(planId: string): Promise<PurchaseResult>;
  restore(): Promise<boolean>;
  manage(): Promise<void>;
  /** How promo codes are redeemed here ("none": not in this build). */
  codeFlow: CodeFlow;
  /** The "Mam kod" screen. */
  showRedeem(): void;
  /** Open the store's redeem screen (resolves whether it opened). */
  redeem(code: string | null): Promise<boolean>;
  /** Ask the store again; Pro follows the answer. Throws when offline. */
  syncPurchases(): Promise<ProStatus>;
  /** False when the consent form is not required here. */
  privacyOptions(): Promise<boolean>;
}

const UNLIMITED: Premium = {
  pro: true,
  storeAvailable: false,
  adsAvailable: false,
  hintsLeft: Infinity,
  analysesLeft: Infinity,
  bigTablesLeft: Infinity,
  spend: () => true,
  watchAd: async () => false,
  lookUnlocked: () => true,
  lookTrialEnds: () => null,
  showPaywall: () => {},
  plans: async () => [],
  purchase: async () => "error",
  restore: async () => false,
  manage: async () => {},
  codeFlow: "none",
  showRedeem: () => {},
  redeem: async () => false,
  syncPurchases: async () => ({ active: true, expires: null, renews: false }),
  privacyOptions: async () => false,
};

const PremiumContext = createContext<Premium>(UNLIMITED);

export const usePremium = (): Premium => useContext(PremiumContext);

export function PremiumProvider({
  kv,
  store: storeIn,
  ads: adsIn,
  now = Date.now,
  children,
}: {
  kv: KV;
  store?: StoreApi;
  ads?: AdsApi;
  now?: () => number;
  children: ReactNode;
}) {
  const [store] = useState<StoreApi>(() => storeIn ?? safely(revenueCatStore, noStore));
  const [ads] = useState<AdsApi>(() => adsIn ?? safely(adMobAds, noAds));
  const [pro, setPro] = useState(false);
  const [wallet, setWallet] = useState<Wallet>(() => emptyWallet(now()));
  const walletRef = useRef(wallet);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  const setProCached = useCallback(
    (p: boolean) => {
      setPro(p);
      void writeJSON(kv, PRO_CACHE_KEY, { pro: p });
    },
    [kv]
  );

  const save = useCallback(
    (w: Wallet) => {
      walletRef.current = w;
      setWallet(w);
      void writeJSON(kv, WALLET_KEY, w);
    },
    [kv]
  );

  useEffect(() => {
    let alive = true;
    void (async () => {
      const [w, cached] = await Promise.all([
        readJSON(kv, WALLET_KEY, looksLikeWallet),
        readJSON(kv, PRO_CACHE_KEY, (x): x is { pro: boolean } => typeof x === "object" && x !== null && typeof (x as { pro: unknown }).pro === "boolean"),
      ]);
      if (!alive) return;
      if (w) {
        // Anything spent or earned before the saved state was read counts too.
        const merged = mergeWallets(rollover(w, now()), rollover(walletRef.current, now()));
        walletRef.current = merged;
        setWallet(merged);
        if (merged !== w) void writeJSON(kv, WALLET_KEY, merged);
      }
      if (cached) setPro(cached.pro);
      if (!store.available) return;
      try {
        const active = await store.isPro();
        if (alive) setProCached(active);
      } catch {
        // offline: keep the remembered state
      }
    })();
    const off = store.onChange((p) => alive && setProCached(p));
    return () => {
      alive = false;
      off();
    };
  }, [kv, store, now, setProCached]);

  const current = useCallback(() => {
    const w = rollover(walletRef.current, now());
    if (w !== walletRef.current) save(w);
    return w;
  }, [now, save]);

  const value = useMemo<Premium>(() => {
    const w = rollover(wallet, now());
    return {
      pro,
      storeAvailable: store.available,
      adsAvailable: ads.available && !pro,
      hintsLeft: hintsLeft(w, pro),
      analysesLeft: analysesLeft(w, pro),
      bigTablesLeft: bigTablesLeft(w, pro),
      spend: (kind) => {
        const next = spendFrom(current(), kind, pro);
        if (!next) return false;
        if (next !== walletRef.current) save(next);
        return true;
      },
      watchAd: async (reward) => {
        if (!ads.available) return false;
        const ok = await ads.showRewarded().catch(() => false);
        if (ok) save(grant(current(), reward, now()));
        return ok;
      },
      lookUnlocked: (id) => pro || isFreeLook(id) || trialEnds(w, id, now()) !== null,
      lookTrialEnds: (id) => trialEnds(w, id, now()),
      showPaywall: (reason) => setPaywall(reason),
      plans: () => store.plans(),
      purchase: async (planId) => {
        const r = await store.purchase(planId);
        if (r === "ok") setProCached(true);
        return r;
      },
      restore: async () => {
        const p = await store.restore();
        setProCached(p);
        return p;
      },
      manage: () => store.manage(),
      codeFlow: store.available ? store.codeFlow : "none",
      showRedeem: () => setRedeeming(true),
      redeem: (code) => store.redeem(code),
      syncPurchases: async () => {
        const st = await store.sync();
        setProCached(st.active);
        return st;
      },
      privacyOptions: () => ads.privacyOptions(),
    };
  }, [pro, wallet, store, ads, now, current, save, setProCached]);

  return (
    <PremiumContext.Provider value={value}>
      {children}
      {paywall && (
        <View style={StyleSheet.absoluteFill}>
          <PaywallScreen reason={paywall} onClose={() => setPaywall(null)} />
        </View>
      )}
      {redeeming && (
        <View style={StyleSheet.absoluteFill}>
          <RedeemScreen onClose={() => setRedeeming(false)} />
        </View>
      )}
    </PremiumContext.Provider>
  );
}

function safely<T>(make: () => T, fallback: T): T {
  try {
    return make();
  } catch {
    return fallback;
  }
}
