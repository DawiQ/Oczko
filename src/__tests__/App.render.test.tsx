// Smoke test of the whole app: the lobby with its tabs, a whole match at the
// table (bots decide at once), back to the lobby, resuming a saved game.
import { Animated, BackHandler, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

// Animations finish at once (the flow is tested here, not the motion).
const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant, loop: instant, parallel: instant });

// Android "back": the handlers the app registers, newest first.
const backHandlers: (() => boolean)[] = [];
jest.spyOn(BackHandler, "addEventListener").mockImplementation((_e, h) => {
  backHandlers.unshift(h as () => boolean);
  return { remove: () => backHandlers.splice(backHandlers.indexOf(h as () => boolean), 1) };
});
const pressBack = (): boolean => {
  for (const h of [...backHandlers]) if (h()) return true;
  return false;
};

/* eslint-disable import/first */
import App from "../../App";
import { threshold } from "../ai/policies";
import { INSTANT } from "../game/pace";
import { memoryKV, type KV } from "../storage/kv";
import { loadSavedGame } from "../storage/save";
import { loadStats } from "../storage/stats";
/* eslint-enable import/first */

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
  if (!b) throw new Error(`no button "${label}" in: ${textOf(r).slice(0, 400)}`);
  await act(async () => {
    b.props.onPress();
  });
  await settle();
}

async function renderApp(kv: KV = memoryKV()): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await act(async () => {
    r = create(<App kv={kv} pace={INSTANT} sleep={() => Promise.resolve()} decide={async (_s, v, rng) => threshold(17)(v, rng)} />);
  });
  await settle();
  return r;
}

/** Plays at the table until the match ends: stands at 15+, next round. */
async function playToEnd(r: ReactTestRenderer) {
  for (let i = 0; i < 400; i++) {
    if (button(r, "Rewanż")) return;
    if (button(r, "Następna runda")) await press(r, "Następna runda");
    else if (button(r, "Starczy")) {
      const m = /masz (\d+)/.exec(textOf(r));
      await press(r, m && Number(m[1]) < 15 && button(r, "Dobieram") ? "Dobieram" : "Starczy");
    } else if (button(r, "Pokaż wynik")) await press(r, "Pokaż wynik");
    else if (button(r, "Rozumiem")) await press(r, "Rozumiem");
    else await settle();
  }
  throw new Error(`the match did not end: ${textOf(r).slice(0, 300)}`);
}

describe("App", () => {
  it("starts in the lobby with the tab bar", async () => {
    const r = await renderApp();
    const t = textOf(r);
    for (const x of ["Oczko", "Nowa gra", "Ze znajomymi", "Trening", "Jak grasz u siebie", "Graj", "Profil", "Zasady"]) expect(t).toContain(x);
    expect(t).not.toContain("Wznów partię");
    const selected = r.root.findAll((n) => n.props.accessibilityRole === "tab" && n.props.accessibilityState?.selected);
    expect(selected[0]?.props.accessibilityLabel).toBe("Graj");
  });

  it("opens a screen from the lobby and comes back with the back button", async () => {
    const r = await renderApp();
    await press(r, "Ustawienia");
    expect(textOf(r)).toContain("Wkrótce");
    await press(r, "Wróć");
    expect(textOf(r)).toContain("Ze znajomymi");
  });

  it("switches tabs; Android back goes to the screen's tab, then to Graj, then leaves", async () => {
    const r = await renderApp();
    await press(r, "Zasady");
    expect(textOf(r)).not.toContain("Nowa gra");
    await press(r, "Graj");
    await press(r, "Ustawienia");
    await act(async () => void pressBack());
    await settle();
    expect(textOf(r)).toContain("Nowa gra");
    await press(r, "Profil");
    let handled = false;
    await act(async () => {
      handled = pressBack();
    });
    expect(handled).toBe(true);
    await act(async () => {
      handled = pressBack();
    });
    expect(handled).toBe(false); // the system closes the app
  });

  it("plays a whole match, then back to the lobby", async () => {
    const kv = memoryKV();
    const r = await renderApp(kv);
    await press(r, "Nowa gra");
    expect(textOf(r)).toContain("Runda 1");
    await playToEnd(r);
    expect(textOf(r)).toMatch(/Partia dla Ciebie!|Partię wygrywa/);
    const stats = await loadStats(kv);
    expect(stats.matches).toBe(1);
    expect(stats.rounds).toBeGreaterThan(0);
    expect(await loadSavedGame(kv)).toBeNull();
    await press(r, "Do lobby");
    expect(textOf(r)).toContain("Nowa gra");
    expect(textOf(r)).not.toContain("Wznów partię");
  });

  it("leaves a game and resumes it from the lobby", async () => {
    const kv = memoryKV();
    const r = await renderApp(kv);
    await press(r, "Nowa gra");
    if (button(r, "Rozumiem")) await press(r, "Rozumiem");
    await press(r, "Menu");
    await press(r, "Wyjdź do lobby");
    await settle();
    expect(textOf(r)).toContain("Wznów partię");
    await press(r, "Wznów");
    expect(textOf(r)).toContain("Runda");
    expect(button(r, "Menu")).toBeDefined();
  });
});
