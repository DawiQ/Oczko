// The Wi‑Fi screens on an in-memory network: one phone hosts (a bot and a
// friend at the table), another joins by code; both reach the table.
import { Animated, Text, TextInput } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { threshold } from "../../ai/policies";
import { DEFAULT_RULES } from "../../engine/rules";
import { INSTANT } from "../../game/pace";
import { memoryKV } from "../../storage/kv";
import { DialogProvider } from "../../ui/Dialog";
import { LanScreen, type LanDeps } from "../LanScreen";
import { MemoryNet } from "../transport";

jest.setTimeout(60000);

const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant, loop: instant, parallel: instant });

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c) => typeof c === "string" || typeof c === "number")
    .join(" | ");
const button = (r: ReactTestRenderer, label: string) =>
  r.root.findAll((n) => n.props.accessibilityLabel === label && typeof n.props.onPress === "function" && !n.props.disabled)[0];
const settle = () =>
  act(async () => {
    for (let i = 0; i < 30; i++) await new Promise((res) => setTimeout(res, 0));
  });
async function press(r: ReactTestRenderer, label: string) {
  const b = button(r, label);
  if (!b) throw new Error(`no button "${label}" in: ${textOf(r).slice(0, 300)}`);
  await act(async () => {
    b.props.onPress();
  });
  await settle();
}

describe("Wi‑Fi screens", () => {
  it("host a table with a bot, a friend joins by code, both get to the table", async () => {
    const net = new MemoryNet();
    const deps: LanDeps = {
      server: () => net.server(),
      dial: net.dialer(),
      getIp: async () => "192.168.1.40",
      hostDeps: { sleep: () => Promise.resolve(), pace: INSTANT, decide: async (_s, v, r) => threshold(17)(v, r) },
    };
    const render = async () => {
      let r!: ReactTestRenderer;
      await act(async () => {
        r = create(
          <DialogProvider>
            <LanScreen kv={memoryKV()} rules={DEFAULT_RULES} pace={INSTANT} pro={false} onExit={jest.fn()} deps={deps} />
          </DialogProvider>
        );
      });
      await settle();
      return r;
    };
    const host = await render();
    await act(async () => host.root.findByType(TextInput).props.onChangeText("Ola"));
    await press(host, "Załóż stół");
    const code = /Kod stołu\s\|\s([0-9A-Z]{2} [0-9A-Z]{2})/.exec(textOf(host))?.[1];
    expect(code).toBeDefined();
    await press(host, "Dodaj miejsce");
    await press(host, "Posadź bota");
    expect(textOf(host)).toContain("Ola (Ty)");

    const guest = await render();
    await act(async () => guest.root.findByType(TextInput).props.onChangeText("Kuba"));
    await press(guest, "Dołącz do stołu");
    const input = guest.root.findAll((n) => n.type === TextInput && n.props.accessibilityLabel === "Kod stołu")[0];
    await act(async () => input.props.onChangeText(code));
    // A double tap joins once.
    const join = button(guest, "Dołącz");
    await act(async () => {
      join.props.onPress();
      join.props.onPress();
    });
    await settle();
    expect(textOf(guest)).toContain("Czekamy, aż gospodarz rozda karty.");
    expect(textOf(host).match(/Kuba/g)).toHaveLength(1);

    await press(host, "Rozdaj karty");
    await settle();
    expect(textOf(host)).toMatch(/Runda 1/);
    expect(textOf(guest)).toMatch(/Runda 1/);
    // The guest's table has no trainer and no "Pokaż wynik" for others' rounds.
    expect(textOf(guest)).not.toContain("Trener");
    act(() => {
      guest.unmount();
      host.unmount();
    });
    await settle();
  });
});
