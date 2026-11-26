import { storyHolds } from "../../../tools/find-tutorial-seed";
import { GameController } from "../../game/GameController";
import { INSTANT } from "../../game/pace";
import { coachText, expectedMove, TUTORIAL_SEED, tutorialSetup } from "../tutorialScript";

describe("tutorial", () => {
  it("its seed still tells the story (engine changes would break it)", () => {
    expect(storyHolds(TUTORIAL_SEED)).toBe(true);
  });

  it("plays at the real table: hit, hit, stand — the point is yours", async () => {
    const g = new GameController(tutorialSetup(), { sleep: () => Promise.resolve(), pace: INSTANT });
    const moves: string[] = [];
    for (let i = 0; i < 20; i++) {
      await g.idle();
      const s = g.getSnapshot();
      expect(coachText(s) ?? "").not.toMatch(/(łeś|łaś)/);
      const m = expectedMove(s);
      if (!m) break;
      moves.push(m);
      expect(m === "hit" ? g.hit() : g.stand()).toBeNull();
    }
    const end = g.getSnapshot();
    expect(moves).toEqual(["hit", "hit", "stand"]);
    expect(end.phase).toBe("matchEnd");
    expect(end.result!.points).toEqual([1, 0, 0]);
    expect(end.seats[2].value!.bust).toBe(true);
  });
});
