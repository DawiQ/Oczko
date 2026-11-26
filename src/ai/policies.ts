// Bot policies: from a seat's view (never the hidden cards) to "Dobieram" or
// "Starczy". Pure: randomness comes in and goes out as `Rng`.
import { rngNext, type Rng } from "../engine/rng";
import type { Action } from "../engine/round";
import type { SeatView } from "../engine/view";
import { evaluate, finishEvaluation, startEvaluation, type ChunkedEvaluator, type OpponentModel } from "./evaluate";

export type Policy = (view: SeatView, rng: Rng) => { action: Action; rng: Rng };

/** A serialisable description of a policy (personas, saved games, Wi‑Fi). */
export type PolicySpec =
  | { kind: "threshold"; t: number }
  | { kind: "noisy"; t: number; eps: number }
  | { kind: "contextual"; t: number }
  | { kind: "evaluator"; samples: number; standAt: number; continueAt?: number };

const canHit = (v: SeatView) => v.legal.includes("hit");
/** The move when there is no choice: never draw on 21 or when no card can be
 *  taken; the only legal move (the bank under "draws to 17"). */
const forced = (v: SeatView): Action | null => {
  if (v.legal.length === 1) return v.legal[0];
  return !canHit(v) || v.myValue.total >= 21 ? "stand" : null;
};

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
    const p = evaluatorPlan(v, rng, samples, model, continueAt);
    if (p.decided) return p.decided;
    return { action: evaluate(v, p.opts).best, rng: p.after };
  };
}

/** The shared steps of the evaluator policy (sync here, chunked in `decideAsync`). */
export function evaluatorPlan(v: SeatView, rng: Rng, samples: number, model: OpponentModel, continueAt?: number) {
  const [, next] = rngNext(rng);
  const opts = { samples, rng: next, opponentModel: model, continueAt };
  const after: Rng = { state: (next.state + 0x9e3779b9) >>> 0 };
  // No card can bust: drawing never hurts.
  const decided = finishEvaluation(startEvaluation(v, opts)).bustIfHit === 0 ? { action: "hit" as Action, rng: next } : null;
  return { opts, after, decided };
}

/**
 * A bot's decision without blocking the UI: the evaluator runs in chunks
 * (`evaluator`), every other policy at once. Same result as `policyOf(spec)`;
 * null when the evaluation was cancelled.
 */
export async function decideAsync(
  spec: PolicySpec,
  v: SeatView,
  rng: Rng,
  evaluator: ChunkedEvaluator
): Promise<{ action: Action; rng: Rng } | null> {
  if (spec.kind !== "evaluator") return policyOf(spec)(v, rng);
  const f = forced(v);
  if (f) return { action: f, rng };
  const p = evaluatorPlan(v, rng, spec.samples, { standAt: spec.standAt }, spec.continueAt);
  if (p.decided) return p.decided;
  const e = await evaluator.evaluate(v, p.opts);
  return e ? { action: e.best, rng: p.after } : null;
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
