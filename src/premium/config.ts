// Monetization settings from app.json ("expo.extra.monetization"): the public
// RevenueCat SDK keys and the AdMob rewarded ad unit ids. Empty values switch
// the feature off (purchases unavailable / no ad offers), so a build without
// them still works. These are public client keys — no secret belongs here.
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface MonetizationConfig {
  /** RevenueCat public SDK key for this platform ("" = no purchases). */
  revenueCatKey: string;
  /** RevenueCat entitlement that unlocks Oczko Pro. */
  entitlement: string;
  /** AdMob rewarded ad unit id for this platform ("" = no ads; a dev build
   *  uses Google's test unit). */
  rewardedUnit: string;
}

type Extra = {
  monetization?: {
    revenueCatAndroidKey?: string;
    revenueCatIosKey?: string;
    entitlement?: string;
    rewardedAndroid?: string;
    rewardedIos?: string;
    termsUrl?: string;
    privacyUrl?: string;
  };
};

export function monetizationConfig(): MonetizationConfig {
  const m = ((Constants.expoConfig?.extra ?? {}) as Extra).monetization ?? {};
  const ios = Platform.OS === "ios";
  return {
    revenueCatKey: (ios ? m.revenueCatIosKey : m.revenueCatAndroidKey) ?? "",
    entitlement: m.entitlement || "pro",
    rewardedUnit: (ios ? m.rewardedIos : m.rewardedAndroid) ?? "",
  };
}

/** Terms of use and privacy policy pages (shown under the purchase button;
 *  Apple asks for both with a subscription). */
export function monetizationLinks(): { terms: string | null; privacy: string | null } {
  const m = ((Constants.expoConfig?.extra ?? {}) as Extra).monetization ?? {};
  return { terms: m.termsUrl || null, privacy: m.privacyUrl || null };
}
