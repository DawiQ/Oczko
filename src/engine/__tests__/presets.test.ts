// Regional rule sets and the two-aces rule variants.
import { makeDeck, rankOf } from "../cards";
import { apply, bankForced, legal, newRound, scoreRound } from "../round";
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

  it("a set without winning aces drops \"the bank passes on two aces\"", () => {
    const base = { ...DEFAULT_RULES, mode: "bank" as const, bankRotation: "onPersian" as const };
    expect(withPreset(base, "okoBere").bankRotation).toBe("everyRound");
    expect(withPreset(base, "siebzehnUndVier").bankRotation).toBe("onPersian");
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
    // A known country outside the sets: Oczko, whatever the language.
    expect(suggestPreset("US", "de")).toBe("oczko");
    expect(suggestPreset("PL", "cs")).toBe("oczko");
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

describe("Очко: 36 cards and the bank drawing to 17", () => {
  it("the 36-card deck is 6–A in every suit", () => {
    const d = makeDeck(36);
    expect(d).toHaveLength(36);
    expect(Math.min(...d.map(rankOf))).toBe(6);
    expect(new Set(d).size).toBe(36);
  });

  it("is suggested in Ukraine and Kazakhstan, and for Ukrainian or Russian phones", () => {
    expect(suggestPreset("UA", "uk")).toBe("ochko");
    expect(suggestPreset("KZ", "ru")).toBe("ochko");
    expect(suggestPreset(null, "ru")).toBe("ochko");
    expect(withPreset(DEFAULT_RULES, "ochko")).toMatchObject({ deck: 36, persian: "wins", mode: "bank", bankTo17: true });
  });

  it("the bank must draw below 17 and stand from 17; players choose freely", () => {
    const rules = withPreset(DEFAULT_RULES, "ochko");
    for (let seed = 1; seed < 40; seed++) {
      let s = newRound(rules, 3, seed, 0, 0);
      while (s.turn !== null) {
        const moves = legal(s);
        if (s.turn === s.bank) {
          const total = handValue(s.hands[s.turn], rules).total;
          expect(moves).toEqual([total < 17 ? "hit" : "stand"]);
          expect(bankForced(s)).toBe(moves[0]);
        } else expect(moves).toEqual(["hit", "stand"]);
        // Players stand at once; the bank does what it must.
        const r = apply(s, s.turn, s.turn === s.bank ? moves[0] : "stand");
        if ("error" in r) throw new Error(r.error);
        s = r.state;
      }
      const bankHand = handValue(s.hands[0], rules);
      expect(bankHand.bust || bankHand.persian || bankHand.total >= 17 || s.result !== null).toBe(true);
    }
  });

  it("without the rule (or in the family game) nobody is forced", () => {
    const rules = { ...withPreset(DEFAULT_RULES, "ochko"), bankTo17: false };
    expect(legal(newRound(rules, 3, 5, 0, 0)).length).toBeLessThanOrEqual(2);
    expect(bankForced(newRound({ ...rules, bankTo17: true, mode: "family" }, 3, 5, 0, null))).toBeNull();
  });
});

describe("Pontoon", () => {
  const rules = withPreset(DEFAULT_RULES, "pontoon");
  const v = (hand: string) => handValue(cards(hand), rules);

  it("the set: face cards 10, ace 1 or 11, five cards at most, with a bank; suggested in the UK", () => {
    expect(rules).toMatchObject({ deck: 52, ace: "oneOrEleven", persian: "off", mode: "bank", pontoon: true, fiveCardTrick: true, maxCards: 5 });
    expect([rules.values[11], rules.values[12], rules.values[13]]).toEqual([10, 10, 10]);
    expect(suggestPreset("GB", "en")).toBe("pontoon");
    expect(suggestPreset("AU", "en")).toBe("pontoon");
    expect(suggestPreset("US", "en")).toBe("oczko");
  });

  it("names the special hands", () => {
    expect(v("A♥ K♠")).toMatchObject({ total: 21, special: "pontoon" });
    expect(v("A♥ 10♠")).toMatchObject({ total: 21, special: "pontoon" });
    expect(v("10♥ 6♠ 5♣")).toMatchObject({ total: 21, special: null });
    expect(v("2♥ 3♠ 4♣ 2♦ 5♥")).toMatchObject({ total: 16, special: "fiveCard" });
    expect(v("A♥ A♠")).toMatchObject({ total: 12, special: null, persian: false });
    expect(v("10♥ 9♠ 2♣ 3♦ 4♥")).toMatchObject({ bust: true, special: null });
    // Two aces as 21 ("fojer") are no pontoon.
    expect(handValue(cards("A♥ A♠"), { ...rules, persian: "is21" })).toMatchObject({ total: 21, special: null });
    // Without the rules: plain totals.
    expect(handValue(cards("A♥ K♠"), { ...rules, pontoon: false }).special).toBeNull();
  });

  it("ranks pontoon > five cards > 21 > lower; the bank wins ties", () => {
    const score = (player: string, bank: string) => scoreRound(rules, [cards(bank), cards(player)], 0).duels![0].winner;
    expect(score("A♥ K♠", "10♣ 6♦ 5♥")).toBe("player");
    expect(score("10♣ 6♦ 5♥", "A♥ K♠")).toBe("bank");
    expect(score("2♥ 3♠ 4♣ 2♦ 5♥", "10♣ 6♦ 5♥")).toBe("player");
    expect(score("A♥ K♠", "2♥ 3♠ 4♣ 2♦ 5♥")).toBe("player");
    expect(score("A♥ K♠", "A♣ D♦")).toBe("bank");
    expect(score("10♣ 9♦", "10♥ 9♠")).toBe("bank");
  });

  it("the family game: the strongest hand scores", () => {
    const fam = { ...rules, mode: "family" as const };
    const r = scoreRound(fam, [cards("10♣ 6♦ 5♥"), cards("2♥ 3♠ 4♣ 2♦ 5♥"), cards("9♥ 8♠")], null);
    expect(r.points).toEqual([0, 1, 0]);
  });

  it("rules saved before Pontoon read with it off", () => {
    const old: Record<string, unknown> = JSON.parse(JSON.stringify(DEFAULT_RULES));
    delete old.pontoon;
    delete old.fiveCardTrick;
    expect(validateRules(old)).toEqual(DEFAULT_RULES);
  });
});
