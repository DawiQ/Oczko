// The table rendered from snapshots of a mocked game (no engine behind the buttons).
import { Animated, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { threshold } from "../../ai/policies";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { GameController } from "../../game/GameController";
import { INSTANT } from "../../game/pace";
import { makeSetup, type GameMode } from "../../game/setup";
import type { GameSnapshot, TableGame } from "../../game/TableGame";
import { memoryKV } from "../../storage/kv";
import { DialogProvider } from "../../ui/Dialog";
import { TableScreen } from "../TableScreen";

const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant, loop: instant, parallel: instant });

/** Snapshots from a real game, played by "stand at 15". */
async function snapshots(rules: Rules, mode: GameMode = "match", bots = ["ola", "hela", "marek"]) {
  const g = new GameController(makeSetup(rules, bots as never, mode, 11), {
    sleep: () => Promise.resolve(),
    pace: INSTANT,
    decide: async (_s, v, r) => threshold(17)(v, r),
  });
  const seen: GameSnapshot[] = [];
  for (let i = 0; i < 2000; i++) {
    await g.idle();
    const s = g.getSnapshot();
    seen.push(s);
    if (s.phase === "matchEnd") break;
    if (s.phase === "roundEnd") g.nextRound();
    else if (s.phase === "myTurn") (s.view.myValue.total < 15 ? g.hit : g.stand)();
  }
  return seen;
}

function fake(snap: GameSnapshot): TableGame & Record<string, jest.Mock> {
  return {
    getSnapshot: () => snap,
    subscribe: () => () => {},
    hit: jest.fn(() => null),
    stand: jest.fn(() => null),
    nextRound: jest.fn(() => null),
    skipToEnd: jest.fn(() => null),
    rematch: jest.fn(() => null),
    replayRound: jest.fn(() => null),
    abandon: jest.fn(),
  } as never;
}

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c) => typeof c === "string" || typeof c === "number")
    .join(" | ");
const button = (r: ReactTestRenderer, label: string) =>
  r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function" && !n.props.disabled)[0];

async function render(snap: GameSnapshot, extra: Partial<React.ComponentProps<typeof TableScreen>> = {}) {
  const game = fake(snap);
  const props = { onExit: jest.fn(), onNewGame: jest.fn(), onRules: jest.fn(), onGiveUp: jest.fn(), ...extra };
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(
      <DialogProvider>
        <TableScreen game={game} kv={memoryKV({ "oczko.hints.v1": JSON.stringify({ v: 1, seen: ["firstTurn", "first21", "firstBust", "bank", "persian"] }) })} {...props} />
      </DialogProvider>
    );
  });
  return { r, game, props };
}

jest.setTimeout(60000);

describe("TableScreen", () => {
  let family: GameSnapshot[];
  let bank: GameSnapshot[];
  beforeAll(async () => {
    family = await snapshots({ ...DEFAULT_RULES, target: 2 });
    bank = await snapshots({ ...PRESETS.bank, target: 2 }, "match", ["ola", "kuba", "hela", "witek", "zosia"]);
  });

  it("on my turn: the rivals, my hand, Dobieram / Starczy", async () => {
    const snap = family.find((s) => s.phase === "myTurn" && s.view.myValue.total < 21)!;
    const { r, game } = await render(snap);
    const t = textOf(r);
    expect(t).toContain(`Runda ${snap.roundNo}`);
    expect(t).toMatch(/Twój ruch|Dobrana karta|Starczy/);
    for (const seat of snap.seats.filter((x) => x.seat !== snap.me)) {
      const label = r.root.findAll((n) => typeof n.props.accessibilityLabel === "string" && n.props.accessibilityLabel.startsWith(seat.name + ","));
      expect(label.length).toBeGreaterThan(0);
    }
    const live = r.root.findAll((n) => n.props.accessibilityLiveRegion === "polite");
    expect(live.length).toBeGreaterThan(0);
    await act(async () => button(r, "Dobieram").props.onPress());
    await act(async () => button(r, "Starczy").props.onPress());
    expect(game.hit).toHaveBeenCalledTimes(1);
    expect(game.stand).toHaveBeenCalledTimes(1);
  });

  it("while the others play: 'Pokaż wynik' once I am done", async () => {
    const snap = bank.find((s) => s.canSkip && (s.phase === "othersTurn" || s.phase === "bankTurn"));
    if (!snap) return; // every round ended before the person moved
    const { r, game } = await render(snap);
    expect(button(r, "Dobieram")).toBeUndefined();
    await act(async () => button(r, "Pokaż wynik").props.onPress());
    expect(game.skipToEnd).toHaveBeenCalled();
    expect(textOf(r)).toContain("BANK");
  });

  it("the round's end: every hand, the points, next round", async () => {
    const snap = family.find((s) => s.phase === "roundEnd")!;
    const { r, game } = await render(snap);
    const t = textOf(r);
    expect(t).toMatch(/Punkt dla|Punkty dla|Nikt nie punktuje/);
    expect(t).toContain(`Punkty · do ${snap.target}`);
    for (const seat of snap.seats) expect(t).toContain(seat.name);
    await act(async () => button(r, "Następna runda").props.onPress());
    expect(game.nextRound).toHaveBeenCalled();
  });

  it("the match's end: podium, rematch, new game, lobby", async () => {
    const snap = family[family.length - 1];
    expect(snap.phase).toBe("matchEnd");
    const { r, game, props } = await render(snap);
    expect(textOf(r)).toMatch(/Partia dla Ciebie!|Partię wygrywa/);
    expect(textOf(r)).toContain("1. miejsce");
    await act(async () => button(r, "Rewanż").props.onPress());
    await act(async () => button(r, "Nowa gra").props.onPress());
    await act(async () => button(r, "Do lobby").props.onPress());
    expect(game.rematch).toHaveBeenCalled();
    expect(props.onNewGame).toHaveBeenCalled();
    expect(props.onExit).toHaveBeenCalled();
  });

  it("the match's end lists new badges", async () => {
    const snap = family[family.length - 1];
    const { r } = await render(snap, { newBadges: [{ name: "Równe 21", desc: "Runda zakończona z 21" }] });
    expect(textOf(r)).toContain("Nowa odznaka: Równe 21");
  });

  it("the menu: rules, leave, give up (confirmed)", async () => {
    const snap = family.find((s) => s.phase === "myTurn")!;
    const { r, game, props } = await render(snap);
    await act(async () => button(r, "Menu").props.onPress());
    expect(textOf(r)).toContain("Poddaj partię");
    await act(async () => button(r, "Poddaj partię").props.onPress());
    expect(textOf(r)).toContain("Poddać partię?");
    const confirm = r.root.findAll((n) => typeof n.props.onPress === "function" && textOf({ root: n } as ReactTestRenderer) === "Poddaj")[0];
    await act(async () => confirm.props.onPress());
    expect(game.abandon).toHaveBeenCalled();
    expect(props.onGiveUp).toHaveBeenCalled();
    expect(props.onExit).toHaveBeenCalled();
  });

  it("shows a one-time tip and remembers it", async () => {
    const snap = family.find((s) => s.phase === "myTurn")!;
    const kv = memoryKV();
    const game = fake(snap);
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(
        <DialogProvider>
          <TableScreen game={game} kv={kv} onExit={jest.fn()} onNewGame={jest.fn()} onRules={jest.fn()} />
        </DialogProvider>
      );
    });
    expect(textOf(r)).toContain("„Dobieram” bierze kartę");
    await act(async () => button(r, "Rozumiem").props.onPress());
    expect(textOf(r)).not.toContain("„Dobieram” bierze kartę");
    expect(JSON.parse((await kv.get("oczko.hints.v1"))!)).toEqual({ v: 1, seen: ["firstTurn"] });
  });
});

describe("score animation", () => {
  it("shows +N when a score grows", async () => {
    const { ScorePop } = jest.requireActual("../OpponentSeat") as typeof import("../OpponentSeat");
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(
        <ScorePop value={2} reduceMotion={false}>
          <Text>2</Text>
        </ScorePop>
      );
    });
    expect(textOf(r)).not.toContain("+");
    await act(async () => {
      r.update(
        <ScorePop value={3} reduceMotion={false}>
          <Text>3</Text>
        </ScorePop>
      );
    });
    expect(textOf(r)).toContain("+1");
  });
});
