// Regional rule sets and the two-aces rule variants.
import { cards } from "../testUtils";
import { PRESET_IDS, PRESETS_BY_ID, presetOf, suggestedRules, suggestPreset, withPreset } from "../presets";
import { DEFAULT_RULES, validateRules } from "../rules";
import { handValue } from "../score";

describe("rule sets", () => {
  it.each(PRESET_IDS.map((id) => [id]))("%s is a valid set of rules and is recognised", (id) => {
    const r = withPreset(DEFAULT_RULES, id);
    expect(validateRules(r)).toEqual(r);
    expect(presetOf(r, id)).toBe(id);
  });

  it("sets with the same cards (17 und 4, Ajnc): the preferred one, else the first", () => {
    const r = withPreset(DEFAULT_RULES, "ajnc");
    expect(presetOf(r)).toBe("siebzehnUndVier");
    expect(presetOf(r, "ajnc")).toBe("ajnc");
    expect(presetOf(r, "okoBere")).toBe("siebzehnUndVier");
  });

  it("Oczko is the app's default", () => {
    expect(presetOf(DEFAULT_RULES)).toBe("oczko");
    expect(withPreset(DEFAULT_RULES, "oczko")).toEqual(DEFAULT_RULES);
  });

  it("a set changes the cards and the mode, not the target", () => {
    const r = withPreset({ ...DEFAULT_RULES, target: 15 }, "okoBere");
    expect(r).toMatchObject({ deck: 32, persian: "is21", mode: "bank", target: 15 });
    expect([r.values[11], r.values[12], r.values[13]]).toEqual([1, 1, 2]);
    expect(presetOf({ ...r, values: { ...r.values, 13: 3 } })).toBeNull();
    // A set's values are its own copy.
    r.values[11] = 9;
    expect(PRESETS_BY_ID.okoBere.values[11]).toBe(1);
  });

  it("is suggested by the phone's country, then its language", () => {
    expect(suggestPreset("AT", "pl")).toBe("siebzehnUndVier");
    expect(suggestPreset("cz", null)).toBe("okoBere");
    expect(suggestPreset("RS", "sr")).toBe("ajnc");
    expect(suggestPreset(null, "sk")).toBe("okoBere");
    expect(suggestPreset("US", "de")).toBe("siebzehnUndVier");
    expect(suggestPreset("PL", "pl")).toBe("oczko");
    expect(suggestPreset(undefined, undefined)).toBe("oczko");
    expect(suggestedRules("CZ", "cs")).toEqual(withPreset(DEFAULT_RULES, "okoBere"));
  });
});

describe("two aces", () => {
  const aa = cards("A♥ A♠");
  it.each([
    ["wins", { total: 22, bust: false, persian: true }],
    ["is21", { total: 21, bust: false, persian: false }],
    ["off", { total: 22, bust: true, persian: false }],
  ] as const)("%s", (persian, value) => {
    expect(handValue(aa, { ...DEFAULT_RULES, persian })).toMatchObject(value);
  });

  it("only two aces in two cards count", () => {
    const r = { ...DEFAULT_RULES, persian: "is21" as const, ace: "oneOrEleven" as const };
    expect(handValue(aa, r).total).toBe(21);
    expect(handValue(cards("A♥ A♠ 2♣"), r)).toMatchObject({ total: 14, bust: false });
  });

  it("old rules (a boolean) are read as before", () => {
    expect(validateRules({ ...DEFAULT_RULES, persian: true })?.persian).toBe("wins");
    expect(validateRules({ ...DEFAULT_RULES, persian: false })?.persian).toBe("off");
    expect(validateRules({ ...DEFAULT_RULES, persian: "maybe" })).toBeNull();
  });
});
