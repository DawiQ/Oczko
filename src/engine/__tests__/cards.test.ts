import { cardOf, isCard, makeDeck, rankOf, suitOf } from "../cards";

describe("cards", () => {
  it("encodes rank and suit", () => {
    expect(rankOf(0)).toBe(2);
    expect(suitOf(0)).toBe(0);
    expect(rankOf(51)).toBe(14);
    expect(suitOf(51)).toBe(3);
    for (let c = 0; c < 52; c++) expect(cardOf(rankOf(c), suitOf(c))).toBe(c);
  });

  it.each([
    [52, 2],
    [32, 7],
    [24, 9],
  ] as const)("deck of %i starts at rank %i, four of each rank, no duplicates", (size, lowest) => {
    const deck = makeDeck(size);
    expect(deck).toHaveLength(size);
    expect(new Set(deck).size).toBe(size);
    expect(Math.min(...deck.map(rankOf))).toBe(lowest);
    expect(Math.max(...deck.map(rankOf))).toBe(14);
    for (let r = lowest; r <= 14; r++) expect(deck.filter((c) => rankOf(c) === r)).toHaveLength(4);
  });

  it("validates card ids", () => {
    expect(isCard(0)).toBe(true);
    expect(isCard(51)).toBe(true);
    expect(isCard(52)).toBe(false);
    expect(isCard(-1)).toBe(false);
    expect(isCard(1.5)).toBe(false);
    expect(isCard("3")).toBe(false);
  });
});
