import {
  AD_BONUS,
  analysesLeft,
  bigTablesLeft,
  emptyWallet,
  FREE_ANALYSES,
  FREE_BIG_TABLES,
  FREE_HINTS,
  grant,
  hintsLeft,
  localDay,
  looksLikeWallet,
  mergeWallets,
  rollover,
  spend,
  THEME_TRIAL_MS,
  trialEnds,
} from "../wallet";

const DAY1 = new Date(2026, 10, 17, 10, 0).getTime();
const DAY1_LATE = new Date(2026, 10, 17, 23, 59).getTime();
const DAY2 = new Date(2026, 10, 18, 0, 1).getTime();

describe("wallet", () => {
  it("gives the free daily allowances", () => {
    const w = emptyWallet(DAY1);
    expect(hintsLeft(w, false)).toBe(FREE_HINTS);
    expect(analysesLeft(w, false)).toBe(FREE_ANALYSES);
    expect(bigTablesLeft(w, false)).toBe(FREE_BIG_TABLES);
    expect(hintsLeft(w, true)).toBe(Infinity);
  });

  it.each(["hint", "analysis", "bigTable"] as const)("spends %s until none is left; Pro spends nothing", (kind) => {
    let w = emptyWallet(DAY1);
    const free = kind === "hint" ? FREE_HINTS : kind === "analysis" ? FREE_ANALYSES : FREE_BIG_TABLES;
    for (let i = 0; i < free; i++) w = spend(w, kind, false)!;
    expect(spend(w, kind, false)).toBeNull();
    expect(spend(w, kind, true)).toBe(w);
  });

  it("an ad adds one of the chosen kind for the day", () => {
    let w = emptyWallet(DAY1);
    for (let i = 0; i < FREE_HINTS; i++) w = spend(w, "hint", false)!;
    w = grant(w, { kind: "hints" }, DAY1);
    expect(hintsLeft(w, false)).toBe(AD_BONUS);
    w = grant(w, { kind: "bigTable" }, DAY1);
    expect(bigTablesLeft(w, false)).toBe(FREE_BIG_TABLES + AD_BONUS);
    w = grant(w, { kind: "analysis" }, DAY1);
    expect(analysesLeft(w, false)).toBe(FREE_ANALYSES + AD_BONUS);
  });

  it("starts over at midnight (bonuses too); a look trial lasts 24 h", () => {
    let w = emptyWallet(DAY1);
    w = spend(w, "hint", false)!;
    w = grant(w, { kind: "hints" }, DAY1);
    w = grant(w, { kind: "look", id: "felt.navy" }, DAY1);
    expect(rollover(w, DAY1_LATE)).toBe(w);
    const next = rollover(w, DAY2);
    expect(next.day).toBe(localDay(DAY2));
    expect(hintsLeft(next, false)).toBe(FREE_HINTS);
    expect(trialEnds(next, "felt.navy", DAY2)).toBe(DAY1 + THEME_TRIAL_MS);
    expect(Object.keys(rollover(w, DAY1 + THEME_TRIAL_MS + 1).trials)).toEqual([]);
  });

  it("merges two states of the same day: most used, most earned", () => {
    const a = { ...emptyWallet(DAY1), hintsUsed: 2, bonusAnalyses: 1 };
    const b = { ...emptyWallet(DAY1), hintsUsed: 1, bigTablesUsed: 1, trials: { "deck.four": 5 } };
    expect(mergeWallets(a, b)).toMatchObject({ hintsUsed: 2, bonusAnalyses: 1, bigTablesUsed: 1, trials: { "deck.four": 5 } });
    expect(mergeWallets(a, { ...emptyWallet(DAY2) }).day).toBe(localDay(DAY2));
  });

  it("validates the saved state", () => {
    expect(looksLikeWallet(emptyWallet(DAY1))).toBe(true);
    expect(looksLikeWallet({ ...emptyWallet(DAY1), hintsUsed: -1 })).toBe(false);
    expect(looksLikeWallet({ ...emptyWallet(DAY1), trials: { x: "soon" } })).toBe(false);
    expect(looksLikeWallet(null)).toBe(false);
  });
});
