import { DEFAULT_RULES, PRESETS } from "../../engine/rules";
import { HOUSE_RULES_KEY, loadHouseRules, saveHouseRules } from "../houseRules";
import { memoryKV } from "../kv";
import { DEFAULT_CHOICES, loadChoices, looksLikeChoices, NEW_GAME_KEY, saveChoices } from "../newGame";
import { loadOnboardingDone, ONBOARDING_KEY, saveOnboardingDone } from "../onboarding";
import { DEFAULT_SETTINGS, loadSettings, looksLikeSettings, saveSettings, SETTINGS_KEY } from "../settings";

describe("preferences in storage", () => {
  it("settings", async () => {
    const kv = memoryKV();
    expect(await loadSettings(kv)).toEqual(DEFAULT_SETTINGS);
    await saveSettings(kv, { ...DEFAULT_SETTINGS, pace: "fast", sound: false });
    expect((await loadSettings(kv)).pace).toBe("fast");
    expect(looksLikeSettings({ ...DEFAULT_SETTINGS, pace: "turbo" })).toBe(false);
    expect(await loadSettings(memoryKV({ [SETTINGS_KEY]: "{" }))).toEqual(DEFAULT_SETTINGS);
  });

  it("house rules", async () => {
    const kv = memoryKV();
    expect(await loadHouseRules(kv)).toEqual(DEFAULT_RULES);
    await saveHouseRules(kv, PRESETS.bank);
    expect(await loadHouseRules(kv)).toEqual(PRESETS.bank);
    expect(await loadHouseRules(memoryKV({ [HOUSE_RULES_KEY]: JSON.stringify({ ...DEFAULT_RULES, deck: 36 }) }))).toEqual(DEFAULT_RULES);
  });

  it("onboarding", async () => {
    const kv = memoryKV();
    expect(await loadOnboardingDone(kv)).toBe(false);
    await saveOnboardingDone(kv);
    expect(await loadOnboardingDone(kv)).toBe(true);
    expect(await loadOnboardingDone(memoryKV({ [ONBOARDING_KEY]: "[]" }))).toBe(false);
  });

  it("new game choices", async () => {
    const kv = memoryKV();
    expect(await loadChoices(kv)).toEqual(DEFAULT_CHOICES);
    const c = { ...DEFAULT_CHOICES, bots: ["hrabia" as const], length: "single" as const };
    await saveChoices(kv, c);
    expect(await loadChoices(kv)).toEqual(c);
    expect(looksLikeChoices({ ...DEFAULT_CHOICES, bots: [] })).toBe(false);
    expect(looksLikeChoices({ ...DEFAULT_CHOICES, bots: ["nikt"] })).toBe(false);
    expect(looksLikeChoices({ ...DEFAULT_CHOICES, length: 7 })).toBe(false);
    expect(await loadChoices(memoryKV({ [NEW_GAME_KEY]: "null" }))).toEqual(DEFAULT_CHOICES);
  });
});
