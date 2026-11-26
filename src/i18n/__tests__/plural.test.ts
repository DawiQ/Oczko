import { pl } from "../pl";
import { czechForm, eastSlavicForm, germanicForm, hungarianForm, plural, polishForm, type PluralForm } from "../plural";

const cases = (f: (n: number) => PluralForm, table: [number, PluralForm][]) => table.forEach(([n, form]) => expect([n, f(n)]).toEqual([n, form]));

describe("plural forms", () => {
  it("Polish", () => {
    cases(polishForm, [
      [0, "many"], [1, "one"], [2, "few"], [4, "few"], [5, "many"], [11, "many"], [12, "many"], [14, "many"],
      [21, "many"], [22, "few"], [25, "many"], [102, "few"], [112, "many"], [-3, "few"],
    ]);
    expect(plural(22, "karta", "karty", "kart")).toBe("karty");
  });

  it("Czech and Slovak", () => {
    cases(czechForm, [[0, "many"], [1, "one"], [2, "few"], [4, "few"], [5, "many"], [21, "many"], [22, "many"]]);
  });

  it("Ukrainian, Russian, Serbo-Croatian", () => {
    cases(eastSlavicForm, [
      [0, "many"], [1, "one"], [2, "few"], [5, "many"], [11, "many"], [12, "many"], [21, "one"], [22, "few"], [111, "many"], [101, "one"],
    ]);
  });

  it("English, German, Hungarian", () => {
    cases(germanicForm, [[0, "many"], [1, "one"], [2, "many"], [21, "many"]]);
    cases(hungarianForm, [[0, "one"], [1, "one"], [5, "one"]]);
  });

  it("Polish counts", () => {
    expect(pl.common.cards(3)).toBe("3 karty");
    expect(pl.common.points(1)).toBe("1 punkt");
    expect(pl.common.points(10)).toBe("10 punktów");
    expect(pl.common.rounds(22)).toBe("22 rundy");
  });
});
