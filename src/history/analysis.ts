// Grading my decisions with the evaluator: best / good / risky / mistake by
// how much of the chance to score was given away. Pure (the evaluator is
// passed in, so it can run in chunks). Grade names: the dictionary.
import type { Evaluation } from "../ai/evaluate";
import type { Action } from "../engine/round";
import type { SeatView } from "../engine/view";
import { viewFor } from "../engine/view";
import type { Frame, HistoryRecord } from "./record";

export type Grade = "best" | "good" | "risky" | "mistake";

/** Loss of the chance to score (0..1) that still counts as "good" / "risky". */
export const GOOD_LOSS = 0.03;
export const RISKY_LOSS = 0.1;

export function grade(e: Pick<Evaluation, "winIfStand" | "winIfHit">, action: Action): { grade: Grade; loss: number } {
  const chosen = action === "hit" ? e.winIfHit : e.winIfStand;
  const best = Math.max(e.winIfHit, e.winIfStand);
  const loss = Math.max(0, best - chosen);
  const EPS = 1e-9; // chances are floats: 0.5 − 0.47 is not exactly 0.03
  if (loss <= EPS) return { grade: "best", loss };
  if (loss <= GOOD_LOSS + EPS) return { grade: "good", loss };
  if (loss <= RISKY_LOSS + EPS) return { grade: "risky", loss };
  return { grade: "mistake", loss };
}

/** My decisions in a replay: the view I had and what I did. */
export function myDecisions(r: HistoryRecord, frames: Frame[]): { index: number; view: SeatView; action: Action }[] {
  const out: { index: number; view: SeatView; action: Action }[] = [];
  for (let k = 1; k < frames.length; k++) {
    const f = frames[k];
    if (!f.decision || f.decision.seat !== r.me || f.index === null) continue;
    // The state just before the decision is the previous frame.
    out.push({ index: f.index, view: viewFor(frames[k - 1].match, r.me), action: f.decision.action });
  }
  return out;
}

export interface GradeSummary {
  best: number;
  good: number;
  risky: number;
  mistake: number;
}

export function summarize(a: NonNullable<HistoryRecord["analysis"]>): GradeSummary {
  const s: GradeSummary = { best: 0, good: 0, risky: 0, mistake: 0 };
  for (const x of a) s[x.grade]++;
  return s;
}

/**
 * Grades every decision of mine; `evaluate` may be the chunked evaluator.
 * Null when cancelled.
 */
export async function analyze(
  r: HistoryRecord,
  frames: Frame[],
  evaluate: (view: SeatView, seed: number) => Promise<Evaluation | null>
): Promise<NonNullable<HistoryRecord["analysis"]> | null> {
  const out: NonNullable<HistoryRecord["analysis"]> = [];
  for (const d of myDecisions(r, frames)) {
    const e = await evaluate(d.view, r.setup.seed ^ (d.index * 2654435761));
    if (!e) return null;
    out.push({ index: d.index, grade: grade(e, d.action).grade, standWin: e.winIfStand, hitWin: e.winIfHit });
  }
  return out;
}
