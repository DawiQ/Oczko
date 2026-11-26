// The rules screen shows the fonts' licences (SIL OFL asks for them with
// every copy of the fonts).
import { Animated, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { withPreset } from "../../engine/presets";
import { DEFAULT_RULES } from "../../engine/rules";
import { pl } from "../../i18n";
import { RulesScreen } from "../RulesScreen";

const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant });

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c) => typeof c === "string")
    .join(" ");

describe("RulesScreen", () => {
  it("shows the fonts' licences", () => {
    let r!: ReactTestRenderer;
    act(() => {
      r = create(<RulesScreen rules={DEFAULT_RULES} onTutorial={() => {}} />);
    });
    expect(textOf(r)).not.toContain("SIL Open Font License");
    const link = r.root.findAll((n) => n.props.accessibilityLabel === pl.rules.screen.licenses && typeof n.props.onPress === "function")[0];
    act(() => link.props.onPress());
    const t = textOf(r);
    expect(t).toContain("Fraunces");
    expect(t).toContain("Literata");
    expect(t).toContain("SIL Open Font License, Version 1.1");
    act(() => r.unmount());
  });

  /** The titles of the example hands. */
  const exampleTitles = (rules: typeof DEFAULT_RULES) => {
    let r!: ReactTestRenderer;
    act(() => {
      r = create(<RulesScreen rules={rules} onTutorial={() => {}} />);
    });
    const labels = r.root.findAll((n) => typeof n.props.accessibilityLabel === "string" && n.props.accessible === true).map((n) => n.props.accessibilityLabel as string);
    act(() => r.unmount());
    return labels;
  };

  it("shows Pontoon's hands with the Pontoon set, and a 21 that is no pontoon", () => {
    const t = pl.rules.screen;
    const pontoon = exampleTitles(withPreset(DEFAULT_RULES, "pontoon"));
    expect(pontoon).toContain(t.exampleA11y(pl.table.specials.pontoon, pl.rules.editor.pontoonSub));
    expect(pontoon).toContain(t.exampleA11y(pl.table.specials.fiveCard, pl.rules.editor.fiveCardTrickSub));
    expect(pontoon).toContain(t.exampleA11y(t.examples.oczko.title, t.examples.oczko.text));
    const oczko = exampleTitles(DEFAULT_RULES);
    expect(oczko.some((l) => l.startsWith(pl.table.specials.pontoon))).toBe(false);
    expect(oczko).toContain(t.exampleA11y(t.examples.persian.title, t.examples.persian.text));
  });
});
