import { DEFAULT_RULES, MAX_SEATS, PRESETS, validateRules, type Rules } from "../rules";

const json = (r: unknown) => JSON.parse(JSON.stringify(r));

describe("rules", () => {
  it("defaults match the decisions (PLAN.md §0)", () => {
    expect(DEFAULT_RULES).toMatchObject({
      deck: 52,
      ace: "eleven",
      persian: "wins",
      startCards: 1,
      mode: "family",
      familyTie: "allScore",
      bankTie: "bankWins",
      bankScoring: "majority",
      bankRotation: "everyRound",
      playerBustLoses: true,
      bustRevealed: true,
      target: 10,
    });
    expect(DEFAULT_RULES.values).toMatchObject({ 2: 2, 10: 10, 11: 2, 12: 3, 13: 4 });
    expect(PRESETS.bank.mode).toBe("bank");
    expect(PRESETS.small24.deck).toBe(24);
    expect(MAX_SEATS).toEqual({ 24: 5, 32: 7, 36: 8, 52: 8 });
  });

  it("reads rules saved before \"bank draws to 17\" (no field) with the rule off", () => {
    const old: Record<string, unknown> = json(DEFAULT_RULES);
    delete old.bankTo17;
    expect(validateRules(old)).toEqual(DEFAULT_RULES);
  });

  it("accepts every preset after a JSON round trip", () => {
    for (const r of Object.values(PRESETS)) expect(validateRules(json(r))).toEqual(r);
  });

  it("returns a fresh copy", () => {
    const input = json(DEFAULT_RULES);
    const out = validateRules(input)!;
    input.values[11] = 9;
    expect(out.values[11]).toBe(2);
  });

  const bad: [string, (r: Record<string, unknown>) => void][] = [
    ["a missing field", (r) => delete r.target],
    ["an unknown field", (r) => (r.stake = 1)],
    ["deck 40", (r) => (r.deck = 40)],
    ["bankTo17 'yes'", (r) => (r.bankTo17 = "yes")],
    ["value 0", (r) => ((r.values as Record<string, number>)[12] = 0)],
    ["value 12", (r) => ((r.values as Record<string, number>)[2] = 12)],
    ["value 2.5", (r) => ((r.values as Record<string, number>)[2] = 2.5)],
    ["a missing value", (r) => delete (r.values as Record<string, number>)[13]],
    ["an extra value", (r) => ((r.values as Record<string, number>)[14] = 11)],
    ["values as an array", (r) => (r.values = [2, 3])],
    ["ace 'one'", (r) => (r.ace = "one")],
    ["persian 'yes'", (r) => (r.persian = "yes")],
    ["startCards 3", (r) => (r.startCards = 3)],
    ["maxCards equal to startCards", (r) => ((r.startCards = 2), (r.maxCards = 2))],
    ["maxCards 13", (r) => (r.maxCards = 13)],
    ["mode 'duel'", (r) => (r.mode = "duel")],
    ["familyTie", (r) => (r.familyTie = "x")],
    ["bankTie", (r) => (r.bankTie = "x")],
    ["bankScoring", (r) => (r.bankScoring = "x")],
    ["bankRotation", (r) => (r.bankRotation = "x")],
    ["playerBustLoses", (r) => (r.playerBustLoses = 1)],
    ["bustRevealed", (r) => (r.bustRevealed = null)],
    ["target 0", (r) => (r.target = 0)],
    ["target 51", (r) => (r.target = 51)],
  ];
  it.each(bad)("rejects %s", (_name, spoil) => {
    const r = json(DEFAULT_RULES);
    spoil(r);
    expect(validateRules(r)).toBeNull();
  });

  it.each([null, undefined, 3, "rules", [], {}])("rejects %p", (x) => {
    expect(validateRules(x)).toBeNull();
  });

  it("accepts a card limit and two start cards", () => {
    const r: Rules = { ...DEFAULT_RULES, startCards: 2, maxCards: 5 };
    expect(validateRules(json(r))).toEqual(r);
  });
});
