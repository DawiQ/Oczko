// The rules screen shows the fonts' licences (SIL OFL asks for them with
// every copy of the fonts).
import { Animated, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

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
});
