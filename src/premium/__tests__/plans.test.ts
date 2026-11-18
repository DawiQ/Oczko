// The plans as RevenueCat offers them: kinds from package types or product
// periods, the paywall's texts per kind, the offering picked by id.
import type { PurchasesPackage } from "react-native-purchases";

import { ctaLabel, defaultPlan, finePrint, planKind, planNote, planTitle, type Plan, type PlanKind } from "../plans";
import { pickOffering, planOf } from "../store";

const plan = (kind: PlanKind, trialDays: number | null = null, id: string = kind): Plan => ({ id, kind, price: "9,99 zł", trialDays });

describe("plan kinds", () => {
  it.each([
    ["WEEKLY", null, false, "weekly"],
    ["MONTHLY", "P1M", false, "monthly"],
    ["TWO_MONTH", null, false, "twoMonths"],
    ["THREE_MONTH", null, false, "threeMonths"],
    ["SIX_MONTH", null, false, "sixMonths"],
    ["ANNUAL", "P1Y", false, "yearly"],
    ["LIFETIME", null, true, "lifetime"],
    // Custom packages: by the product's period, or a one-time purchase.
    ["CUSTOM", "P1W", false, "weekly"],
    ["CUSTOM", "P3M", false, "threeMonths"],
    ["CUSTOM", "P1Y", false, "yearly"],
    ["CUSTOM", null, true, "lifetime"],
    ["CUSTOM", "P5D", false, "other"],
    ["UNKNOWN", null, false, "other"],
  ] as const)("%s %s → %s", (type, period, oneTime, kind) => {
    expect(planKind(type, period, oneTime)).toBe(kind);
  });

  it("reads a RevenueCat package", () => {
    const pkg = {
      identifier: "$rc_monthly",
      packageType: "MONTHLY",
      product: {
        priceString: "4,99 zł",
        subscriptionPeriod: "P1M",
        productCategory: "SUBSCRIPTION",
        introPrice: { price: 0, period: "P1W" },
        defaultOption: null,
      },
    } as unknown as PurchasesPackage;
    expect(planOf(pkg)).toEqual({ id: "$rc_monthly", kind: "monthly", price: "4,99 zł", trialDays: 7 });
  });
});

describe("paywall texts", () => {
  it("say the right period for every subscription", () => {
    const per: [PlanKind, string, string][] = [
      ["weekly", "tydzień", "co tydzień"],
      ["monthly", "miesiąc", "co miesiąc"],
      ["twoMonths", "2 miesiące", "co 2 miesiące"],
      ["threeMonths", "3 miesiące", "co 3 miesiące"],
      ["sixMonths", "pół roku", "co pół roku"],
      ["yearly", "rok", "co rok"],
    ];
    for (const [kind, unit, every] of per) {
      const p = plan(kind);
      expect(planNote(p)).toBe(`9,99 zł / ${unit}`);
      expect(finePrint(p)).toContain(`9,99 zł ${every}, dopóki nie anulujesz`);
      expect(ctaLabel(p)).toBe("Kup · 9,99 zł");
    }
    expect(finePrint(plan("monthly"))).not.toMatch(/rok/);
  });

  it("free trial, one-time purchase and an unknown package", () => {
    const trial = plan("yearly", 7);
    expect(planNote(trial)).toBe("7 dni za darmo, potem 9,99 zł / rok");
    expect(ctaLabel(trial)).toBe("Wypróbuj 7 dni za darmo");
    expect(finePrint(trial)).toMatch(/^Bez opłaty przez 7 dni\. Potem 9,99 zł co rok/);
    expect(planTitle(plan("lifetime"))).toBe("Na zawsze");
    expect(planNote(plan("lifetime"))).toBe("Jednorazowo 9,99 zł");
    expect(ctaLabel(plan("lifetime"))).toBe("Kup na zawsze · 9,99 zł");
    expect(finePrint(plan("lifetime"))).toBe("Płatność jednorazowa, bez odnowień.");
    expect(planTitle(plan("other"))).toBe("Oczko Pro");
    expect(finePrint(plan("other"))).not.toMatch(/rok|miesi/);
  });

  it("picks the plan with a free trial, else the offering's first", () => {
    expect(defaultPlan([plan("lifetime"), plan("monthly"), plan("yearly", 3)])?.kind).toBe("yearly");
    expect(defaultPlan([plan("monthly"), plan("lifetime")])?.kind).toBe("monthly");
    expect(defaultPlan([])).toBeUndefined();
  });
});

describe("offering", () => {
  const pkgs = (id: string) => ({ identifier: id, availablePackages: [{ identifier: `${id}-pkg` }] });
  const all = { all: { default: pkgs("default"), promo: pkgs("promo") }, current: pkgs("default") } as never;

  it("is the named one, else RevenueCat's current one", () => {
    expect(pickOffering(all, "promo").map((p) => p.identifier)).toEqual(["promo-pkg"]);
    expect(pickOffering(all, "").map((p) => p.identifier)).toEqual(["default-pkg"]);
    expect(pickOffering(all, "gone").map((p) => p.identifier)).toEqual(["default-pkg"]);
    expect(pickOffering({ all: {}, current: null } as never, "")).toEqual([]);
  });
});
