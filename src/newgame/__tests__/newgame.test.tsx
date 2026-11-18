import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { Text } from "react-native";

import { DEFAULT_RULES, PRESETS } from "../../engine/rules";
import { DEFAULT_CHOICES } from "../../storage/newGame";
import { botsFrom, counts, maxSeats, NewGameScreen } from "../NewGameScreen";
import { facesPreset, preview, summaryLines, withFaces } from "../rulesText";

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c) => typeof c === "string")
    .join(" | ");
const button = (r: ReactTestRenderer, label: string) =>
  r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function")[0];

describe("rules in words", () => {
  it("recognises the face presets", () => {
    expect(facesPreset(DEFAULT_RULES)).toBe("234");
    expect(facesPreset(withFaces(DEFAULT_RULES, 3, 4, 5))).toBe("345");
    expect(facesPreset(withFaces(DEFAULT_RULES, 2, 2, 2))).toBe("custom");
    expect(withFaces(DEFAULT_RULES, 3, 4, 5).values[10]).toBe(10);
  });

  it("summarises and previews neutrally", () => {
    expect(summaryLines(DEFAULT_RULES)).toEqual(["Rodzinne · W 2, D 3, K 4 · 52 karty", "Perskie oczko · As za 11"]);
    expect(summaryLines({ ...PRESETS.bank, persian: "off", ace: "oneOrEleven", deck: 24 })).toEqual([
      "Z bankierem · W 2, D 3, K 4 · 24 karty",
      "Bez perskiego oczka · As za 1 lub 11",
    ]);
    for (const r of [DEFAULT_RULES, PRESETS.bank, { ...PRESETS.bank, bankTie: "nobody" as const }]) expect(preview(r)).not.toMatch(/(łeś|łaś)/);
    expect(preview({ ...PRESETS.bank, bankTie: "nobody" })).not.toContain("remisy");
  });
});

describe("NewGameScreen", () => {
  it("counts characters and limits the table", () => {
    expect(botsFrom(counts(["ola", "hela", "ola"]))).toEqual(["hela", "ola", "ola"]);
    expect(maxSeats(DEFAULT_RULES, 6)).toBe(6);
    expect(maxSeats(PRESETS.small24, 6)).toBe(5);
    expect(maxSeats(DEFAULT_RULES, 8)).toBe(8);
  });

  async function render(props: Partial<React.ComponentProps<typeof NewGameScreen>> = {}) {
    const onStart = jest.fn();
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<NewGameScreen initial={DEFAULT_CHOICES} rules={DEFAULT_RULES} training={false} onStart={onStart} onBack={jest.fn()} {...props} />);
    });
    return { r, onStart };
  }

  it("starts with the chosen rivals, mode and length", async () => {
    const { r, onStart } = await render();
    expect(textOf(r)).toContain("Ty + 3 · max 5");
    await act(async () => button(r, "Hrabia przy stole: więcej").props.onPress());
    await act(async () => button(r, "Z bankierem").props.onPress());
    await act(async () => button(r, "15").props.onPress());
    await act(async () => button(r, "Graj").props.onPress());
    const [choices, rules] = onStart.mock.calls[0];
    expect(choices).toEqual({ v: 1, bots: ["hela", "ola", "marek", "hrabia"], mode: "bank", length: 15 });
    expect(rules).toMatchObject({ mode: "bank", target: 15 });
  });

  it("never seats more than the limit; one round is target 1", async () => {
    const { r, onStart } = await render();
    for (let i = 0; i < 5; i++) await act(async () => button(r, "Zosia przy stole: więcej").props.onPress());
    expect(textOf(r)).toContain("Ty + 5 · max 5");
    await act(async () => button(r, "1 runda").props.onPress());
    await act(async () => button(r, "Graj").props.onPress());
    expect(onStart.mock.calls[0][0].bots).toHaveLength(5);
    expect(onStart.mock.calls[0][1].target).toBe(1);
  });

  it("training hides the match length", async () => {
    const { r } = await render({ training: true });
    expect(textOf(r)).toContain("Trening");
    expect(textOf(r)).not.toContain("Do ilu punktów");
  });
});
