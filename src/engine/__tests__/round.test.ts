import { makeDeck } from "../cards";
import { makeRng, splitmix32 } from "../rng";
import { apply, dealRound, legal, newRound, playOrder, type RoundEvent, type RoundState } from "../round";
import { DEFAULT_RULES, PRESETS, type Rules } from "../rules";
import { handValue } from "../score";
import { cards, deepFreeze, playRandom, stockFor } from "../testUtils";

const family = DEFAULT_RULES;
const bank = PRESETS.bank;

function ok(r: ReturnType<typeof apply>): { state: RoundState; events: RoundEvent[] } {
  if ("error" in r) throw new Error(r.error);
  return r;
}
const act = (s: RoundState, ...moves: ("hit" | "stand")[]) => moves.reduce((st, m) => ok(apply(st, st.turn!, m)).state, s);

describe("deal and order", () => {
  it("plays from the dealer's left, dealer last", () => {
    expect(playOrder(4, 0, null)).toEqual([1, 2, 3, 0]);
    expect(playOrder(4, 2, null)).toEqual([3, 0, 1, 2]);
  });

  it("puts the bank last", () => {
    expect(playOrder(4, 2, 2)).toEqual([3, 0, 1, 2]);
    expect(playOrder(3, 0, 1)).toEqual([2, 0, 1]);
  });

  it("deals startCards to everyone, first in order to move", () => {
    const s = newRound(family, 4, 99, 0, null);
    expect(s.hands.map((h) => h.length)).toEqual([1, 1, 1, 1]);
    expect(s.stock).toHaveLength(48);
    expect(s.turn).toBe(1);
    expect(s.status).toEqual(["waiting", "playing", "waiting", "waiting"]);
    expect(s.log.filter((e) => e.t === "deal")).toEqual([1, 2, 3, 0].map((seat) => ({ t: "deal", seat, count: 1 })));
    const two = newRound({ ...family, startCards: 2 }, 3, 99, 0, null);
    expect(two.hands.every((h) => h.length === 2)).toBe(true);
  });

  it("deals round-robin from the top of the stock", () => {
    const stock = stockFor({ ...family, startCards: 2 }, ["2♥ 3♥", "4♥ 5♥", "6♥ 7♥"]);
    const s = dealRound({ ...family, startCards: 2 }, 3, stock, 0, null);
    expect(s.hands).toEqual([cards("2♥ 3♥"), cards("4♥ 5♥"), cards("6♥ 7♥")]);
    expect(stock.slice(0, 6)).toEqual(cards("4♥ 6♥ 2♥ 5♥ 7♥ 3♥"));
  });

  it.each([
    ["too few seats", family, 1, 0, null],
    ["too many seats for 52", family, 9, 0, null],
    ["too many seats for 24", PRESETS.small24, 6, 0, null],
    ["a dealer off the table", family, 3, 3, null],
    ["no bank in bank mode", bank, 3, 0, null],
    ["a bank off the table", bank, 3, 0, 5],
    ["a bank in family mode", family, 3, 0, 0],
  ] as const)("rejects %s", (_n, rules, seats, dealer, b) => {
    expect(() => newRound(rules as Rules, seats, 1, dealer, b)).toThrow();
  });
});

describe("moves", () => {
  it("hit takes the top card, stand passes the turn", () => {
    const stock = stockFor(family, ["5♥", "6♥", "7♥"], "9♣");
    const s0 = dealRound(family, 3, stock, 0, null);
    const r = ok(apply(s0, 1, "hit"));
    expect(r.state.hands[1]).toEqual(cards("6♥ 9♣"));
    expect(r.events).toEqual([{ t: "hit", seat: 1, card: cards("9♣")[0] }]);
    expect(r.state.turn).toBe(1);
    const r2 = ok(apply(r.state, 1, "stand"));
    expect(r2.state.status[1]).toBe("stood");
    expect(r2.state.turn).toBe(2);
  });

  it("rejects moves out of turn and after the end", () => {
    const s = newRound(family, 3, 5, 0, null);
    expect(apply(s, 2, "hit")).toEqual({ error: "not-your-turn" });
    expect(apply(s, 0, "stand")).toEqual({ error: "not-your-turn" });
    const end = act(s, "stand", "stand", "stand");
    expect(end.result).not.toBeNull();
    expect(end.turn).toBeNull();
    expect(legal(end)).toEqual([]);
    expect(apply(end, 1, "stand")).toEqual({ error: "round-over" });
  });

  it("allows only 'Starczy' with an empty stock", () => {
    const s = newRound(family, 2, 5, 0, null);
    const empty = { ...s, stock: [] };
    expect(legal(empty)).toEqual(["stand"]);
    expect(apply(empty, empty.turn!, "hit")).toEqual({ error: "illegal-action" });
  });

  it("21 does not end the turn", () => {
    const s = act(dealRound(family, 2, stockFor(family, ["5♥", "10♥"], "A♣"), 0, null), "hit");
    expect(handValue(s.hands[1], family).total).toBe(21);
    expect(s.status[1]).toBe("playing");
    expect(legal(s)).toEqual(["hit", "stand"]);
  });

  it("fura ends the turn and shows the cards", () => {
    const s0 = dealRound(family, 2, stockFor(family, ["5♥", "10♥"], "K♣ 9♣"), 0, null);
    const r = ok(apply(act(s0, "hit"), 1, "hit"));
    expect(r.state.status[1]).toBe("bust");
    expect(r.state.revealed[1]).toBe(true);
    expect(r.events).toEqual([
      { t: "hit", seat: 1, card: cards("9♣")[0] },
      { t: "bust", seat: 1 },
      { t: "reveal", seat: 1, hand: cards("10♥ K♣ 9♣") },
    ]);
    expect(r.state.turn).toBe(0);
  });

  it("a hidden fura is shown only at the end", () => {
    const rules = { ...family, bustRevealed: false };
    const s = act(dealRound(rules, 2, stockFor(rules, ["5♥", "10♥"], "K♣ 9♣"), 0, null), "hit", "hit");
    expect(s.status[1]).toBe("bust");
    expect(s.revealed[1]).toBe(false);
    const end = act(s, "stand");
    expect(end.revealed).toEqual([true, true]);
  });

  it("perskie oczko after a draw stops the hand", () => {
    const s0 = dealRound(family, 2, stockFor(family, ["5♥", "A♥"], "A♣"), 0, null);
    const r = ok(apply(s0, 1, "hit"));
    expect(r.state.status[1]).toBe("stood");
    expect(r.events.map((e) => e.t)).toEqual(["hit", "persian"]);
    expect(r.state.revealed[1]).toBe(false); // announced, the cards stay face down
    expect(r.state.turn).toBe(0);
  });

  it("perskie oczko already in the deal (two start cards)", () => {
    const rules: Rules = { ...family, startCards: 2 };
    const s = dealRound(rules, 3, stockFor(rules, ["5♥ 6♥", "A♥ A♠", "7♥ 8♥"]), 0, null);
    expect(s.status).toEqual(["waiting", "stood", "playing"]);
    expect(s.turn).toBe(2);
    expect(s.log).toContainEqual({ t: "persian", seat: 1 });
  });

  it("two aces dealt without perskie oczko are fura (ace 11)", () => {
    const rules: Rules = { ...family, startCards: 2, persian: "off" };
    const s = dealRound(rules, 2, stockFor(rules, ["5♥ 6♥", "A♥ A♠"]), 0, null);
    expect(s.status[1]).toBe("bust");
    expect(s.turn).toBe(0);
  });

  it("the card limit stops the hand", () => {
    const rules: Rules = { ...family, maxCards: 3 };
    const s0 = dealRound(rules, 2, stockFor(rules, ["5♥", "2♥"], "2♣ 3♣"), 0, null);
    const r = ok(apply(act(s0, "hit"), 1, "hit"));
    expect(r.state.status[1]).toBe("maxed");
    expect(r.events.map((e) => e.t)).toEqual(["hit", "maxed"]);
    expect(r.state.turn).toBe(0);
  });

  it("ends with every hand shown, then the result", () => {
    const s = act(newRound(family, 3, 77, 0, null), "stand", "stand", "stand");
    const tail = s.log.slice(-4);
    expect(tail.slice(0, 3).map((e) => e.t)).toEqual(["reveal", "reveal", "reveal"]);
    expect(tail[3].t).toBe("result");
    expect(s.revealed).toEqual([true, true, true]);
  });
});

describe("bank", () => {
  it("does not play when every player's fura is known", () => {
    const s0 = dealRound(bank, 3, stockFor(bank, ["5♥", "10♥", "10♠"], "K♣ 9♣ K♦ 9♦", 0, 0), 0, 0);
    expect(s0.order).toEqual([1, 2, 0]);
    const s = act(s0, "hit", "hit", "hit", "hit");
    expect(s.status).toEqual(["stood", "bust", "bust"]);
    expect(s.log.filter((e) => e.t === "hit" && e.seat === 0)).toEqual([]);
    expect(s.result!.duels).toEqual([
      { seat: 1, winner: "bank" },
      { seat: 2, winner: "bank" },
    ]);
  });

  it("plays when the furas are hidden", () => {
    const rules: Rules = { ...bank, bustRevealed: false };
    const s = act(dealRound(rules, 2, stockFor(rules, ["5♥", "10♥"], "K♣ 9♣", 0, 0), 0, 0), "hit", "hit");
    expect(s.turn).toBe(0);
    expect(s.status[0]).toBe("playing");
  });
});

describe("invariants over random rounds", () => {
  const variants: Rules[] = [
    family,
    bank,
    PRESETS.small24,
    { ...family, startCards: 2, ace: "oneOrEleven" },
    { ...bank, bustRevealed: false, maxCards: 4 },
    { ...family, persian: "off", familyTie: "noneScore" },
  ];

  it("keeps the deck whole, statuses final, one seat moving", () => {
    let rng = makeRng(2024);
    for (let i = 0; i < 1500; i++) {
      const rules = variants[i % variants.length];
      const seats = 2 + (i % (rules.deck === 24 ? 3 : 6));
      const dealer = i % seats;
      const s0 = newRound(rules, seats, splitmix32(i), dealer, rules.mode === "bank" ? dealer : null);
      const played = playRandom(s0, rng);
      rng = played.rng;
      let prev: RoundState | null = null;
      for (const s of played.states) {
        const all = [...s.stock, ...s.hands.flat()];
        expect(all.slice().sort((a, b) => a - b)).toEqual(makeDeck(rules.deck));
        const moving = s.status.flatMap((st, seat) => (st === "playing" ? [seat] : []));
        expect(moving).toEqual(s.turn === null ? [] : [s.turn]);
        if (prev)
          prev.status.forEach((st, seat) => {
            if (st === "stood" || st === "bust" || st === "maxed") {
              expect(s.status[seat]).toBe(st);
              expect(s.hands[seat]).toEqual(prev!.hands[seat]);
            }
          });
        if (s.turn !== null) {
          const other = (s.turn + 1) % seats;
          expect(apply(s, other, "stand")).toEqual({ error: "not-your-turn" });
        }
        prev = s;
      }
      const end = played.states[played.states.length - 1];
      expect(end.result).not.toBeNull();
      expect(end.status.every((st) => st !== "playing" && st !== "waiting")).toBe(true);
      expect(end.revealed.every(Boolean)).toBe(true);
      expect(end.log[end.log.length - 1]).toEqual({ t: "result", result: end.result });
    }
  });

  it("the same seed and decisions give the same course", () => {
    for (let i = 0; i < 50; i++) {
      const a = playRandom(newRound(bank, 4, i, 1, 1), makeRng(i));
      const b = playRandom(newRound(bank, 4, i, 1, 1), makeRng(i));
      expect(b.states).toEqual(a.states);
    }
  });

  it("apply never mutates its input", () => {
    for (let i = 0; i < 100; i++) {
      let s = newRound(i % 2 ? bank : family, 3, i, 0, i % 2 ? 0 : null);
      while (s.turn !== null) {
        const copy = JSON.parse(JSON.stringify(s));
        deepFreeze(s);
        const r = ok(apply(s, s.turn, i % 3 ? "hit" : "stand"));
        expect(s).toEqual(copy);
        s = r.state;
      }
    }
  });
});

describe("edge cases", () => {
  it("a round can end in the deal (everyone has perskie oczko)", () => {
    const rules: Rules = { ...family, startCards: 2 };
    const s = dealRound(rules, 2, stockFor(rules, ["A♥ A♦", "A♣ A♠"]), 0, null);
    expect(s.turn).toBeNull();
    expect(s.result!.points).toEqual([1, 1]);
    expect(s.log[s.log.length - 1].t).toBe("result");
  });

  it("the bank skips when every player's fura comes in the deal", () => {
    const rules: Rules = { ...bank, startCards: 2, persian: "off" };
    const s = dealRound(rules, 3, stockFor(rules, ["5♥ 6♥", "A♥ A♦", "A♣ A♠"], "", 0, 0), 0, 0);
    expect(s.status).toEqual(["stood", "bust", "bust"]);
    expect(s.result!.points).toEqual([1, 0, 0]);
  });

  it("refuses a stock too short to deal", () => {
    expect(() => dealRound(family, 3, cards("2♥ 3♥"), 0, null)).toThrow();
  });
});
