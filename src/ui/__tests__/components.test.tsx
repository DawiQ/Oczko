// Base components: Button3D, Dialog, BottomSheet, Header, cards, Portrait.
import { Animated, Pressable, Text } from "react-native";
import { act, create, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";

import { cardOf } from "../../engine/cards";
import { BottomSheet } from "../BottomSheet";
import { Button3D } from "../Button3D";
import { CardBack, CardFace, cardLabel, cardSpoken } from "../cards";
import { DialogProvider, useConfirm, type ConfirmOptions } from "../Dialog";
import { Header } from "../Header";
import { Portrait, splitCopy } from "../Portrait";

// Animations finish at once (the flow is tested here, not the motion).
const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant });

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => (n.props.children as unknown[] | string))
    .flat()
    .filter((c) => typeof c === "string")
    .join(" | ");

/** The outermost pressable element with this accessibility label. */
const byLabel = (r: ReactTestRenderer, label: string): ReactTestInstance => {
  const all = r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function");
  if (!all.length) throw new Error(`no button "${label}"`);
  return all[0];
};
const pressables = (r: ReactTestRenderer) => r.root.findAll((n) => typeof n.type !== "string" && typeof n.props.onPress === "function");

const render = (el: React.ReactElement) => {
  let r!: ReactTestRenderer;
  act(() => {
    r = create(el);
  });
  return r;
};

describe("Button3D", () => {
  it("presses and labels itself", () => {
    const onPress = jest.fn();
    const r = render(<Button3D label="Dobieram" onPress={onPress} />);
    const b = byLabel(r, "Dobieram");
    expect(b.props.accessibilityRole).toBe("button");
    act(() => b.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is disabled", () => {
    const r = render(<Button3D label="Starczy" disabled onPress={() => {}} />);
    const b = byLabel(r, "Starczy");
    expect(b.props.disabled).toBe(true);
    expect(b.props.accessibilityState).toEqual({ disabled: true });
  });

  it("keeps a 44 px touch target with the default height", () => {
    const r = render(<Button3D label="Graj" onPress={() => {}} />);
    const style = [byLabel(r, "Graj").props.style].flat(3).reduce((a, s) => ({ ...a, ...(s ?? {}) }), {});
    expect(style.height).toBeGreaterThanOrEqual(44);
  });
});

describe("Dialog", () => {
  function Asker({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (ok: boolean) => void }) {
    const confirm = useConfirm();
    return <Pressable accessibilityLabel="ask" onPress={() => void confirm(options).then(onAnswer)} />;
  }

  it.each([
    ["Poddaj", true],
    ["Anuluj", false],
  ])("resolves when '%s' is pressed", async (button, expected) => {
    const onAnswer = jest.fn();
    const r = render(
      <DialogProvider>
        <Asker options={{ title: "Poddać partię?", confirmText: "Poddaj", destructive: true }} onAnswer={onAnswer} />
      </DialogProvider>
    );
    act(() => byLabel(r, "ask").props.onPress());
    expect(textOf(r)).toContain("Poddać partię?");
    const btn = pressables(r).find((n) => textOf({ root: n } as ReactTestRenderer) === button)!;
    await act(async () => btn.props.onPress());
    expect(onAnswer).toHaveBeenCalledWith(expected);
    expect(textOf(r)).not.toContain("Poddać partię?");
  });

  it("throws outside the provider", () => {
    const err = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Asker options={{ title: "x", confirmText: "y" }} onAnswer={() => {}} />)).toThrow();
    err.mockRestore();
  });
});

describe("BottomSheet", () => {
  it("shows header, content and footer, and closes from the backdrop", () => {
    const onClose = jest.fn();
    const r = render(
      <BottomSheet snapPoints={[200, 400]} initialSnap={1} onClose={onClose} accessibilityLabel="Menu" header={<Text>Menu</Text>} footer={<Text>Stopka</Text>}>
        <Text>Zasady</Text>
      </BottomSheet>
    );
    const t = textOf(r);
    expect(t).toContain("Menu");
    expect(t).toContain("Zasady");
    expect(t).toContain("Stopka");
    act(() => byLabel(r, "Zamknij").props.onPress());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Header", () => {
  it("has a back button only with onBack", () => {
    const onBack = jest.fn();
    const r = render(<Header title="Nowa gra" onBack={onBack} />);
    act(() => byLabel(r, "Wróć").props.onPress());
    expect(onBack).toHaveBeenCalled();
    const r2 = render(<Header title="Profil" />);
    expect(pressables(r2)).toHaveLength(0);
  });
});

describe("cards", () => {
  const queenSpades = cardOf(12, 3);
  const tenHearts = cardOf(10, 0);

  it("labels cards for the eye and the screen reader", () => {
    expect(cardLabel(queenSpades)).toBe("D♠︎");
    expect(cardSpoken(queenSpades)).toBe("dama pik");
    expect(cardSpoken(tenHearts)).toBe("dziesiątka kier");
    expect(cardSpoken(cardOf(14, 1))).toBe("as karo");
    expect(cardSpoken(cardOf(2, 2))).toBe("dwójka trefl");
  });

  it("renders a face with its spoken name and a hidden back", () => {
    const r = render(
      <>
        <CardFace card={tenHearts} />
        <CardFace card={queenSpades} size="sm" />
        <CardBack />
      </>
    );
    const labels = r.root.findAll((n) => typeof n.type === "string" && n.props.accessibilityLabel).map((n) => n.props.accessibilityLabel);
    expect(labels).toEqual(expect.arrayContaining(["dziesiątka kier", "dama pik", "zakryta karta"]));
    expect(textOf(r)).toContain("10");
    expect(textOf(r)).not.toContain("Q");
  });
});

describe("Portrait", () => {
  it("splits copy numbers", () => {
    expect(splitCopy("Hrabia II")).toEqual({ base: "Hrabia", copy: "II" });
    expect(splitCopy("Hrabia")).toEqual({ base: "Hrabia", copy: "" });
    expect(splitCopy("Ola VIII")).toEqual({ base: "Ola", copy: "VIII" });
    expect(splitCopy("Pan Kowalski")).toEqual({ base: "Pan Kowalski", copy: "" });
  });

  it("draws the initial and the copy badge", () => {
    const r = render(<Portrait name="Hela III" size={48} color="#B9D86A" />);
    const t = textOf(r);
    expect(t).toContain("H");
    expect(t).toContain("III");
  });
});
