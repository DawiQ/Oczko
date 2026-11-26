import { threshold } from "../../ai/policies";
import { withPreset } from "../../engine/presets";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { GameController } from "../../game/GameController";
import { INSTANT } from "../../game/pace";
import { makeSetup } from "../../game/setup";
import type { GameSnapshot } from "../../game/TableGame";
import { pl } from "../../i18n/pl";
import { hintFor } from "../hints";
import { seatA11y } from "../OpponentSeat";
import { fanCard, opponentsOf, seatSize, seatSpots } from "../layout";
import { caption, eventText, headline, statusLabel } from "../texts";

async function play(rules: Rules, bots: string[], seed = 3): Promise<GameSnapshot[]> {
  const g = new GameController(makeSetup(rules, bots as never, "match", seed), {
    sleep: () => Promise.resolve(),
    pace: INSTANT,
    decide: async (_s, v, r) => threshold(17)(v, r),
  });
  const all: GameSnapshot[] = [];
  g.subscribe(() => all.push(g.getSnapshot()));
  for (let i = 0; i < 3000; i++) {
    await g.idle();
    const s = g.getSnapshot();
    if (s.phase === "matchEnd") break;
    if (s.phase === "roundEnd") g.nextRound();
    else if (s.phase === "myTurn") (s.view.myValue.total < 16 ? g.hit : g.stand)();
  }
  return all;
}

const FORBIDDEN_FORMS = /(łeś|łaś|eś |aś )/;

describe("table texts", () => {
  it("describe every moment, neutrally", async () => {
    for (const rules of [{ ...DEFAULT_RULES, target: 3 }, { ...PRESETS.bank, target: 3 }]) {
      const snaps = await play(rules, ["ola", "hela", "witek"]);
      for (const s of snaps) {
        const c = caption(s);
        expect(typeof c).toBe("string");
        expect(c).not.toMatch(FORBIDDEN_FORMS);
        for (const { event } of s.lastEvents) expect(eventText(event, s) ?? "").not.toMatch(FORBIDDEN_FORMS);
        for (const seat of s.seats) statusLabel(seat);
        if (s.result) {
          const h = headline(s);
          expect(h.title.length).toBeGreaterThan(0);
          expect(h.title + h.sub).not.toMatch(FORBIDDEN_FORMS);
        }
      }
      const end = snaps[snaps.length - 1];
      expect(end.phase).toBe("matchEnd");
      expect(headline(end).title).toMatch(/Partia dla Ciebie!|Partię wygrywa/);
    }
  });

  it("name Pontoon's hands (why a lower total wins) in the seats' labels", async () => {
    const seen = new Set<string>();
    for (let seed = 1; seed < 40 && seen.size < 2; seed++) {
      for (const s of await play({ ...withPreset(DEFAULT_RULES, "pontoon"), target: 3 }, ["ola", "hela", "witek"], seed)) {
        for (const seat of s.seats) {
          if (!seat.value?.special) continue;
          seen.add(seat.value.special);
          expect(seatA11y(seat)).toContain(pl.table.specials[seat.value.special]);
        }
      }
    }
    expect([...seen].sort()).toEqual(["fiveCard", "pontoon"]);
  });

  it("offer a tip only once per kind", async () => {
    const snaps = await play({ ...DEFAULT_RULES, target: 2 }, ["ola"]);
    const my = snaps.find((s) => s.phase === "myTurn")!;
    expect(hintFor(my, [])).toBe(my.view.myValue.total === 21 ? "first21" : "firstTurn");
    expect(hintFor(my, ["firstTurn", "first21"])).toBeNull();
  });
});

describe("layout", () => {
  it("places every rival inside the felt, left to right, without overlaps", () => {
    for (let n = 1; n <= 7; n++) {
      const spots = seatSpots(n);
      expect(spots).toHaveLength(n);
      for (const p of spots) {
        expect(p.x).toBeGreaterThanOrEqual(0.05);
        expect(p.x).toBeLessThanOrEqual(0.95);
        expect(p.y).toBeGreaterThanOrEqual(0.05);
        expect(p.y).toBeLessThanOrEqual(0.45);
      }
      for (let i = 1; i < n; i++) expect(spots[i].x).toBeGreaterThan(spots[i - 1].x);
      // At 360 × 460 px no two seats closer than a portrait.
      for (let i = 1; i < n; i++) {
        const dx = (spots[i].x - spots[i - 1].x) * 360;
        const dy = (spots[i].y - spots[i - 1].y) * 460;
        expect(Math.hypot(dx, dy)).toBeGreaterThan(60);
      }
    }
    expect(seatSize(3)).toBe("lg");
    expect(seatSize(7)).toBe("sm");
  });

  it("orders the rivals from my left", () => {
    expect(opponentsOf(4, 0)).toEqual([1, 2, 3]);
    expect(opponentsOf(4, 2)).toEqual([3, 0, 1]);
  });

  it("fans the hand symmetrically", () => {
    for (let n = 1; n <= 9; n++) {
      const cards = Array.from({ length: n }, (_, i) => fanCard(i, n));
      expect(cards[0].rotate).toBeCloseTo(-cards[n - 1].rotate);
      expect(cards[0].dx).toBeCloseTo(-cards[n - 1].dx);
      expect(Math.abs(cards[0].dx)).toBeLessThanOrEqual(140);
    }
  });
});
