// Smoke test of the whole app: the lobby with its tabs, a screen opened from
// it and back again.
import { Animated, BackHandler, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

// Animations finish at once (the flow is tested here, not the motion).
const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant });

// Android "back": the handlers App registers, newest first.
const backHandlers: (() => boolean)[] = [];
jest.spyOn(BackHandler, "addEventListener").mockImplementation((_e, h) => {
  backHandlers.unshift(h as () => boolean);
  return { remove: () => backHandlers.splice(backHandlers.indexOf(h as () => boolean), 1) };
});
const pressBack = (): boolean => {
  for (const h of [...backHandlers]) if (h()) return true;
  return false;
};

// eslint-disable-next-line import/first
import App from "../../App";

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat()
    .filter((c) => typeof c === "string")
    .join(" | ");

const press = (r: ReactTestRenderer, label: string) => {
  const b = r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function")[0];
  if (!b) throw new Error(`no button "${label}"`);
  act(() => b.props.onPress());
};

async function renderApp(): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(<App />);
  });
  return r;
}

describe("App", () => {
  it("starts in the lobby with the tab bar", async () => {
    const r = await renderApp();
    const t = textOf(r);
    expect(t).toContain("Oczko");
    expect(t).toContain("Nowa gra");
    expect(t).toContain("Ze znajomymi");
    expect(t).toContain("Trening");
    expect(t).toContain("Jak grasz u siebie");
    for (const tab of ["Graj", "Profil", "Zasady"]) expect(t).toContain(tab);
    const selected = r.root.findAll((n) => n.props.accessibilityRole === "tab" && n.props.accessibilityState?.selected);
    expect(selected[0]?.props.accessibilityLabel).toBe("Graj");
  });

  it("opens a screen from the lobby and comes back with the back button", async () => {
    const r = await renderApp();
    press(r, "Nowa gra");
    expect(textOf(r)).toContain("Wkrótce");
    expect(textOf(r)).not.toContain("Ze znajomymi");
    press(r, "Wróć");
    expect(textOf(r)).toContain("Ze znajomymi");
  });

  it("switches tabs; Android back goes to the screen's tab, then to Graj, then leaves", async () => {
    const r = await renderApp();
    press(r, "Zasady");
    expect(textOf(r)).toContain("Zasady");
    expect(textOf(r)).not.toContain("Nowa gra");

    press(r, "Graj");
    press(r, "Ustawienia");
    expect(textOf(r)).toContain("Ustawienia");
    act(() => void pressBack());
    expect(textOf(r)).toContain("Nowa gra");

    press(r, "Profil");
    expect(textOf(r)).toContain("Profil");
    let handled = false;
    act(() => {
      handled = pressBack();
    });
    expect(handled).toBe(true);
    expect(textOf(r)).toContain("Nowa gra");

    act(() => {
      handled = pressBack();
    });
    expect(handled).toBe(false); // the system closes the app
  });
});
