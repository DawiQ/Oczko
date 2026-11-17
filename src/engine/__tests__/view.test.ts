// Hidden information: a seat never sees another seat's face-down cards.
import type { Card } from "../cards";
import { matchApply, newMatch, nextRound, type MatchState } from "../match";
import { makeRng, rngInt, splitmix32, type Rng } from "../rng";
import { dealRound, legal, type RoundEvent } from "../round";
import { DEFAULT_RULES, PRESETS, type Rules } from "../rules";
import { stockFor } from "../testUtils";
import { eventsFor, viewFor } from "../view";

const variants: Rules[] = [
  DEFAULT_RULES,
  PRESETS.bank,
  { ...DEFAULT_RULES, bustRevealed: false, startCards: 2 },
  { ...PRESETS.bank, bustRevealed: false },
  { ...PRESETS.small24, ace: "oneOrEleven", maxCards: 4 },
];

/** Cards of `seat` that `viewer` must not know. */
function hiddenFrom(m: MatchState, viewer: number): Set<Card> {
  const hidden = new Set<Card>(m.round.stock);
  m.round.hands.forEach((h, seat) => {
    if (seat !== viewer && !m.round.revealed[seat]) h.forEach((c) => hidden.add(c));
  });
  return hidden;
}

function checkView(m: MatchState, viewer: number): void {
  const v = viewFor(m, viewer);
  const hidden = hiddenFrom(m, viewer);
  const visible = [...v.myHand, ...v.seenCards, ...v.others.flatMap((o) => o.hand ?? [])];
  for (const c of visible) expect(hidden.has(c)).toBe(false);
  expect(v.myHand).toEqual(m.round.hands[viewer]);
  expect(Object.keys(v)).not.toEqual(expect.arrayContaining(["stock"]));
  expect(JSON.stringify(v)).not.toMatch(/"(stock|seed|seedBase|log|hands)"/);
  for (const o of v.others) {
    expect(o.cards).toBe(m.round.hands[o.seat].length);
    expect(o.hand !== undefined).toBe(m.round.revealed[o.seat]);
    const real = m.round.status[o.seat];
    expect(o.status).toBe(real === "bust" && !m.round.revealed[o.seat] ? "stood" : real);
  }
  expect(v.legal).toEqual(m.round.turn === viewer ? legal(m.round) : []);
  expect(v.stockLeft).toBe(m.round.stock.length);
}

function checkEvents(events: RoundEvent[], m: MatchState, viewer: number): void {
  const hidden = hiddenFrom(m, viewer);
  for (const e of eventsFor(events, viewer, m.round)) {
    if (e.t === "hit" && e.card !== undefined) {
      expect(e.seat).toBe(viewer);
      expect(hidden.has(e.card)).toBe(false);
    }
    if (e.t === "reveal") for (const c of e.hand) expect(hidden.has(c)).toBe(false);
    if (e.t === "bust" && e.seat !== viewer) expect(m.rules.bustRevealed).toBe(true);
  }
}

describe("viewFor / eventsFor", () => {
  it("never show another seat's face-down cards (thousands of states)", () => {
    let rng: Rng = makeRng(31);
    let states = 0;
    for (let g = 0; g < 120; g++) {
      const rules = { ...variants[g % variants.length], target: 3 };
      const seats = 2 + (g % (rules.deck === 24 ? 3 : 7));
      let m = newMatch(rules, seats, splitmix32(g), g % seats);
      for (let round = 0; round < 4 && m.winner === null; round++) {
        for (let v = 0; v < seats; v++) checkEvents(m.round.log, m, v);
        while (m.round.turn !== null) {
          for (let v = 0; v < seats; v++) checkView(m, v);
          states++;
          const moves = legal(m.round);
          let i: number;
          [i, rng] = rngInt(rng, moves.length);
          const r = matchApply(m, m.round.turn, moves[i]);
          if ("error" in r) throw new Error(r.error);
          m = r.state;
          for (let v = 0; v < seats; v++) checkEvents(r.events, m, v);
        }
        for (let v = 0; v < seats; v++) checkView(m, v);
        if (m.winner !== null) break;
        const n = nextRound(m);
        if ("error" in n) throw new Error(n.error);
        m = n;
      }
    }
    expect(states).toBeGreaterThan(2000);
  });

  it("hides a fura that is not announced", () => {
    const rules: Rules = { ...DEFAULT_RULES, bustRevealed: false };
    const start = newMatch(rules, 3, 1);
    let m: MatchState = { ...start, round: dealRound(rules, 3, stockFor(rules, ["5♥", "10♥", "2♠"], "K♣ 9♣"), 0, null) };
    const all: RoundEvent[] = [];
    for (const a of ["hit", "hit"] as const) {
      const r = matchApply(m, m.round.turn!, a);
      if ("error" in r) throw new Error(r.error);
      m = r.state;
      all.push(...r.events);
    }
    expect(m.round.status[1]).toBe("bust");
    expect(viewFor(m, 1).myStatus).toBe("bust");
    expect(viewFor(m, 2).others.find((o) => o.seat === 1)!.status).toBe("stood");
    expect(eventsFor(all, 2, m.round).map((e) => e.t)).toEqual(["hit", "hit", "stand"]);
    expect(eventsFor(all, 1, m.round).map((e) => e.t)).toEqual(["hit", "hit", "bust"]);
  });

  it("shows my own drawn card, never someone else's", () => {
    const m = newMatch(DEFAULT_RULES, 3, 5);
    const r = matchApply(m, 1, "hit");
    if ("error" in r) throw new Error(r.error);
    expect(eventsFor(r.events, 1, r.state.round)[0]).toEqual(r.events[0]);
    expect(eventsFor(r.events, 0, r.state.round)[0]).toEqual({ t: "hit", seat: 1 });
  });
});
