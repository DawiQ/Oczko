// Bot policies: from a seat's view (never the hidden cards) to "Dobieram" or
// "Starczy". Pure: randomness comes in and goes out as `Rng`.
import { rngNext, type Rng } from "../engine/rng";
import type { Action } from "../engine/round";
import type { SeatView } from "../engine/view";
import { evaluate, finishEvaluation, startEvaluation, type OpponentModel } from "./evaluate";

export type Policy = (view: SeatView, rng: Rng) => { action: Action; rng: Rng };

/** A serialisable description of a policy (personas, saved games, Wi‑Fi). */
export type PolicySpec =
  | { kind: "threshold"; t: number }
  | { kind: "noisy"; t: number; eps: number }
  | { kind: "contextual"; t: number }
  | { kind: "evaluator"; samples: number; standAt: number; continueAt?: number };

const canHit = (v: SeatView) => v.legal.includes("hit");
/** Never draw on 21 or with a card that cannot be taken. */
const forced = (v: SeatView): Action | null => (!canHit(v) || v.myValue.total >= 21 ? "stand" : null);

/** "Dobieram" below `t`. */
export function threshold(t: number): Policy {
  return (v, rng) => ({ action: forced(v) ?? (v.myValue.total < t ? "hit" : "stand"), rng });
}

/** Like `threshold`, but with probability `eps` the other choice. */
export function noisy(t: number, eps: number): Policy {
  return (v, rng) => {
    const f = forced(v);
    if (f) return { action: f, rng };
    const [x, next] = rngNext(rng);
    const base: Action = v.myValue.total < t ? "hit" : "stand";
    return { action: x < eps ? (base === "hit" ? "stand" : "hit") : base, rng: next };
  };
}

/**
 * A threshold that looks at the table: with every rival already out on a
 * known fura it stops at once; in the family game it aims higher against more
 * live rivals; as the bank it stops early when most players are out.
 */
export function contextual(t: number): Policy {
  return (v, rng) => {
    const f = forced(v);
    if (f) return { action: f, rng };
    const rivals = v.others.filter((o) => v.bank === null || v.me === v.bank || o.seat === v.bank);
    const live = rivals.filter((o) => o.status !== "bust");
    if (live.length === 0) return { action: "stand", rng };
    let target = t;
    if (v.rules.mode === "family") target = t + Math.max(0, live.length - 2);
    else if (v.me === v.bank) {
      const players = v.others.length;
      if (live.length * 2 < players) target = Math.min(t, 15);
    }
    return { action: v.myValue.total < target ? "hit" : "stand", rng };
  };
}

/** The evaluator's best move (`samples` Monte Carlo games per decision). */
export function evaluatorPolicy(samples: number, model: OpponentModel, continueAt?: number): Policy {
  return (v, rng) => {
    const f = forced(v);
    if (f) return { action: f, rng };
    const [, next] = rngNext(rng);
    const opts = { samples, rng: next, opponentModel: model, continueAt };
    // No card can bust: drawing never hurts.
    if (finishEvaluation(startEvaluation(v, opts)).bustIfHit === 0) return { action: "hit", rng: next };
    return { action: evaluate(v, opts).best, rng: { state: (next.state + 0x9e3779b9) >>> 0 } };
  };
}

export function policyOf(spec: PolicySpec): Policy {
  switch (spec.kind) {
    case "threshold":
      return threshold(spec.t);
    case "noisy":
      return noisy(spec.t, spec.eps);
    case "contextual":
      return contextual(spec.t);
    case "evaluator":
      return evaluatorPolicy(spec.samples, { standAt: spec.standAt }, spec.continueAt);
  }
}
