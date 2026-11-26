import { act, create } from "react-test-renderer";

import { threshold } from "../../ai/policies";
import { DEFAULT_RULES } from "../../engine/rules";
import { memoryKV } from "../../storage/kv";
import { loadSavedGame } from "../../storage/save";
import { loadStats } from "../../storage/stats";
import type { GameController } from "../GameController";
import { INSTANT } from "../pace";
import { makeSetup } from "../setup";
import type { GameSnapshot } from "../TableGame";
import { useGame } from "../useGame";

describe("useGame", () => {
  it("saves every move, records statistics, stops on unmount", async () => {
    const kv = memoryKV();
    const setup = makeSetup({ ...DEFAULT_RULES, target: 1 }, ["ola"], "match", 9);
    let game!: GameController;
    let snap!: GameSnapshot;
    function Probe() {
      const g = useGame({ setup }, { kv, pace: INSTANT, sleep: () => Promise.resolve(), decide: async (_s, v, r) => threshold(17)(v, r) });
      game = g.game;
      snap = g.snapshot;
      return null;
    }
    let r!: ReturnType<typeof create>;
    await act(async () => {
      r = create(<Probe />);
    });
    for (let i = 0; i < 100 && snap.phase !== "matchEnd"; i++) {
      await act(async () => {
        await game.idle();
        const s = game.getSnapshot();
        if (s.phase === "myTurn") {
          if (s.view.myValue.total < 16) game.hit();
          else game.stand();
        }
        else if (s.phase === "roundEnd") game.nextRound();
        await game.idle();
      });
    }
    expect(snap.phase).toBe("matchEnd");
    await act(async () => {
      await new Promise((res) => setTimeout(res, 0));
    });
    // A finished match is not resumable: the save is cleared.
    expect(await loadSavedGame(kv)).toBeNull();
    const st = await loadStats(kv);
    expect(st.rounds).toBe(snap.roundNo);
    expect(st.matches).toBe(1);
    act(() => r.unmount());
    expect(game.hit()).toBe("disposed");
  });
});
