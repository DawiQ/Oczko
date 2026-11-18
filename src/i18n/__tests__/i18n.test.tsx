// The dictionaries and the choice of language.
import { Animated, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { DEFAULT_RULES } from "../../engine/rules";
import { SettingsSheet } from "../../home/SettingsSheet";
import { DEFAULT_SETTINGS } from "../../storage/settings";
import { DISPLAY, displayFont } from "../../ui/fonts";
import { DICTIONARIES, deviceLang, I18nProvider, isCyrillic, isLangSetting, LANG_NAMES, LANGS, pl, resolveLang, useStrings, type Lang, type Strings } from "..";

/** Every leaf of a dictionary: "path" → "string" | "function/arity" | "array/len" | "object". */
function shape(x: unknown, prefix = ""): Record<string, string> {
  if (typeof x === "string") return { [prefix]: "string" };
  if (typeof x === "function") return { [prefix]: `function/${x.length}` };
  if (Array.isArray(x)) return { [prefix]: `array/${x.length}` };
  if (typeof x === "object" && x !== null) return Object.assign({}, ...Object.entries(x).map(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k)));
  return { [prefix]: typeof x };
}

/** Every text of a dictionary (functions called with sample values). */
function texts(x: unknown): string[] {
  if (typeof x === "string") return [x];
  if (typeof x === "function") {
    const args = Array.from({ length: x.length }, (_, i) => (i % 2 === 0 ? 2 : "X"));
    try {
      const r = (x as (...a: unknown[]) => unknown)(...args);
      return typeof r === "string" ? [r] : [];
    } catch {
      return [];
    }
  }
  if (typeof x === "object" && x !== null) return Object.values(x).flatMap(texts);
  return [];
}

describe("dictionaries", () => {
  it("every language has a dictionary and a name", () => {
    expect(Object.keys(DICTIONARIES).sort()).toEqual([...LANGS].sort());
    expect(Object.keys(LANG_NAMES).sort()).toEqual([...LANGS].sort());
  });

  // Languages other than Polish (none yet: PLAN.md Etapy 13–15 add them).
  const others = LANGS.filter((l) => l !== "pl");

  it("other languages have exactly Polish's keys, arities and list lengths", () => {
    for (const lang of others) expect([lang, shape(DICTIONARIES[lang])]).toEqual([lang, shape(pl)]);
  });

  it("other languages have no Polish letters (nothing left untranslated)", () => {
    for (const lang of others) expect([lang, texts(DICTIONARIES[lang]).filter((t) => /[ąęłńśźżĄĘŁŃŚŹŻ]/.test(t))]).toEqual([lang, []]);
  });

  it("Polish texts are not empty", () => {
    expect(texts(pl).length).toBeGreaterThan(300);
    // Fixed texts (functions may return "" for an optional part).
    // A look's note may be empty (the card backs have none).
    const fixed = (x: unknown, key = ""): string[] =>
      typeof x === "string" ? (key === "note" ? [] : [x]) : typeof x === "object" && x !== null ? Object.entries(x).flatMap(([k, v]) => fixed(v, k)) : [];
    expect(fixed(pl).filter((t) => !t.trim())).toEqual([]);
  });
});

describe("language choice", () => {
  it("follows the phone when the app speaks its language", () => {
    expect(deviceLang([{ languageCode: "pl" }], ["pl", "en"])).toBe("pl");
    expect(deviceLang([{ languageCode: "de" }, { languageCode: "en" }], ["pl", "en", "de"])).toBe("de");
    expect(deviceLang([{ languageCode: "fr" }, { languageCode: "pl" }], ["pl", "en"])).toBe("pl");
  });

  it("serves Bosnian, Croatian, Serbian and Montenegrin phones with one Latin version", () => {
    for (const code of ["bs", "hr", "sr", "cnr"]) expect(deviceLang([{ languageCode: code }])).toBe("sh");
  });

  it("gives Cyrillic languages their own display font", () => {
    expect(isCyrillic("uk")).toBe(true);
    expect(isCyrillic("ru")).toBe(true);
    expect(LANGS.filter(isCyrillic)).toEqual(["uk", "ru"]);
    // (Font files are stubs in Jest; the choice is by script.)
    expect(Object.keys(displayFont(true))).toEqual([DISPLAY]);
    expect(Object.keys(displayFont(false))).toEqual([DISPLAY]);
  });

  it("falls back to English, or the first language without it", () => {
    expect(deviceLang([{ languageCode: "fr" }], ["pl", "en"])).toBe("en");
    expect(deviceLang([], ["pl"])).toBe("pl");
    expect(deviceLang([{ languageCode: null }], ["pl"])).toBe("pl");
  });

  it("a chosen language wins over the phone's", () => {
    expect(resolveLang("pl", [{ languageCode: "de" }])).toBe("pl");
    expect(resolveLang("auto", [{ languageCode: "pl" }])).toBe("pl");
    expect(isLangSetting("auto")).toBe(true);
    expect(isLangSetting("pl")).toBe(true);
    expect(isLangSetting("xx")).toBe(false);
  });
});

describe("provider", () => {
  function Probe() {
    return <Text>{useStrings().common.close}</Text>;
  }
  const textOf = (r: ReactTestRenderer) => r.root.findByType(Text).props.children;

  it("gives Polish without a provider, and the given dictionary inside one", () => {
    let r!: ReactTestRenderer;
    act(() => {
      r = create(<Probe />);
    });
    expect(textOf(r)).toBe("Zamknij");
    const other: Strings = { ...pl, common: { ...pl.common, close: "Close" } };
    act(() => {
      r.update(
        <I18nProvider lang="pl" strings={other}>
          <Probe />
        </I18nProvider>
      );
    });
    expect(textOf(r)).toBe("Close");
  });
});

describe("settings: language row", () => {
  // Animations finish at once (the sheet's flow is tested, not the motion).
  const instant = () =>
    ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
  Object.assign(Animated, { timing: instant, spring: instant });
  const render = (langs?: readonly Lang[]) => {
    const onChange = jest.fn();
    let r!: ReactTestRenderer;
    act(() => {
      r = create(<SettingsSheet settings={DEFAULT_SETTINGS} rules={DEFAULT_RULES} onChange={onChange} onHouseRules={() => {}} onResetTips={() => {}} onClose={() => {}} langs={langs} />);
    });
    const byLabel = (label: string) => r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function")[0];
    return { r, onChange, byLabel };
  };

  it("is hidden while the app speaks one language", () => {
    const { r, byLabel } = render(["pl"]);
    expect(byLabel("Język")).toBeUndefined();
    act(() => r.unmount());
  });

  it("offers the phone's language and every language", () => {
    const { r, onChange, byLabel } = render(["pl", "en" as Lang]);
    act(() => byLabel("Język").props.onPress());
    expect(byLabel("Automatycznie (Polski)")).toBeDefined();
    act(() => byLabel("Polski").props.onPress());
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, lang: "pl" });
    act(() => r.unmount());
  });
});
