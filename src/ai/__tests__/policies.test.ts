import { matchApply, newMatch, type MatchState } from "../../engine/match";
import { makeRng } from "../../engine/rng";
import { dealRound } from "../../engine/round";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { stockFor } from "../../engine/testUtils";
import { viewFor, type SeatView } from "../../engine/view";
import { contextual, evaluatorPolicy, noisy, policyOf, threshold } from "../policies";

function table(rules: Rules, hands: string[], draws = "", dealer = 0, bank: number | null = null): MatchState {
  const m = newMatch(rules, hands.length, 1, dealer);
  return { ...m, round: dealRound(rules, hands.length, stockFor(rules, hands, draws, dealer, bank), dealer, bank) };
}
function play(m: MatchState, ...moves: ("hit" | "stand")[]): MatchState {
  for (const a of moves) {
    const r = matchApply(m, m.round.turn!, a);
    if ("error" in r) throw new Error(r.error);
    m = r.state;
  }
  return m;
}
/** My view with `total` points in two cards (seat 1 moves first: dealer 0). */
function viewWith(hand: string, draw: string): SeatView {
  const m = play(table(DEFAULT_RULES, ["2♣", hand], draw), "hit");
  return viewFor(m, 1);
}
const rng = makeRng(1);

describe("threshold", () => {
  it("draws below the threshold", () => {
    expect(threshold(17)(viewWith("10♥", "6♠"), rng).action).toBe("hit"); // 16
    expect(threshold(17)(viewWith("10♥", "7♠"), rng).action).toBe("stand"); // 17
  });

  it("never draws on 21 or from an empty stock", () => {
    expect(threshold(30)(viewWith("10♥", "A♠"), rng).action).toBe("stand");
    const v = viewWith("2♥", "3♠");
    expect(threshold(30)({ ...v, legal: ["stand"] }, rng).action).toBe("stand");
  });
});

describe("noisy", () => {
  it("flips about eps of its decisions, deterministically", () => {
    const p = noisy(17, 0.25);
    const v = viewWith("10♥", "2♠"); // 12 → threshold says hit
    let r = makeRng(5);
    let flips = 0;
    const seq: string[] = [];
    for (let i = 0; i < 4000; i++) {
      const d = p(v, r);
      r = d.rng;
      seq.push(d.action);
      if (d.action === "stand") flips++;
    }
    expect(flips / 4000).toBeGreaterThan(0.22);
    expect(flips / 4000).toBeLessThan(0.28);
    let r2 = makeRng(5);
    const again = seq.map(() => {
      const d = p(v, r2);
      r2 = d.rng;
      return d.action;
    });
    expect(again).toEqual(seq);
  });
});

describe("contextual", () => {
  it("stops at once when every rival is out on a known fura", () => {
    // seat 0 (dealer 1 → order 0, 1) busts openly; I hold 5.
    const m = play(table(DEFAULT_RULES, ["10♣", "5♥"], "K♣ 9♦", 1), "hit", "hit");
    const v = viewFor(m, 1);
    expect(v.others[0].status).toBe("bust");
    expect(contextual(17)(v, rng).action).toBe("stand");
    expect(threshold(17)(v, rng).action).toBe("hit");
  });

  it("aims higher against more live rivals", () => {
    const m = newMatch(DEFAULT_RULES, 6, 3, 5);
    const v = viewFor(m, 0);
    const at17: SeatView = { ...v, myValue: { total: 17, soft: false, bust: false, persian: false, special: null } };
    expect(contextual(17)(at17, rng).action).toBe("hit"); // 5 live rivals → aims at 20
    expect(threshold(17)(at17, rng).action).toBe("stand");
  });
});

describe("evaluator policy", () => {
  it("draws when no card can bust", () => {
    expect(evaluatorPolicy(200, { standAt: 17 })(viewWith("2♥", "3♠"), rng).action).toBe("hit");
  });

  it("stands on 20 and draws on 11 in a plain family spot", () => {
    const p = evaluatorPolicy(800, { standAt: 17 });
    expect(p(viewWith("10♥", "D♠"), rng).action).toBe("hit"); // 13: below what a rival keeps
    expect(p(viewWith("10♥", "10♠"), rng).action).toBe("stand");
  });

  it("is deterministic and advances the generator", () => {
    const p = policyOf({ kind: "evaluator", samples: 300, standAt: 17 });
    const v = viewWith("10♥", "6♠");
    const a = p(v, makeRng(9));
    expect(p(v, makeRng(9))).toEqual(a);
    expect(a.rng).not.toEqual(makeRng(9));
  });
});

describe("policyOf", () => {
  it("builds every kind", () => {
    const v = viewWith("10♥", "6♠");
    for (const spec of [
      { kind: "threshold", t: 17 },
      { kind: "noisy", t: 17, eps: 0.1 },
      { kind: "contextual", t: 17 },
      { kind: "evaluator", samples: 50, standAt: 17 },
    ] as const)
      expect(["hit", "stand"]).toContain(policyOf(spec)(v, rng).action);
  });

  it("works for the bank too", () => {
    const m = play(table(PRESETS.bank, ["9♥", "10♣"], "7♠", 0, 0), "hit", "stand");
    expect(m.round.turn).toBe(0);
    expect(["hit", "stand"]).toContain(policyOf({ kind: "contextual", t: 17 })(viewFor(m, 0), rng).action);
  });
});

describe("contextual as the bank", () => {
  it("stops early when most players are out", () => {
    // bank 0; seats 1 and 2 bust openly, seat 3 stops face down; the bank holds 9 + 6 = 15
    const m = play(
      table(PRESETS.bank, ["9♥", "10♣", "10♦", "8♠"], "K♣ 9♦ K♦ 9♠ 7♣ 6♥", 0, 0),
      "hit", "hit", "hit", "hit", "hit", "stand", "hit"
    );
    const v = viewFor(m, 0);
    expect(v.turn).toBe(0);
    expect(v.myValue.total).toBe(15);
    expect(contextual(17)(v, rng).action).toBe("stand");
    expect(threshold(17)(v, rng).action).toBe("hit");
  });
});

describe("decideAsync", () => {
  it("gives the same decision as the policy, the evaluator in chunks", async () => {
    const { decideAsync } = jest.requireActual("../policies") as typeof import("../policies");
    const { chunkedEvaluator } = jest.requireActual("../evaluate") as typeof import("../evaluate");
    const specs = [
      { kind: "threshold", t: 17 },
      { kind: "noisy", t: 17, eps: 0.3 },
      { kind: "contextual", t: 17 },
      { kind: "evaluator", samples: 400, standAt: 17 },
    ] as const;
    for (const hand of [["10♥", "6♠"], ["10♥", "2♠"], ["9♥", "9♠"]] as const) {
      const v = viewWith(hand[0], hand[1]);
      for (const spec of specs) {
        const sync = policyOf(spec)(v, makeRng(3));
        const async_ = await decideAsync(spec, v, makeRng(3), chunkedEvaluator(64, () => Promise.resolve()));
        expect(async_).toEqual(sync);
      }
    }
  });
});
