import { Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import type { ChunkedEvaluator, Evaluation } from "../../ai/evaluate";
import { threshold } from "../../ai/policies";
import { DEFAULT_RULES } from "../../engine/rules";
import { GameController } from "../../game/GameController";
import { INSTANT } from "../../game/pace";
import { makeSetup } from "../../game/setup";
import type { GameSnapshot } from "../../game/TableGame";
import { TrainerPanel, useTrainer } from "../TrainerPanel";

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c) => typeof c === "string")
    .join(" ");

async function myTurn(): Promise<GameSnapshot> {
  const g = new GameController(makeSetup(DEFAULT_RULES, ["ola"], "training", 4), {
    sleep: () => Promise.resolve(),
    pace: INSTANT,
    decide: async (_s, v, r) => threshold(17)(v, r),
  });
  await g.idle();
  return g.getSnapshot();
}

describe("trainer", () => {
  it("shows P(fura) and both chances, the better one in the a11y text", async () => {
    const e: Evaluation = { bustIfHit: 0.38, winIfStand: 0.54, winIfHit: 0.41, best: "stand", confidence: 0.9, samples: 1500 };
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<TrainerPanel evaluation={e} />);
    });
    expect(textOf(r)).toContain("38%");
    expect(textOf(r)).toContain("54%");
    expect(textOf(r)).toContain("41%");
    const label = r.root.findAll((n) => typeof n.props.accessibilityLabel === "string" && n.props.accessibilityLabel.startsWith("Trener:"))[0];
    expect(label.props.accessibilityLabel).toContain("Lepiej: Starczy");
  });

  it("evaluates on my turn only, from my view", async () => {
    const snap = await myTurn();
    expect(snap.phase).toBe("myTurn");
    const seen: unknown[] = [];
    const fake: ChunkedEvaluator = {
      cancel: () => {},
      evaluate: async (view) => {
        seen.push(view);
        return { bustIfHit: 0, winIfStand: 0.2, winIfHit: 0.6, best: "hit", confidence: 1, samples: 1500 };
      },
    };
    let result: Evaluation | "locked" | null = null;
    function Probe({ s, on }: { s: GameSnapshot; on: boolean }) {
      result = useTrainer(s, on, () => fake);
      return null;
    }
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<Probe s={snap} on />);
    });
    expect(result).toMatchObject({ best: "hit" });
    expect(seen).toHaveLength(1);
    expect(JSON.stringify(seen[0])).not.toMatch(/"(stock|seed)"/);
    await act(async () => r.update(<Probe s={snap} on={false} />));
    expect(result).toBeNull();
  });
});
