// The whole app in every language other than Polish: the lobby, its tabs, a
// new game played to its end and the settings — nothing on screen (texts and
// screen-reader labels) may be Polish. Catches a module called without the
// dictionary in use (its default is Polish).
import { Animated, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant, loop: instant, parallel: instant });

jest.setTimeout(120000);

/* eslint-disable import/first */
import App from "../../App";
import { threshold } from "../ai/policies";
import { INSTANT } from "../game/pace";
import { DICTIONARIES, LANGS, type Lang } from "../i18n";
import { memoryKV } from "../storage/kv";
import { ONBOARDING_KEY } from "../storage/onboarding";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "../storage/settings";
/* eslint-enable import/first */

/** Letters only Polish has among the app's languages ("ć" is also BCMS). */
const POLISH = /[ąęłńśźżĄĘŁŃŚŹŻ]/;

/** Every fixed text of a dictionary. */
const fixedTexts = (x: unknown): string[] => (typeof x === "string" ? [x] : typeof x === "object" && x !== null ? Object.values(x).flatMap(fixedTexts) : []);

/** Everything a person sees or hears: texts and accessibility labels / hints. */
function shown(r: ReactTestRenderer): string[] {
  const texts = r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c): c is string => typeof c === "string");
  const labels = r.root.findAll((n) => typeof n.props.accessibilityLabel === "string" || typeof n.props.accessibilityHint === "string");
  return [...texts, ...labels.flatMap((n) => [n.props.accessibilityLabel, n.props.accessibilityHint].filter((x): x is string => typeof x === "string"))];
}

const settle = () =>
  act(async () => {
    for (let i = 0; i < 30; i++) await new Promise((res) => setTimeout(res, 0));
  });

const button = (r: ReactTestRenderer, label: string) =>
  r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function" && !n.props.disabled)[0];

describe.each(LANGS.filter((l) => l !== "pl").map((l) => [l]))("the app in %s", (lang) => {
  const str = DICTIONARIES[lang as Lang];
  const seen: string[] = [];
  // Polish words without Polish letters ("Graj", "Rodzinne") that this language does not share.
  const own = new Set(fixedTexts(str));
  const polishOnly = new Set(fixedTexts(DICTIONARIES.pl).filter((t) => t.length >= 4 && !own.has(t)));
  let r: ReactTestRenderer;

  const look = () => seen.push(...shown(r));
  async function press(label: string) {
    const b = button(r, label);
    if (!b) throw new Error(`no button "${label}" in: ${shown(r).slice(0, 40).join(" | ")}`);
    await act(async () => {
      b.props.onPress();
    });
    await settle();
    look();
  }

  beforeAll(async () => {
    const kv = memoryKV({
      [ONBOARDING_KEY]: JSON.stringify({ v: 1, done: true }),
      [SETTINGS_KEY]: JSON.stringify({ ...DEFAULT_SETTINGS, lang, trainer: true }),
    });
    await act(async () => {
      r = create(<App kv={kv} pace={INSTANT} sleep={() => Promise.resolve()} decide={async (_s, v, rng) => threshold(17)(v, rng)} />);
    });
    await settle();
    look();
  });

  afterAll(() => act(() => r.unmount()));

  it("shows the lobby in the language", () => {
    expect(shown(r)).toContain(str.home.newGame);
  });

  it("plays a whole match", async () => {
    await press(str.home.newGame);
    await press(str.newgame.play);
    for (let i = 0; i < 400 && !button(r, str.table.matchEnd.rematch); i++) {
      if (button(r, str.table.hintOkLabel)) await press(str.table.hintOkLabel);
      else if (button(r, str.table.roundEnd.next)) await press(str.table.roundEnd.next);
      else if (button(r, str.table.actions.stand)) await press(str.table.actions.stand);
      else if (button(r, str.table.actions.skip)) await press(str.table.actions.skip);
      else {
        await settle();
        look();
      }
    }
    expect(button(r, str.table.matchEnd.rematch)).toBeDefined();
    await press(str.table.matchEnd.lobby);
  });

  /** Presses the first button whose label passes `test`. */
  async function pressWhere(test: (label: string) => boolean, what: string) {
    const b = r.root.findAll((n) => typeof n.props.accessibilityLabel === "string" && test(n.props.accessibilityLabel) && typeof n.props.onPress === "function")[0];
    if (!b) throw new Error(`no button for ${what} in: ${shown(r).slice(0, 40).join(" | ")}`);
    await act(async () => {
      b.props.onPress();
    });
    await settle();
    look();
  }
  const back = () => press(str.common.back);

  it("shows the tabs and the settings", async () => {
    await press(str.home.tabs.profile);
    await press(str.home.tabs.rules);
    await press(str.home.tabs.play);
    await press(str.home.settings);
    await pressWhere((l) => l === str.common.close, "close");
  });

  it("shows the history and a replay", async () => {
    await pressWhere((l) => l.startsWith(str.home.history), "history");
    await pressWhere((l) => l.includes(str.history.list.family) || l.includes(str.history.list.bank), "a record");
    await back();
    await back();
  });

  it("shows the house rules", async () => {
    await pressWhere((l) => l.startsWith(str.home.houseRules), "house rules");
    await back();
  });

  it("shows the Wi‑Fi screens", async () => {
    await press(str.home.friendsA11y);
    await press(str.lan.menu.join);
    await back();
    await back();
  });

  it("shows the looks and Oczko Pro from the settings", async () => {
    // (No store in tests: the promo-code row is not offered.)
    for (const row of [str.app.extra.looks, str.app.extra.pro]) {
      await press(str.home.settings);
      await pressWhere((l) => l.startsWith(row), row);
      const out = r.root.findAll((n) => (n.props.accessibilityLabel === str.common.back || n.props.accessibilityLabel === str.common.close) && typeof n.props.onPress === "function");
      await act(async () => out[out.length - 1]?.props.onPress());
      await settle();
    }
  });

  it("shows the welcome and the tutorial on a fresh install", async () => {
    let fresh!: ReactTestRenderer;
    await act(async () => {
      fresh = create(<App kv={memoryKV({ [SETTINGS_KEY]: JSON.stringify({ ...DEFAULT_SETTINGS, lang }) })} pace={INSTANT} sleep={() => Promise.resolve()} decide={async (_s, v, rng) => threshold(17)(v, rng)} />);
    });
    await settle();
    seen.push(...shown(fresh));
    expect(shown(fresh)).toContain(str.onboarding.welcome.title);
    const tutorial = button(fresh, str.onboarding.welcome.tutorial);
    expect(tutorial).toBeDefined();
    await act(async () => tutorial.props.onPress());
    await settle();
    seen.push(...shown(fresh));
    act(() => fresh.unmount());
  });

  it("nothing seen is Polish", () => {
    expect([...new Set(seen.filter((t) => POLISH.test(t) || polishOnly.has(t)))]).toEqual([]);
  });
});

describe("rule sets", () => {
  it("a fresh install in Czechia starts with Oko bere", async () => {
    const spy = jest.spyOn(jest.requireMock("expo-localization") as { getLocales: () => unknown[] }, "getLocales").mockReturnValue([{ languageCode: "cs", regionCode: "CZ" }]);
    const cs = DICTIONARIES.cs;
    const kv = memoryKV();
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<App kv={kv} pace={INSTANT} sleep={() => Promise.resolve()} />);
    });
    await settle();
    expect(shown(r)).toContain(cs.onboarding.welcome.title);
    const selected = r.root.findAll((n) => n.props.accessibilityState?.checked && typeof n.props.onPress === "function").map((n) => n.props.accessibilityLabel as string);
    expect(selected.some((l) => l.startsWith(cs.rules.editor.presets.okoBere.name))).toBe(true);
    await act(async () => button(r, cs.onboarding.welcome.done).props.onPress());
    await settle();
    const rules = JSON.parse((await kv.get("oczko.rules.v1"))!);
    expect(rules).toMatchObject({ deck: 32, persian: "is21", mode: "bank" });
    // The first new game starts in the set's mode.
    expect(JSON.parse((await kv.get("oczko.newgame.v1"))!).mode).toBe("bank");
    act(() => r.unmount());
    spy.mockRestore();
  });
});

describe("rule sets: Hungary", () => {
  it("a fresh install in Hungary starts with Huszonegyes (not 17 und 4, which has the same cards)", async () => {
    const spy = jest.spyOn(jest.requireMock("expo-localization") as { getLocales: () => unknown[] }, "getLocales").mockReturnValue([{ languageCode: "hu", regionCode: "HU" }]);
    const hu = DICTIONARIES.hu;
    const kv = memoryKV();
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<App kv={kv} pace={INSTANT} sleep={() => Promise.resolve()} />);
    });
    await settle();
    expect(shown(r)).toContain(hu.onboarding.welcome.title);
    const selected = r.root.findAll((n) => n.props.accessibilityState?.checked && typeof n.props.onPress === "function").map((n) => n.props.accessibilityLabel as string);
    expect(selected.some((l) => l.startsWith(hu.rules.editor.presets.huszonegyes.name))).toBe(true);
    expect(selected.some((l) => l.startsWith(hu.rules.editor.presets.siebzehnUndVier.name))).toBe(false);
    await act(async () => button(r, hu.onboarding.welcome.done).props.onPress());
    await settle();
    expect(JSON.parse((await kv.get("oczko.rules.v1"))!)).toMatchObject({ deck: 32, persian: "wins", mode: "bank", bankTie: "bankWins" });
    act(() => r.unmount());
    spy.mockRestore();
  });
});

describe("changing the language", () => {
  const de = DICTIONARIES.de;
  const pl = DICTIONARIES.pl;

  it("from the settings: at once, and remembered", async () => {
    const kv = memoryKV({ [ONBOARDING_KEY]: JSON.stringify({ v: 1, done: true }) });
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<App kv={kv} pace={INSTANT} sleep={() => Promise.resolve()} />);
    });
    await settle();
    const press = async (label: string) => {
      const b = button(r, label);
      if (!b) throw new Error(`no button "${label}"`);
      await act(async () => b.props.onPress());
      await settle();
    };
    expect(shown(r)).toContain(pl.home.newGame);
    await press(pl.home.settings);
    await press(pl.home.settingsSheet.language);
    await press("Deutsch");
    expect(shown(r)).toContain(de.home.newGame);
    expect(shown(r)).not.toContain(pl.home.newGame);
    expect(JSON.parse((await kv.get(SETTINGS_KEY))!).lang).toBe("de");
    act(() => r.unmount());
  });

  it("follows the phone's language on \"automatic\"", async () => {
    const spy = jest.spyOn(jest.requireMock("expo-localization") as { getLocales: () => unknown[] }, "getLocales").mockReturnValue([{ languageCode: "de" }]);
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<App kv={memoryKV({ [ONBOARDING_KEY]: JSON.stringify({ v: 1, done: true }) })} pace={INSTANT} sleep={() => Promise.resolve()} />);
    });
    await settle();
    expect(shown(r)).toContain(de.home.newGame);
    act(() => r.unmount());
    spy.mockRestore();
  });
});
