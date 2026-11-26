// "Jak grasz u siebie?": the house rules chosen in the onboarding or the
// settings (oczko.rules.v1); the default for every new game.
import { DEFAULT_RULES, validateRules, type Rules } from "../engine/rules";
import { readJSON, writeJSON, type KV } from "./kv";

export const HOUSE_RULES_KEY = "oczko.rules.v1";

const looksLikeRules = (x: unknown): x is Rules => validateRules(x) !== null;

/** The saved house rules, or null when none were chosen yet. */
export const loadHouseRulesOrNull = async (kv: KV): Promise<Rules | null> => validateRules(await readJSON(kv, HOUSE_RULES_KEY, looksLikeRules));
export const loadHouseRules = async (kv: KV): Promise<Rules> => (await loadHouseRulesOrNull(kv)) ?? DEFAULT_RULES;
export const saveHouseRules = (kv: KV, r: Rules) => writeJSON(kv, HOUSE_RULES_KEY, r);
