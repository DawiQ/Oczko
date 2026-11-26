// Settlement tables (PLAN.md §4.2).
import { scoreRound } from "../round";
import { DEFAULT_RULES, PRESETS, type Rules } from "../rules";
import { cards } from "../testUtils";

const family = DEFAULT_RULES;
const noneTie: Rules = { ...family, familyTie: "noneScore" };
const bank = PRESETS.bank;

describe("family", () => {
  it.each<[string, Rules, string[], number[]]>([
    ["the best hand scores", family, ["10♥ 9♥", "10♣ 7♣", "K♠ 5♠"], [1, 0, 0]],
    ["fura does not count", family, ["10♥ 9♥ 5♥", "10♣ 7♣", "K♠ 5♠"], [0, 1, 0]],
    ["a tie: everyone scores", family, ["10♥ 9♥", "10♣ 9♣", "K♠ 5♠"], [1, 1, 0]],
    ["a tie: nobody scores", noneTie, ["10♥ 9♥", "10♣ 9♣", "K♠ 5♠"], [0, 0, 0]],
    ["perskie oczko beats 21", family, ["10♥ A♥", "A♣ A♠", "K♠ 5♠"], [0, 1, 0]],
    ["two perskie: everyone of them", family, ["A♥ A♦", "A♣ A♠", "10♠ K♠"], [1, 1, 0]],
    ["two perskie: nobody", noneTie, ["A♥ A♦", "A♣ A♠", "10♠ K♠"], [0, 0, 0]],
    ["all fura: nobody", family, ["10♥ 9♥ 5♥", "10♣ 7♣ K♣ 2♣", "K♠ 10♠ 9♠"], [0, 0, 0]],
    ["a lone survivor with 4", family, ["10♥ 9♥ 5♥", "4♣", "K♠ 10♠ 9♠"], [0, 1, 0]],
  ])("%s", (_name, rules, hands, points) => {
    const r = scoreRound(rules, hands.map(cards), null);
    expect(r.points).toEqual(points);
    expect(r.duels).toBeUndefined();
  });

  it("reports the values", () => {
    const r = scoreRound(family, [cards("A♥ A♠"), cards("10♥ 9♥ 5♥")], null);
    expect(r.values).toEqual([
      { seat: 0, total: 22, bust: false, persian: true, special: null },
      { seat: 1, total: 24, bust: true, persian: false, special: null },
    ]);
  });
});

describe("bank (seat 0 is the bank)", () => {
  type W = "player" | "bank" | "none";
  it.each<[string, Rules, string, string, W]>([
    ["higher player wins", bank, "10♥ 7♥", "10♣ 9♣", "player"],
    ["higher bank wins", bank, "10♥ 9♥", "10♣ 7♣", "bank"],
    ["equal: the bank", bank, "10♥ 8♥", "10♣ 8♣", "bank"],
    ["equal: nobody", { ...bank, bankTie: "nobody" }, "10♥ 8♥", "10♣ 8♣", "none"],
    ["player's fura", bank, "10♥ 2♥", "10♣ 9♣ 5♣", "bank"],
    ["bank's fura", bank, "10♥ 9♥ 5♥", "10♣ 2♣", "player"],
    ["both fura: the bank", bank, "10♥ 9♥ 5♥", "10♣ 9♣ 5♣", "bank"],
    ["both fura: nobody", { ...bank, playerBustLoses: false }, "10♥ 9♥ 5♥", "10♣ 9♣ 5♣", "none"],
    ["player's perskie beats 21", bank, "10♥ A♥", "A♣ A♠", "player"],
    ["bank's perskie beats 21", bank, "A♣ A♠", "10♥ A♥", "bank"],
    ["perskie vs perskie: the bank", bank, "A♥ A♦", "A♣ A♠", "bank"],
    ["perskie vs perskie: nobody", { ...bank, bankTie: "nobody" }, "A♥ A♦", "A♣ A♠", "none"],
    ["player's perskie vs bank's fura", bank, "10♥ 9♥ 5♥", "A♣ A♠", "player"],
  ])("%s", (_name, rules, bankHand, playerHand, winner) => {
    const r = scoreRound(rules, [cards(bankHand), cards(playerHand)], 0);
    expect(r.duels).toEqual([{ seat: 1, winner }]);
    expect(r.points[1]).toBe(winner === "player" ? 1 : 0);
    expect(r.points[0]).toBe(winner === "bank" ? 1 : 0); // one duel: majority = that duel
  });

  const table = [cards("10♥ 8♥"), cards("10♣ 9♣"), cards("10♠ 7♠"), cards("10♦ 6♦"), cards("K♣ 2♣")];
  // bank 18 vs: 19 (player), 17 (bank), 16 (bank), 6 (bank)
  it("majority: the bank scores once for winning more duels", () => {
    const r = scoreRound(bank, table, 0);
    expect(r.points).toEqual([1, 1, 0, 0, 0]);
  });

  it("perDuel: the bank scores every duel won", () => {
    const r = scoreRound({ ...bank, bankScoring: "perDuel" }, table, 0);
    expect(r.points).toEqual([3, 1, 0, 0, 0]);
  });

  it("majority: as many won as lost → no point for the bank", () => {
    const r = scoreRound(bank, [cards("10♥ 8♥"), cards("10♣ 9♣"), cards("10♠ 7♠"), cards("10♦ 8♦")], 0);
    // 19 player, 17 bank, 18 tie → bank (bankWins): bank won 2, lost 1
    expect(r.points).toEqual([1, 1, 0, 0]);
    const nobody = scoreRound({ ...bank, bankTie: "nobody" }, [cards("10♥ 8♥"), cards("10♣ 9♣"), cards("10♠ 7♠"), cards("10♦ 8♦")], 0);
    expect(nobody.duels!.map((d) => d.winner)).toEqual(["player", "bank", "none"]);
    expect(nobody.points).toEqual([0, 1, 0, 0]);
  });

  it("the bank can sit anywhere", () => {
    const r = scoreRound(bank, [cards("10♣ 9♣"), cards("10♥ 8♥"), cards("10♠ 7♠")], 1);
    expect(r.duels).toEqual([
      { seat: 0, winner: "player" },
      { seat: 2, winner: "bank" },
    ]);
    expect(r.points).toEqual([1, 0, 0]);
  });
});
