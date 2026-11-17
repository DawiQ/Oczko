import { makeRng, type Rng } from "../../engine/rng";
import { DEFAULT_RULES, PRESETS } from "../../engine/rules";
import type { SeatView } from "../../engine/view";
import { PERSONAS } from "../personas";
import { policyOf, threshold, type Policy } from "../policies";
import { playMatch, playRound } from "../simulate";

describe("bots at the table", () => {
  it("decide from their own view only", () => {
    const seen: SeatView[] = [];
    const spy: Policy = (v: SeatView, r: Rng) => {
      seen.push(v);
      return threshold(17)(v, r);
    };
    playMatch({ ...DEFAULT_RULES, target: 3 }, [spy, spy, spy], 5, 0, makeRng(1));
    expect(seen.length).toBeGreaterThan(5);
    for (const v of seen) {
      expect(v.turn).toBe(v.me);
      expect(JSON.stringify(v)).not.toMatch(/"(stock|seed|seedBase|hands)"/);
    }
  });

  it("every persona finishes matches in both modes", () => {
    const policies = PERSONAS.map((p) => policyOf(p.id === "hrabia" ? { kind: "evaluator", samples: 60, standAt: 17 } : p.policy));
    for (const rules of [DEFAULT_RULES, PRESETS.bank]) {
      const r = playMatch({ ...rules, target: 3 }, policies, 7, 2, makeRng(3));
      expect(r.match.winner).not.toBeNull();
      expect(r.match.scores[r.match.winner!]).toBeGreaterThanOrEqual(3);
    }
  });

  it("a single round reports its points as the scores", () => {
    const r = playRound(DEFAULT_RULES, [threshold(17), threshold(15)], 11, 0, makeRng(1));
    expect(r.match.scores).toEqual(r.match.round.result!.points);
    expect(r.decisions).toBeGreaterThanOrEqual(2);
  });
});
