import { Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import type { Evaluation } from "../../ai/evaluate";
import { threshold } from "../../ai/policies";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { ENGINE_VERSION } from "../../engine/version";
import { GameController, type RoundEndInfo } from "../../game/GameController";
import { INSTANT } from "../../game/pace";
import { makeSetup } from "../../game/setup";
import { memoryKV } from "../../storage/kv";
import { addRecord, exportHistory, HISTORY_KEY, loadHistory, MAX_HISTORY, updateRecord } from "../../storage/history";
import { analyze, grade, GOOD_LOSS, myDecisions, RISKY_LOSS, summarize } from "../analysis";
import { buildRecord, looksLikeRecord, replay, replayMatches, type HistoryRecord } from "../record";
import { HistoryScreen } from "../HistoryScreen";
import { ReplayScreen } from "../ReplayScreen";

async function playedRecord(rules: Rules, seed = 5): Promise<HistoryRecord> {
  let end: RoundEndInfo | null = null;
  const g = new GameController(makeSetup(rules, ["ola", "witek", "kuba"], "match", seed), {
    sleep: () => Promise.resolve(),
    pace: INSTANT,
    decide: async (_s, v, r) => threshold(17)(v, r),
    onMatchEnd: (i) => (end = i),
  });
  for (let i = 0; i < 3000 && !end; i++) {
    await g.idle();
    const s = g.getSnapshot();
    if (s.phase === "roundEnd") g.nextRound();
    else if (s.phase === "myTurn") (s.view.myValue.total < 16 ? g.hit : g.stand)();
  }
  return buildRecord(end!, 1700000000000 + seed);
}

describe("history record", () => {
  it.each([
    ["family", { ...DEFAULT_RULES, target: 4 }],
    ["bank", { ...PRESETS.bank, target: 4 }],
  ] as const)("save → read → replay gives the same match (%s)", async (_n, rules) => {
    const rec = await playedRecord(rules);
    const kv = memoryKV();
    await addRecord(kv, rec);
    const [back] = await loadHistory(kv);
    expect(back).toEqual(JSON.parse(JSON.stringify(rec)));
    expect(looksLikeRecord(back)).toBe(true);
    expect(replayMatches(back)).toBe(true);
    const frames = replay(back);
    if ("error" in frames) throw new Error(frames.error);
    expect(frames.filter((f) => f.decision === null)).toHaveLength(rec.rounds);
    expect(frames.length).toBe(rec.decisions.length + rec.rounds);
  });

  it("refuses another engine version and a broken decision", async () => {
    const rec = await playedRecord({ ...DEFAULT_RULES, target: 2 });
    expect(replay({ ...rec, engineVersion: ENGINE_VERSION + 1 })).toEqual({ error: "engine-version" });
    const bad = { ...rec, decisions: [{ round: 1, seat: (rec.setup.first + 2) % 4, action: "hit" as const }, ...rec.decisions] };
    expect(replay(bad)).toEqual({ error: "bad-decision" });
    expect(replayMatches({ ...rec, scores: rec.scores.map((x) => x + 1) })).toBe(false);
  });
});

describe("grading decisions", () => {
  const e = (stand: number, hit: number) => ({ winIfStand: stand, winIfHit: hit });
  it.each([
    [e(0.5, 0.3), "stand", "best"],
    [e(0.5, 0.3), "hit", "mistake"],
    [e(0.5, 0.5 - GOOD_LOSS), "hit", "good"],
    [e(0.5, 0.5 - GOOD_LOSS - 0.001), "hit", "risky"],
    [e(0.5, 0.5 - RISKY_LOSS), "hit", "risky"],
    [e(0.5, 0.5 - RISKY_LOSS - 0.001), "hit", "mistake"],
    [e(0.2, 0.6), "hit", "best"],
    [e(0.4, 0.4), "stand", "best"],
  ] as const)("%j, %s → %s", (ev, action, expected) => {
    expect(grade(ev, action).grade).toBe(expected);
  });

  it("grades every decision of mine (mocked evaluator)", async () => {
    const rec = await playedRecord({ ...DEFAULT_RULES, target: 3 });
    const frames = replay(rec);
    if ("error" in frames) throw new Error(frames.error);
    const mine = myDecisions(rec, frames);
    expect(mine).toHaveLength(rec.decisions.filter((d) => d.seat === rec.me).length);
    for (const d of mine) expect(d.view.legal).toContain(d.action);
    const fixed = async () => ({ winIfStand: 0.6, winIfHit: 0.4 }) as Evaluation;
    const a = (await analyze(rec, frames, fixed))!;
    expect(a).toHaveLength(mine.length);
    const s = summarize(a);
    expect(s.best + s.mistake).toBe(mine.length);
    expect(s.best).toBe(mine.filter((d) => d.action === "stand").length);
    expect(await analyze(rec, frames, async () => null)).toBe(mine.length ? null : []);
  });
});

describe("history storage", () => {
  it("keeps the last 50, drops broken records, updates, exports", async () => {
    const rec = await playedRecord({ ...DEFAULT_RULES, target: 2 });
    const kv = memoryKV();
    for (let i = 0; i < MAX_HISTORY + 5; i++) await addRecord(kv, { ...rec, id: `r${i}`, date: rec.date + i });
    let all = await loadHistory(kv);
    expect(all).toHaveLength(MAX_HISTORY);
    expect(all[0].id).toBe(`r${MAX_HISTORY + 4}`);
    await updateRecord(kv, { ...all[0], analysis: [] });
    all = await loadHistory(kv);
    expect(all[0].analysis).toEqual([]);
    const raw = JSON.parse((await kv.get(HISTORY_KEY))!);
    raw.records[1] = { broken: true };
    await kv.set(HISTORY_KEY, JSON.stringify(raw));
    expect(await loadHistory(kv)).toHaveLength(MAX_HISTORY - 1);
    expect(JSON.parse(exportHistory(all.slice(0, 2))).records).toHaveLength(2);
  });
});

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c) => typeof c === "string")
    .join(" | ");
const button = (r: ReactTestRenderer, label: string) =>
  r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function" && !n.props.disabled)[0];

describe("history screens", () => {
  it("lists the matches (with a limit) and opens one", async () => {
    const rec = await playedRecord({ ...DEFAULT_RULES, target: 2 });
    const onOpen = jest.fn();
    const onMore = jest.fn();
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<HistoryScreen records={[rec, { ...rec, id: "b" }, { ...rec, id: "c" }]} limit={2} onOpen={onOpen} onBack={jest.fn()} onMore={onMore} />);
    });
    expect(textOf(r)).toContain("Jeszcze 1 partia w Oczko Pro");
    const rows = r.root.findAll((n) => typeof n.props.accessibilityLabel === "string" && n.props.accessibilityLabel.includes("Rodzinne") && typeof n.props.onPress === "function");
    await act(async () => rows[0].props.onPress());
    expect(onOpen).toHaveBeenCalledWith(rec);
  });

  it("replays move by move and analyses", async () => {
    const rec = await playedRecord({ ...DEFAULT_RULES, target: 2 });
    const onAnalysed = jest.fn();
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<ReplayScreen record={rec} onBack={jest.fn()} onAnalysed={onAnalysed} evaluate={async () => ({ winIfStand: 0.5, winIfHit: 0.5 }) as Evaluation} />);
    });
    expect(textOf(r)).toContain("Runda 1 — rozdanie");
    await act(async () => button(r, "Następny ruch").props.onPress());
    expect(textOf(r)).toMatch(/Starczy|Dobieram/);
    await act(async () => button(r, "Analizuj moje decyzje").props.onPress());
    expect(onAnalysed).toHaveBeenCalled();
    expect(textOf(r)).toContain("Twoje decyzje:");
  });
});

describe("replay edge cases", () => {
  it("replays a last round decided in the deal (no decisions in it)", () => {
    // Bank 1:1 without perskie oczko, 2 start cards: find a seed whose round 2
    // ends at once (the player gets two aces = fura), after round 1 played by "stand".
    const { newMatch, matchApply, nextRound } = jest.requireActual("../../engine/match") as typeof import("../../engine/match");
    const rules: Rules = { ...PRESETS.bank, startCards: 2, persian: false, target: 1, bankTie: "nobody" };
    for (let seed = 0; seed < 50000; seed++) {
      let m = newMatch(rules, 2, seed, 0);
      if (m.round.result) continue;
      const decisions = [];
      while (m.round.turn !== null) {
        decisions.push({ round: 1, seat: m.round.turn, action: "stand" as const });
        m = (matchApply(m, m.round.turn, "stand") as { state: typeof m }).state;
      }
      if (m.winner !== null) continue;
      const m2 = nextRound(m);
      if ("error" in m2 || !m2.round.result || m2.winner === null) continue;
      const rec: HistoryRecord = {
        v: 1,
        engineVersion: ENGINE_VERSION,
        id: "x",
        date: 1,
        setup: { v: 1, rules, seats: [{ kind: "human", name: "Ty" }, { kind: "bot", persona: "ola", name: "Ola" }], seed, mode: "match", first: 0 },
        me: 0,
        decisions,
        scores: m2.scores,
        winner: m2.winner,
        rounds: 2,
      };
      expect(replayMatches(rec)).toBe(true);
      return;
    }
    throw new Error("no such seed");
  });
});
