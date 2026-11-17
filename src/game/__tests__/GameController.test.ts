import { threshold } from "../../ai/policies";
import type { Card } from "../../engine/cards";
import { makeRng } from "../../engine/rng";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { GameController, type ControllerDeps, type Decide, type RoundEndInfo, type SavedGame } from "../GameController";
import { INSTANT } from "../pace";
import { makeSetup, type GameMode } from "../setup";
import type { GameSnapshot } from "../TableGame";

/** Bots decide at once by a plain threshold (the evaluator is mocked away). */
const decide: Decide = async (_spec, view, rng) => threshold(17)(view, rng);

function controller(rules: Rules, mode: GameMode = "match", extra: Partial<ControllerDeps> = {}, seats = 4, seed = 42) {
  const saves: SavedGame[] = [];
  const rounds: RoundEndInfo[] = [];
  const matches: RoundEndInfo[] = [];
  const setup = makeSetup(rules, ["ola", "marek", "hela", "kuba", "witek"].slice(0, seats - 1) as never, mode, seed);
  const deps: ControllerDeps = {
    sleep: () => Promise.resolve(),
    pace: INSTANT,
    decide,
    onSave: (s) => saves.push(s),
    onRoundEnd: (i) => rounds.push(i),
    onMatchEnd: (i) => matches.push(i),
    ...extra,
  };
  return { game: new GameController(setup, deps), saves, rounds, matches, deps, setup };
}

/** The person plays to 16 and stands; returns every snapshot seen. */
async function playMatch(game: GameController, maxRounds = 500, onSnap?: (s: GameSnapshot) => void): Promise<GameSnapshot> {
  let rng = makeRng(7);
  game.subscribe(() => onSnap?.(game.getSnapshot()));
  for (let i = 0; i < 10000; i++) {
    await game.idle();
    const s = game.getSnapshot();
    onSnap?.(s);
    if (s.phase === "matchEnd") return s;
    if (s.phase === "roundEnd") {
      if (s.roundNo >= maxRounds) return s;
      expect(game.nextRound()).toBeNull();
    } else if (s.phase === "myTurn") {
      const d = threshold(16)(s.view, rng);
      rng = d.rng;
      expect(d.action === "hit" ? game.hit() : game.stand()).toBeNull();
    } else throw new Error(`stuck in ${s.phase}`);
  }
  throw new Error("no end");
}

describe("GameController", () => {
  it.each([
    ["family", DEFAULT_RULES],
    ["bank", PRESETS.bank],
  ] as const)("plays a whole %s match", async (_n, rules) => {
    const { game, rounds, matches, saves } = controller({ ...rules, target: 5 });
    const end = await playMatch(game);
    expect(end.winner).not.toBeNull();
    expect(end.scores[end.winner!]).toBeGreaterThanOrEqual(5);
    expect(rounds).toHaveLength(end.roundNo);
    expect(matches).toHaveLength(1);
    expect(saves.length).toBeGreaterThan(end.roundNo);
    expect(end.canRematch).toBe(true);
    expect(end.seats.every((s) => s.hand !== undefined)).toBe(true);
  });

  it("never shows another seat's face-down cards", async () => {
    const rules: Rules = { ...DEFAULT_RULES, target: 4, bustRevealed: false };
    const { game } = controller(rules, "match", {}, 5);
    let checked = 0;
    await playMatch(game, 500, (s) => {
      checked++;
      for (const seat of s.seats) {
        if (seat.seat === s.me || s.phase === "roundEnd" || s.phase === "matchEnd") continue;
        if (seat.hand) expect(s.phase === "showdown" || s.lastEvents.some((e) => e.event.t === "reveal")).toBe(true);
        if (s.phase !== "showdown") expect(seat.hand).toBeUndefined(); // no shown furas with bustRevealed off
        if (!seat.hand) expect(seat.status).not.toBe("bust");
      }
      for (const { event } of s.lastEvents) if (event.t === "hit" && event.seat !== s.me) expect(event.card).toBeUndefined();
      expect(JSON.stringify(s)).not.toMatch(/"(stock|seed|seedBase)"/);
    });
    expect(checked).toBeGreaterThan(50);
  });

  it("shows the hands one by one, then the result", async () => {
    const { game } = controller({ ...DEFAULT_RULES, target: 1 });
    const reveals: number[] = [];
    let resultAfter = -1;
    game.subscribe(() => {
      const s = game.getSnapshot();
      const last = s.lastEvents[s.lastEvents.length - 1];
      if (!last) return;
      if (last.event.t === "reveal" && !reveals.includes(last.id)) reveals.push(last.id);
      if (last.event.t === "result") resultAfter = reveals.length;
    });
    await playMatch(game, 1);
    expect(reveals.length).toBeGreaterThanOrEqual(1);
    expect(resultAfter).toBe(reveals.length);
  });

  it("save → load → continue gives the same match", async () => {
    const a = controller({ ...PRESETS.bank, target: 4 });
    const endA = await playMatch(a.game);
    // Resume from a save in the middle of the match (on the person's turn or between rounds).
    const mid = a.saves[Math.floor(a.saves.length / 2)];
    const json: SavedGame = JSON.parse(JSON.stringify(mid));
    const b = new GameController(json.setup, a.deps, json);
    // The person's decisions after the save follow the same rule (stand on 16+); the rng of the
    // human rule is not used by threshold, so replaying from the middle is deterministic.
    const endB = await playMatch(b);
    expect(endB.scores).toEqual(endA.scores);
    expect(endB.winner).toBe(endA.winner);
    expect(endB.roundNo).toBe(endA.roundNo);
  });

  it("rematch: the same table, new cards, no points", async () => {
    const { game } = controller({ ...DEFAULT_RULES, target: 2 });
    const end = await playMatch(game);
    const before = game.saved().match.round;
    expect(game.rematch()).toBeNull();
    await game.idle();
    const s = game.getSnapshot();
    expect(s.scores.every((x) => x === 0)).toBe(true);
    expect(s.roundNo).toBe(1);
    expect(game.saved().match.round.hands).not.toEqual(before.hands);
    expect(s.seats.map((x) => x.name)).toEqual(end.seats.map((x) => x.name));
  });

  it("training: this round again — the same cards, no points, no statistics", async () => {
    const { game, rounds } = controller({ ...DEFAULT_RULES, target: 10 }, "training");
    const start = game.saved().match;
    const firstHand: Card[] = start.round.hands[0].slice();
    let s = await playMatch(game, 1);
    expect(s.phase).toBe("roundEnd");
    expect(s.canReplay).toBe(true);
    expect(rounds).toHaveLength(0);
    expect(game.replayRound()).toBeNull();
    await game.idle();
    s = game.getSnapshot();
    expect(s.roundNo).toBe(1);
    expect(s.scores).toEqual(start.scores);
    expect(game.saved().match.round.hands[0]).toEqual(firstHand);
    expect(game.saved().roundStart.round.stock).toEqual(start.round.stock); // the same deck order
  });

  it("'Pokaż wynik' finishes the round while the bank thinks", async () => {
    // Pauses never end on their own: only skipping can finish the round.
    const forever = () => new Promise<void>(() => {});
    const base = controller({ ...PRESETS.bank, target: 10 });
    base.game.dispose();
    // Seat 3 is the bank and deals: the person (seat 0) moves first.
    const setup = { ...base.setup, first: 3 };
    const game = new GameController(setup, { ...base.deps, sleep: forever, pace: { botDelayMs: 800, fastDelayMs: 250, dealDelayMs: 0, revealDelayMs: 400 } });
    await game.idle(); // the deal
    expect(game.getSnapshot().phase).toBe("myTurn");
    expect(game.getSnapshot().canSkip).toBe(false);
    expect(game.skipToEnd()).toBe("nothing-to-skip");
    expect(game.stand()).toBeNull();
    const s = game.getSnapshot();
    expect(s.phase).toBe("othersTurn");
    expect(s.seats.some((x) => x.thinking)).toBe(true);
    expect(s.canSkip).toBe(true);
    expect(game.skipToEnd()).toBeNull();
    await game.idle();
    expect(game.getSnapshot().phase).toMatch(/roundEnd|matchEnd/);
    expect(game.getSnapshot().seats.every((x) => !x.thinking)).toBe(true);
  });

  it("refuses moves at the wrong time", async () => {
    const { game } = controller({ ...DEFAULT_RULES, target: 10 });
    await game.idle();
    const s = game.getSnapshot();
    expect(s.phase).toBe("myTurn"); // seat 0 moves first or the bots finished before it
    expect(game.nextRound()).toBe("round-not-over");
    expect(game.replayRound()).toBe("not-training");
    expect(game.rematch()).toBe("round-not-over");
    expect(game.skipToEnd()).toBe("nothing-to-skip");
    game.dispose();
    expect(game.hit()).toBe("disposed");
  });
});
