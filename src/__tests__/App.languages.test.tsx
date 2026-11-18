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

const POLISH = /[ąćęłńśźżĄĆĘŁŃŚŹŻ]/;

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

  it("shows the tabs and the settings", async () => {
    await press(str.home.tabs.profile);
    await press(str.home.tabs.rules);
    await press(str.home.tabs.play);
    await press(str.home.settings);
  });

  it("nothing seen is Polish", () => {
    expect([...new Set(seen.filter((t) => POLISH.test(t)))]).toEqual([]);
  });
});
