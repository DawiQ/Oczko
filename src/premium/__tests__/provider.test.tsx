import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { AppState, Text } from "react-native";

import { memoryKV } from "../../storage/kv";
import type { AdsApi } from "../ads";
import { PremiumProvider, usePremium, type Premium } from "../PremiumProvider";
import type { StoreApi } from "../store";
import { FREE_HINTS, AD_BONUS } from "../wallet";

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

function fakeStore(pro = false): StoreApi & { set(p: boolean): void; redeemed: (string | null)[] } {
  let listener: ((p: boolean) => void) | null = null;
  let active = pro;
  const redeemed: (string | null)[] = [];
  return {
    available: true,
    codeFlow: "inApp",
    redeemed,
    isPro: async () => active,
    sync: async () => ({ active, expires: active ? new Date(2027, 1, 16).getTime() : null, renews: false }),
    redeem: async (code) => {
      redeemed.push(code);
      return true;
    },
    plans: async () => [
      { id: "$rc_annual", kind: "yearly", price: "19,99 zł", trialDays: 7 },
      { id: "$rc_lifetime", kind: "lifetime", price: "39,99 zł", trialDays: null },
    ],
    purchase: async () => {
      active = true;
      return "ok";
    },
    restore: async () => active,
    manage: async () => {},
    onChange: (fn) => {
      listener = fn;
      return () => (listener = null);
    },
    set(p) {
      active = p;
      listener?.(p);
    },
  };
}

const texts = (r: ReactTestRenderer) =>
  r.root
    .findAll((n) => (n.type as unknown) === "Text")
    .map((n) => (n.children as unknown[]).join(""))
    .join(" | ");
const byId = (r: ReactTestRenderer, id: string) => r.root.findAll((n) => n.props.testID === id)[0];

function quietStore(): StoreApi & { set(p: boolean): void; redeemed: (string | null)[] } {
  const st = fakeStore();
  return {
    ...st,
    // the store's own notice does not come: only a sync shows the code
    onChange: () => () => {},
    set: (p) => {
      st.set(p);
    },
  };
}

const ads = (ok: boolean): AdsApi => ({ available: true, showRewarded: async () => ok, privacyOptions: async () => false });

async function mount(store: StoreApi, ad: AdsApi) {
  const kv = memoryKV();
  let premium!: Premium;
  const Probe = () => {
    premium = usePremium();
    return <Text>{premium.pro ? "pro" : "free"}</Text>;
  };
  let r!: ReactTestRenderer;
  act(() => {
    r = create(
      <PremiumProvider kv={kv} store={store} ads={ad}>
        <Probe />
      </PremiumProvider>
    );
  });
  await flush();
  return { r, get: () => premium, kv };
}

describe("PremiumProvider", () => {
  it("counts free hints, and an ad adds more", async () => {
    const { get } = await mount(fakeStore(), ads(true));
    expect(get().pro).toBe(false);
    for (let i = 0; i < FREE_HINTS; i++) act(() => void expect(get().spend("hint")).toBe(true));
    act(() => void expect(get().spend("hint")).toBe(false));
    await act(async () => void (await get().watchAd({ kind: "hints" })));
    expect(get().hintsLeft).toBe(AD_BONUS);
  });

  it("does not grant a reward for an ad left before the end", async () => {
    const { get } = await mount(fakeStore(), ads(false));
    await act(async () => void (await get().watchAd({ kind: "analysis" })));
    expect(get().analysesLeft).toBe(1);
  });

  it("knows Pro from the store, follows its changes and offers no ads to Pro", async () => {
    const store = fakeStore(true);
    const { get } = await mount(store, ads(true));
    expect(get().pro).toBe(true);
    expect(get().adsAvailable).toBe(false);
    expect(get().hintsLeft).toBe(Infinity);
    act(() => store.set(false));
    expect(get().pro).toBe(false);
  });

  it("opens the Oczko Pro screen with the store's plans and buys", async () => {
    const { r, get } = await mount(fakeStore(), ads(true));
    act(() => get().showPaywall("hints"));
    await flush();
    const text = r.root.findAll((n) => (n.type as unknown) === "Text").map((n) => (n.children as unknown[]).join("")).join(" | ");
    expect(text).toContain("Trener bez limitu");
    expect(text).toContain("7 dni za darmo, potem 19,99 zł / rok");
    expect(text).toContain("Wypróbuj 7 dni za darmo");
    await act(async () => void (await get().purchase("$rc_annual")));
    expect(get().pro).toBe(true);
  });

  it("redeems a promo code: Play opens with the code, the sync turns Pro on", async () => {
    const store = quietStore();
    const { r, get } = await mount(store, ads(true));
    act(() => get().showRedeem());
    await flush();
    expect(texts(r)).toContain("Masz kod?");
    expect(byId(r, "redeem-go").props.disabled).toBe(true);
    act(() => byId(r, "redeem-code").props.onChangeText("abcd-efgh 12"));
    await act(async () => void (await byId(r, "redeem-go").props.onPress()));
    expect(store.redeemed).toEqual(["ABCDEFGH12"]);
    expect(texts(r)).toContain("Dokończ w Google Play");
    await act(async () => void (await byId(r, "redeem-check").props.onPress()));
    expect(texts(r)).toContain("Jeszcze nie widać Oczko Pro");
    expect(get().pro).toBe(false);
    store.set(true);
    await act(async () => void (await byId(r, "redeem-retry").props.onPress()));
    expect(texts(r)).toContain("Kod przyjęty!");
    expect(texts(r)).toContain("Ważne do 16 lutego 2027.");
    expect(get().pro).toBe(true);
    act(() => byId(r, "redeem-done").props.onPress());
    expect(texts(r)).not.toContain("Kod przyjęty!");
  });

  it("checks by itself when the app comes back from the store", async () => {
    const handlers: ((s: string) => void)[] = [];
    const spy = jest.spyOn(AppState, "addEventListener").mockImplementation((_t, h) => {
      handlers.push(h as (s: string) => void);
      return { remove() {} } as never;
    });
    const store = quietStore();
    const { r, get } = await mount(store, ads(true));
    act(() => get().showRedeem());
    act(() => byId(r, "redeem-code").props.onChangeText("PANPRO2026"));
    await act(async () => void (await byId(r, "redeem-go").props.onPress()));
    store.set(true);
    await act(async () => handlers.forEach((h) => h("active")));
    await flush();
    expect(texts(r)).toContain("Kod przyjęty!");
    spy.mockRestore();
  });

  it("checks once when the store's notice turns Pro on, and not again after a failure", async () => {
    const store = fakeStore();
    let calls = 0;
    store.sync = async () => {
      calls++;
      throw new Error("offline");
    };
    const { r, get } = await mount(store, ads(true));
    act(() => get().showRedeem());
    act(() => byId(r, "redeem-code").props.onChangeText("PANPRO2026"));
    await act(async () => void (await byId(r, "redeem-go").props.onPress()));
    await act(async () => void (await byId(r, "redeem-check").props.onPress()));
    await flush();
    expect(texts(r)).toContain("Brak połączenia");
    expect(calls).toBe(1);
    act(() => store.set(true));
    await flush();
    await flush();
    expect(calls).toBe(2);
    expect(texts(r)).toContain("Brak połączenia");
  });

  it("is unlimited without a provider", () => {
    let premium!: Premium;
    const Probe = () => {
      premium = usePremium();
      return null;
    };
    act(() => void create(<Probe />));
    expect(premium.pro).toBe(true);
    expect(premium.spend("hint")).toBe(true);
  });
});
