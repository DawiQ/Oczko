import { makeDeck, type Card } from "../../engine/cards";
import { matchApply, newMatch, type MatchState } from "../../engine/match";
import { dealRound } from "../../engine/round";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { handValue } from "../../engine/score";
import { c, cards, stockFor } from "../../engine/testUtils";
import { viewFor } from "../../engine/view";
import { chunkedEvaluator, evaluate } from "../evaluate";

/** A match whose current round is dealt from a crafted stock. */
function table(rules: Rules, hands: string[], draws = "", dealer = 0, bank: number | null = null): MatchState {
  const m = newMatch(rules, hands.length, 1, dealer);
  return { ...m, round: dealRound(rules, hands.length, stockFor(rules, hands, draws, dealer, bank), dealer, bank) };
}

function play(m: MatchState, ...moves: ("hit" | "stand")[]): MatchState {
  for (const a of moves) {
    const r = matchApply(m, m.round.turn!, a);
    if ("error" in r) throw new Error(r.error);
    m = r.state;
  }
  return m;
}

const model = { standAt: 17 };

describe("P(fura) is exact", () => {
  it("counts the unseen cards that bust the hand", () => {
    // Seat 1 (dealer 1 → order 0, 1): seat 0 busts openly, then my turn with 10♥ + 9♣ = 19.
    const m = play(table(DEFAULT_RULES, ["5♥", "10♥"], "K♣ 9♦ 4♠ 9♣", 1), "hit", "hit", "hit", "hit");
    // seat 0: 5♥ K♣ 9♦ 4♠ = 22 → fura, shown; seat 1: 10♥ then draws 9♣ → 19
    expect(m.round.turn).toBe(1);
    const v = viewFor(m, 1);
    expect(v.myValue.total).toBe(19);
    const seen = new Set(v.seenCards);
    const unseen = makeDeck(52).filter((x) => !seen.has(x));
    // 19 + v > 21 for every card worth 3 or more (D, K, 3–10, A); W (2) and 2 do not bust.
    const bust = unseen.filter((x) => handValue([...v.myHand, x], DEFAULT_RULES).bust).length;
    expect(unseen).toHaveLength(52 - 6);
    const e = evaluate(v, { samples: 10, rng: { state: 1 }, opponentModel: model });
    expect(e.bustIfHit).toBeCloseTo(bust / unseen.length, 12);
    expect(e.bustIfHit).toBeCloseTo(38 / 46, 12); // 46 unseen, 8 safe (four 2s, four W)
  });

  it("is 0 when no card can bust, and perskie oczko is not a fura", () => {
    const low = viewFor(table(DEFAULT_RULES, ["5♥", "4♥"]), 1);
    expect(evaluate(low, { samples: 10, rng: { state: 1 }, opponentModel: model }).bustIfHit).toBe(0);
    // A♥ alone: another ace makes perskie oczko (not fura); only 10 + 11 = 21 and so on
    const ace = viewFor(table(DEFAULT_RULES, ["5♥", "A♥"]), 1);
    expect(evaluate(ace, { samples: 10, rng: { state: 1 }, opponentModel: model }).bustIfHit).toBe(0);
    const noPersian = viewFor(table({ ...DEFAULT_RULES, persian: false }, ["5♥", "A♥"]), 1);
    expect(evaluate(noPersian, { samples: 10, rng: { state: 1 }, opponentModel: model }).bustIfHit).toBeCloseTo(3 / 51, 12);
  });
});

describe("Monte Carlo converges to the exact chances", () => {
  it("against a revealed fura: standing always scores, a hit scores unless it busts", () => {
    const m = play(table(DEFAULT_RULES, ["5♥", "D♥"], "K♣ 9♦ 4♠", 1), "hit", "hit", "hit");
    expect(m.round.status[0]).toBe("bust");
    const v = viewFor(m, 1);
    const e = evaluate(v, { samples: 4000, rng: { state: 9 }, opponentModel: model, continueAt: 0 });
    expect(e.winIfStand).toBe(1);
    expect(Math.abs(e.winIfHit - (1 - e.bustIfHit))).toBeLessThan(0.02);
    expect(e.best).toBe("stand");
  });

  // Family, 24 cards: I (seat 0) move first with 10♥; seat 1 has one hidden
  // card and then draws to 17. Exact chances by enumerating every order.
  const rules: Rules = { ...PRESETS.small24 };
  const deck = makeDeck(24);
  const mine = c("10♥");

  function oppOutcome(myTotal: number, used: Set<Card>, opp: Card[], memo: Map<string, number>): number {
    const v = handValue(opp, rules);
    if (opp.length > 0 && (v.persian || v.bust || v.total >= 17)) {
      if (v.persian) return 0;
      if (v.bust) return 1;
      return v.total <= myTotal ? 1 : 0; // a tie scores for both (allScore)
    }
    const key = `${myTotal}|${[...used].sort((a, b) => a - b).join(",")}|${opp.join(",")}`;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const free = deck.filter((x) => !used.has(x));
    let p = 0;
    for (const x of free) {
      used.add(x);
      p += oppOutcome(myTotal, used, [...opp, x], memo);
      used.delete(x);
    }
    memo.set(key, p / free.length);
    return p / free.length;
  }

  function exact(): { stand: number; hit: number } {
    const memo = new Map<string, number>();
    const used = new Set<Card>([mine]);
    // Standing on 10: the opponent's hidden card and draws are uniform over the rest.
    const stand = oppOutcome(10, used, [], memo);
    // Hitting once: the opponent's hidden card was dealt first, my card next;
    // by symmetry both are uniform without replacement over the unseen cards.
    let hit = 0;
    const free = deck.filter((x) => x !== mine);
    for (const h of free) {
      // opp's hidden card first
      const rest = free.filter((x) => x !== h);
      let q = 0;
      for (const d of rest) {
        const me = handValue([mine, d], rules);
        if (me.bust) continue;
        const u = new Set<Card>([mine, h, d]);
        q += oppOutcome(me.total, u, [h], memo);
      }
      hit += q / rest.length;
    }
    return { stand, hit: hit / free.length };
  }

  it("matches an exact enumeration (stand and one hit)", () => {
    const m = table(rules, ["10♥", "9♣"], "", 1);
    expect(m.round.turn).toBe(0);
    const v = viewFor(m, 0);
    const ex = exact();
    const e = evaluate(v, { samples: 20000, rng: { state: 3 }, opponentModel: model, continueAt: 0 });
    expect(Math.abs(e.winIfStand - ex.stand)).toBeLessThan(0.015);
    expect(Math.abs(e.winIfHit - ex.hit)).toBeLessThan(0.015);
    expect(e.best).toBe(ex.hit > ex.stand ? "hit" : "stand");
  });
});

describe("inference from what is known", () => {
  it("a rival who stopped under the model is assumed to hold 17+", () => {
    // seat 0 draws once and stops (face down); I hold 10 and stand.
    const m = play(table(DEFAULT_RULES, ["9♥", "10♣"], "2♠", 1), "hit", "stand");
    const v = viewFor(m, 1);
    expect(v.others[0]).toMatchObject({ status: "stood", cards: 2 });
    const e = evaluate(v, { samples: 3000, rng: { state: 4 }, opponentModel: model });
    expect(e.winIfStand).toBeLessThan(0.02);
    expect(e.best).toBe("hit");
  });

  it("an announced perskie oczko cannot be beaten", () => {
    const m = play(table(DEFAULT_RULES, ["A♥", "10♣"], "A♠", 1), "hit");
    const v = viewFor(m, 1);
    expect(v.others[0].persian).toBe(true);
    const e = evaluate(v, { samples: 2000, rng: { state: 5 }, opponentModel: model });
    expect(e.winIfStand).toBe(0);
    expect(e.winIfHit).toBe(0);
  });

  it("as the bank: counts the duels already decided", () => {
    // Bank 0; seat 1 busts openly, seat 2 draws to 17 and stops face down.
    for (const [scoring, expected] of [
      ["perDuel", 0.5],
      ["majority", 0],
    ] as const) {
      const rules: Rules = { ...PRESETS.bank, bankScoring: scoring };
      const m = play(table(rules, ["5♥", "10♣", "9♥"], "K♠ 9♦ 8♣", 0, 0), "hit", "hit", "hit", "stand");
      expect(m.round.turn).toBe(0);
      const e = evaluate(viewFor(m, 0), { samples: 2000, rng: { state: 6 }, opponentModel: model });
      // Standing on 5 loses to a 17+ that stopped, wins against the fura.
      expect(Math.abs(e.winIfStand - expected)).toBeLessThan(0.01);
      expect(e.best).toBe("hit");
    }
  });
});

describe("determinism and chunks", () => {
  const v = viewFor(newMatch(DEFAULT_RULES, 4, 77, 3), 0);

  it("the same seed gives the same result; another seed a close one", () => {
    const a = evaluate(v, { samples: 1500, rng: { state: 11 }, opponentModel: model });
    expect(evaluate(v, { samples: 1500, rng: { state: 11 }, opponentModel: model })).toEqual(a);
    const b = evaluate(v, { samples: 1500, rng: { state: 12 }, opponentModel: model });
    expect(Math.abs(a.winIfStand - b.winIfStand)).toBeLessThan(0.06);
    expect(a.samples).toBe(1500);
    expect(a.confidence).toBeGreaterThanOrEqual(0);
    expect(a.confidence).toBeLessThanOrEqual(1);
  });

  it("chunks give exactly the full result", async () => {
    const full = evaluate(v, { samples: 1000, rng: { state: 2 }, opponentModel: model });
    const progress: number[] = [];
    const ev = chunkedEvaluator(130, () => Promise.resolve());
    const r = await ev.evaluate(v, { samples: 1000, rng: { state: 2 }, opponentModel: model }, (p) => progress.push(p.samples));
    expect(r).toEqual(full);
    expect(progress).toEqual([130, 260, 390, 520, 650, 780, 910]);
  });

  it("a cancelled evaluation resolves null, a newer one wins", async () => {
    const ev = chunkedEvaluator(100, () => Promise.resolve());
    const first = ev.evaluate(v, { samples: 1000, rng: { state: 2 }, opponentModel: model });
    const second = ev.evaluate(v, { samples: 300, rng: { state: 2 }, opponentModel: model });
    expect(await first).toBeNull();
    expect((await second)?.samples).toBe(300);
    const third = ev.evaluate(v, { samples: 1000, rng: { state: 2 }, opponentModel: model });
    ev.cancel();
    expect(await third).toBeNull();
  });
});

describe("limits", () => {
  it("cannot hit with an empty stock", () => {
    const m = newMatch(DEFAULT_RULES, 2, 3);
    const empty: MatchState = { ...m, round: { ...m.round, stock: [] } };
    const e = evaluate(viewFor(empty, empty.round.turn!), { samples: 200, rng: { state: 1 }, opponentModel: model });
    expect(e.best).toBe("stand");
    expect(e.winIfHit).toBe(0);
    expect(e.bustIfHit).toBe(0);
  });

  it("uses cards() helper consistently", () => {
    expect(cards("10♥ A♠")).toEqual([c("10♥"), c("A♠")]);
  });
});
