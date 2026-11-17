import { threshold } from "../../ai/policies";
import { newMatch } from "../../engine/match";
import { DEFAULT_RULES, PRESETS } from "../../engine/rules";
import { dealRound } from "../../engine/round";
import { stockFor } from "../../engine/testUtils";
import { GameController, type SavedGame } from "../../game/GameController";
import { INSTANT } from "../../game/pace";
import { makeSetup } from "../../game/setup";
import { memoryKV, readJSON, writeJSON } from "../kv";
import { clearSavedGame, isResumable, loadSavedGame, looksLikeSavedGame, SAVE_KEY, saveGame } from "../save";
import { emptyStats, loadStats, looksLikeStats, recordMatch, recordRound, STATS_KEY, updateStats } from "../stats";

function saved(): SavedGame {
  const setup = makeSetup(DEFAULT_RULES, ["ola", "hela"], "match", 5);
  const g = new GameController(setup, { sleep: () => Promise.resolve(), pace: INSTANT, decide: async (_s, v, r) => threshold(17)(v, r) });
  g.dispose();
  return JSON.parse(JSON.stringify(g.saved()));
}

describe("saved game", () => {
  it("round-trips through storage", async () => {
    const kv = memoryKV();
    const s = saved();
    expect(looksLikeSavedGame(s)).toBe(true);
    await saveGame(kv, s);
    expect(await loadSavedGame(kv)).toEqual(s);
    expect(isResumable(s)).toBe(true);
    await clearSavedGame(kv);
    expect(await loadSavedGame(kv)).toBeNull();
  });

  const spoil: [string, (s: SavedGame) => void][] = [
    ["a duplicated card", (s) => (s.match.round.stock[0] = s.match.round.hands[0][0])],
    ["a missing card", (s) => s.match.round.stock.pop()],
    ["a card out of range", (s) => (s.match.round.stock[0] = 52)],
    ["wrong seat count", (s) => s.match.scores.push(0)],
    ["bad rules", (s) => ((s.setup.rules as { target: number }).target = 0)],
    ["an unknown persona", (s) => ((s.setup.seats[1] as { persona: string }).persona = "nikt")],
    ["a bad decision", (s) => s.decisions.push({ round: 1, seat: 9, action: "hit" })],
    ["a bad status", (s) => ((s.match.round.status as string[])[0] = "sleeping")],
    ["version 2", (s) => ((s as { v: number }).v = 2)],
  ];
  it.each(spoil)("rejects %s", async (_n, f) => {
    const s = saved();
    f(s);
    expect(looksLikeSavedGame(s)).toBe(false);
    const kv = memoryKV({ [SAVE_KEY]: JSON.stringify(s) });
    expect(await loadSavedGame(kv)).toBeNull();
  });

  it("corrupt JSON reads as nothing", async () => {
    expect(await loadSavedGame(memoryKV({ [SAVE_KEY]: "{" }))).toBeNull();
  });
});

describe("statistics", () => {
  it("records a round from the person's seat", () => {
    const rules = { ...DEFAULT_RULES, target: 50 };
    const m = newMatch(rules, 2, 1, 1);
    // seat 0 holds 10♥ + A♣ = 21 and stands; seat 1 stands on 9
    const round = dealRound(rules, 2, stockFor(rules, ["10♥", "9♣"], "A♣", 1), 1, null);
    let s = { ...m, round };
    const { matchApply } = jest.requireActual("../../engine/match");
    for (const a of ["hit", "stand", "stand"]) s = matchApply(s, s.round.turn!, a).state;
    const st = recordRound(emptyStats(), s, 0);
    expect(st).toMatchObject({ rounds: 1, roundsWon: 1, twentyOnes: 1, stands: 1, standTotal: 21, busts: 0, streak: 1, bestStreak: 1 });
    expect(st.byMode.family.roundsWon).toBe(1);
    const lost = recordRound(st, s, 1);
    expect(lost).toMatchObject({ rounds: 2, roundsWon: 1, streak: 0, bestStreak: 1 });
  });

  it("records a match against each character once", () => {
    const m = { ...newMatch({ ...PRESETS.bank, target: 1 }, 3, 1), winner: 0 };
    const st = recordMatch(emptyStats(), m, 0, ["ola", "ola"]);
    expect(st).toMatchObject({ matches: 1, matchesWon: 1, byPersona: { ola: { matches: 1, won: 1 } } });
    expect(st.byMode.bank.matchesWon).toBe(1);
    expect(recordMatch(st, { ...m, winner: null }, 0, [])).toBe(st);
  });

  it("validates and never loses an update", async () => {
    expect(looksLikeStats(emptyStats())).toBe(true);
    expect(looksLikeStats({ ...emptyStats(), rounds: -1 })).toBe(false);
    expect(looksLikeStats({ ...emptyStats(), byPersona: { ola: { matches: 1 } } })).toBe(false);
    const kv = memoryKV();
    await Promise.all(Array.from({ length: 10 }, () => updateStats(kv, (s) => ({ ...s, rounds: s.rounds + 1 }))));
    expect((await loadStats(kv)).rounds).toBe(10);
    await writeJSON(kv, STATS_KEY, "nonsense");
    expect(await loadStats(kv)).toEqual(emptyStats());
    expect(await readJSON(kv, STATS_KEY, looksLikeStats)).toBeNull();
  });
});
