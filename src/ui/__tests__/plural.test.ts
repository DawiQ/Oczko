import { cardsCount, plural, pointsCount, roundsCount } from "../plural";

describe("plural", () => {
  it.each([
    [0, "kart"],
    [1, "karta"],
    [2, "karty"],
    [4, "karty"],
    [5, "kart"],
    [11, "kart"],
    [12, "kart"],
    [14, "kart"],
    [21, "kart"],
    [22, "karty"],
    [25, "kart"],
    [102, "karty"],
    [112, "kart"],
    [-3, "karty"],
  ])("%i → %s", (n, form) => {
    expect(plural(n, "karta", "karty", "kart")).toBe(form);
  });

  it("counts", () => {
    expect(cardsCount(3)).toBe("3 karty");
    expect(pointsCount(1)).toBe("1 punkt");
    expect(pointsCount(10)).toBe("10 punktów");
    expect(roundsCount(22)).toBe("22 rundy");
  });
});
