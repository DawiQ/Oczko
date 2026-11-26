// Rewarded ads (AdMob, react-native-google-mobile-ads): only when the player
// asks for one, never during a round. The EU consent form (Google UMP) comes
// first; without consent to personalised ads the ads are non-personalised.
import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

import { monetizationConfig } from "./config";

export interface AdsApi {
  readonly available: boolean;
  /** Show one rewarded ad; resolves true once the reward is earned. */
  showRewarded(): Promise<boolean>;
  /** The privacy options form (to change the consent later); false when it
   *  is not required here (outside the EEA / UK / Switzerland). */
  privacyOptions(): Promise<boolean>;
}

export const noAds: AdsApi = {
  available: false,
  showRewarded: async () => false,
  privacyOptions: async () => false,
};

const LOAD_TIMEOUT_MS = 15_000;

export function adMobAds(): AdsApi {
  const configured = monetizationConfig().rewardedUnit;
  const unit = __DEV__ ? TestIds.REWARDED : configured;
  if (!unit) return noAds;
  let ready: Promise<{ personalised: boolean; allowed: boolean }> | null = null;
  const init = () =>
    (ready ??= (async () => {
      try {
        const info = await AdsConsent.gatherConsent();
        if (!info.canRequestAds) return { personalised: false, allowed: false };
        await mobileAds().initialize();
        const choices = await AdsConsent.getUserChoices().catch(() => null);
        return { personalised: !!choices?.selectPersonalisedAds, allowed: true };
      } catch {
        ready = null; // try again next time
        return { personalised: false, allowed: false };
      }
    })());
  return {
    available: true,
    showRewarded: async () => {
      const { personalised, allowed } = await init();
      if (!allowed) return false;
      const ad = RewardedAd.createForAdRequest(unit, { requestNonPersonalizedAdsOnly: !personalised });
      return new Promise<boolean>((resolve) => {
        let earned = false;
        let done = false;
        const subs: (() => void)[] = [];
        const finish = (ok: boolean) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          subs.forEach((u) => u());
          resolve(ok);
        };
        const timer = setTimeout(() => finish(false), LOAD_TIMEOUT_MS);
        subs.push(
          ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
            clearTimeout(timer);
            ad.show().catch(() => finish(false));
          }),
          ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            earned = true;
          }),
          ad.addAdEventListener(AdEventType.CLOSED, () => finish(earned)),
          ad.addAdEventListener(AdEventType.ERROR, () => finish(false))
        );
        ad.load();
      });
    },
    privacyOptions: async () => {
      try {
        await init();
        const info = await AdsConsent.getConsentInfo();
        if (info.privacyOptionsRequirementStatus !== AdsConsentPrivacyOptionsRequirementStatus.REQUIRED) return false;
        await AdsConsent.showPrivacyOptionsForm();
        return true;
      } catch {
        return false;
      }
    },
  };
}
