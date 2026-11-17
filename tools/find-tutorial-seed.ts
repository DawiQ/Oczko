// Finds the tutorial's seed (src/onboarding/tutorialScript.ts): you draw
// twice (after the first card still ≤ 15), stop on 18–20; Kuba stops lower,
// Witek goes over 21 — the point is yours alone.
//   npx tsx tools/find-tutorial-seed.ts
import { personaById } from "../src/ai/personas";
import { policyOf } from "../src/ai/policies";
import { matchApply, newMatch } from "../src/engine/match";
import { rankOf } from "../src/engine/cards";
import { handValue } from "../src/engine/score";
import { viewFor } from "../src/engine/view";
import { TUTORIAL_MOVES, tutorialSetup } from "../src/onboarding/tutorialScript";

export function storyHolds(seed: number): boolean {
  const setup = tutorialSetup(seed);
  let m = newMatch(setup.rules, 3, setup.seed, setup.first);
  const rules = setup.rules;
  if (m.round.turn !== 0) return false;
  if (rankOf(m.round.hands[0][0]) === 14 || handValue(m.round.hands[0], rules).total > 9) return false;
  let rng = { state: 1 };
  let step = 0;
  while (m.round.turn !== null) {
    const seat = m.round.turn;
    let action;
    if (seat === 0) {
      action = TUTORIAL_MOVES[step++];
      if (!action) return false;
      if (step === 2 && handValue(m.round.hands[0], rules).total > 15) return false;
    } else {
      const seatSetup = setup.seats[seat];
      const spec = seatSetup.kind === "bot" ? personaById(seatSetup.persona)!.policy : null;
      const d = policyOf(spec!)(viewFor(m, seat), rng);
      rng = d.rng;
      action = d.action;
    }
    const r = matchApply(m, seat, action);
    if ("error" in r) return false;
    m = r.state;
  }
  const v = m.round.result!.values;
  const me = v[0];
  return (
    step === 3 &&
    !me.bust &&
    me.total >= 18 &&
    me.total <= 20 &&
    v[2].bust &&
    !v[1].bust &&
    v[1].total < me.total &&
    m.round.result!.points.join() === "1,0,0"
  );
}

if (require.main === module) {
  for (let seed = 0; seed < 1_000_000; seed++)
    if (storyHolds(seed)) {
      console.log(`TUTORIAL_SEED = ${seed}`);
      break;
    }
}
