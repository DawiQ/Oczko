// The first-run onboarding is done (oczko.onboarding.v1).
import { readJSON, writeJSON, type KV } from "./kv";

export const ONBOARDING_KEY = "oczko.onboarding.v1";

interface Onboarding {
  v: 1;
  done: boolean;
}
const looksLikeOnboarding = (x: unknown): x is Onboarding =>
  typeof x === "object" && x !== null && (x as Onboarding).v === 1 && typeof (x as Onboarding).done === "boolean";

export const loadOnboardingDone = async (kv: KV): Promise<boolean> => (await readJSON(kv, ONBOARDING_KEY, looksLikeOnboarding))?.done ?? false;
export const saveOnboardingDone = (kv: KV) => writeJSON(kv, ONBOARDING_KEY, { v: 1, done: true });
