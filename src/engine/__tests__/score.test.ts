import { DEFAULT_RULES, type Rules } from "../rules";
import { handValue } from "../score";
import { cards } from "../testUtils";

const eleven = DEFAULT_RULES;
const oneOr: Rules = { ...DEFAULT_RULES, ace: "oneOrEleven" };
const noPersian: Rules = { ...DEFAULT_RULES, persian: "off" };
const faces345: Rules = { ...DEFAULT_RULES, values: { ...DEFAULT_RULES.values, 11: 3, 12: 4, 13: 5 } };

type Row = [string, Rules, string, { total: number; soft: boolean; bust: boolean; persian: boolean }];
const v = (total: number, bust = false, persian = false, soft = false) => ({ total, soft, bust, persian });

const rows: Row[] = [
  ["empty", eleven, "", v(0)],
  ["pips", eleven, "7♥ 9♣", v(16)],
  ["faces W 2 D 3 K 4", eleven, "W♥ D♣ K♠", v(9)],
  ["ten and ace = 21", eleven, "10♥ A♣", v(21)],
  ["over 21 is fura", eleven, "K♥ 9♣ 10♠", v(23, true)],
  ["perskie oczko", eleven, "A♥ A♠", v(22, false, true)],
  ["two aces without the rule = fura", noPersian, "A♥ A♠", v(22, true)],
  ["three aces are not perskie", eleven, "A♥ A♠ A♦", v(33, true)],
  ["ace + 10 + ... only 2 cards count for perskie", eleven, "A♥ 9♠ A♦", v(31, true)],
  ["ace 1/11: soft", oneOr, "A♥ 6♠", v(17, false, false, true)],
  ["ace 1/11: hard when 11 would bust", oneOr, "A♥ 6♠ 9♦", v(16)],
  ["ace 1/11: two aces = 12 soft (with perskie)", oneOr, "A♥ A♠", v(12, false, true, true)],
  ["ace 1/11: two aces = 12 soft (no perskie)", { ...oneOr, persian: "off" }, "A♥ A♠", v(12, false, false, true)],
  ["ace 1/11: four aces + 7 = 21 soft", oneOr, "A♥ A♠ A♦ A♣ 7♥", v(21, false, false, true)],
  ["ace 1/11: bust", oneOr, "K♥ 10♠ 9♦ A♣", v(24, true)],
  ["other face values", faces345, "W♥ D♣ K♠", v(12)],
  ["24-card deck hand", { ...eleven, deck: 24 }, "9♥ 10♣ W♠", v(21)],
];

describe("handValue", () => {
  it.each(rows)("%s", (_name, rules, hand, expected) => {
    expect(handValue(cards(hand), rules)).toEqual({ special: null, ...expected });
  });
});
