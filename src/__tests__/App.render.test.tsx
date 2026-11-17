// Smoke test of the whole app: the lobby with its tabs, a whole match at the
// table (bots decide at once), back to the lobby, resuming a saved game.
import { Animated, BackHandler, Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

// Animations finish at once (the flow is tested here, not the motion).
const instant = () =>
  ({ start: (cb?: (r: { finished: boolean }) => void) => cb?.({ finished: true }), stop() {}, reset() {} }) as unknown as Animated.CompositeAnimation;
Object.assign(Animated, { timing: instant, spring: instant, loop: instant, parallel: instant });

// Whole matches through the UI: generous time when the suite runs in parallel.
jest.setTimeout(60000);

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
import { ONBOARDING_KEY } from "../storage/onboarding";
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

/** Storage of someone past the onboarding. */
const onboarded = () => memoryKV({ [ONBOARDING_KEY]: JSON.stringify({ v: 1, done: true }) });

async function renderApp(kv: KV = onboarded()): Promise<ReactTestRenderer> {
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
    else if (button(r, "Pokaż wynik")) await press(r, "Pokaż wynik");
    else if (button(r, "Starczy")) {
      const m = /masz (\d+)/.exec(textOf(r));
      await press(r, m && Number(m[1]) < 15 && button(r, "Dobieram") ? "Dobieram" : "Starczy");
    } else if (button(r, "Pokaż wynik")) await press(r, "Pokaż wynik");
    else if (button(r, "Rozumiem")) await press(r, "Rozumiem");
    else await settle();
  }
  throw new Error(`the match did not end: ${textOf(r).slice(0, 300)}`);
}

const freeStore = {
  available: true,
  codeFlow: "none" as const,
  isPro: async () => false,
  sync: async () => ({ active: false, expires: null, renews: false }),
  redeem: async () => false,
  plans: async () => [],
  purchase: async () => "error" as const,
  restore: async () => false,
  manage: async () => {},
  onChange: () => () => {},
};
const noAdsHere = { available: false, showRewarded: async () => false, privacyOptions: async () => false };

describe("Oczko Pro limits (a free player)", () => {
  it("one table of 7–8 a day, then the limit sheet", async () => {
    const kv = onboarded();
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<App kv={kv} store={freeStore} ads={noAdsHere} pace={INSTANT} sleep={() => Promise.resolve()} decide={async (_s, v, rng) => threshold(17)(v, rng)} />);
    });
    await settle();
    const seat7 = async (add: boolean) => {
      await press(r, "Nowa gra");
      if (add) for (let i = 0; i < 3; i++) await press(r, "Zosia przy stole: więcej");
      expect(textOf(r)).toContain("Ty + 6 · max 7");
      await press(r, "Graj");
    };
    await seat7(true);
    expect(textOf(r)).toContain("Runda 1");
    await press(r, "Menu");
    await press(r, "Wyjdź do lobby");
    await settle();
    await seat7(false); // the choices are remembered
    // Today's free big table is used: the limit sheet, no game started.
    expect(textOf(r)).toContain("Stół dla 7–8 osób");
    expect(textOf(r)).toContain("Rywale");
    act(() => r.unmount());
  });

  it("the trainer's daily hints run out", async () => {
    const kv = memoryKV({
      [ONBOARDING_KEY]: JSON.stringify({ v: 1, done: true }),
      "oczko.settings.v1": JSON.stringify({ v: 1, sound: true, haptics: true, pace: "normal", trainer: true }),
      "oczko.premium.v1": JSON.stringify({ v: 1, day: "2000-01-01", hintsUsed: 0, analysesUsed: 0, bigTablesUsed: 0, bonusHints: 0, bonusAnalyses: 0, bonusBigTables: 0, trials: {} }),
    });
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(<App kv={kv} store={freeStore} ads={noAdsHere} pace={INSTANT} sleep={() => Promise.resolve()} decide={async (_s, v, rng) => threshold(17)(v, rng)} />);
    });
    await settle();
    await press(r, "Nowa gra");
    await press(r, "Graj");
    let locked = false;
    for (let i = 0; i < 300 && !locked; i++) {
      if (button(r, "Rozumiem")) await press(r, "Rozumiem");
      if (textOf(r).includes("dzisiejsze podpowiedzi wykorzystane")) locked = true;
      else if (button(r, "Następna runda")) await press(r, "Następna runda");
      else if (button(r, "Dobieram")) await press(r, "Dobieram");
      else if (button(r, "Starczy")) await press(r, "Starczy");
      else await settle();
    }
    expect(locked).toBe(true);
    expect(JSON.parse((await kv.get("oczko.premium.v1"))!).hintsUsed).toBe(3);
    act(() => r.unmount());
  });
});

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
    await press(r, "Ze znajomymi przez Wi‑Fi");
    expect(textOf(r)).toContain("Załóż stół");
    await press(r, "Wróć");
    expect(textOf(r)).toContain("Ze znajomymi");
  });

  it("switches tabs; Android back goes to the screen's tab, then to Graj, then leaves", async () => {
    const r = await renderApp();
    await press(r, "Zasady");
    expect(textOf(r)).not.toContain("Nowa gra");
    await press(r, "Graj");
    await press(r, "Ze znajomymi przez Wi‑Fi");
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

  it("onboarding → new game → a whole match → lobby → resume", async () => {
    const kv = memoryKV();
    const r = await renderApp(kv);
    expect(textOf(r)).toContain("Jak grasz u siebie?");
    await press(r, "Gotowe");
    expect(textOf(r)).toContain("Nowa gra");
    await press(r, "Nowa gra");
    expect(textOf(r)).toContain("Rywale");
    await press(r, "Graj");
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
    // The match is in the history, with its replay.
    await press(r, "Historia. Rozegrane partie i powtórki");
    const row = r.root.findAll((n) => typeof n.props.accessibilityLabel === "string" && /^(Partia dla Ciebie|Wygrywa)/.test(n.props.accessibilityLabel) && typeof n.props.onPress === "function")[0];
    expect(row).toBeDefined();
    await act(async () => row.props.onPress());
    await settle();
    expect(textOf(r)).toContain("Runda 1 — rozdanie");
    await act(async () => void pressBack());
    await act(async () => void pressBack());
    await settle();
    // A new game, left in the middle and resumed.
    await press(r, "Nowa gra");
    await press(r, "Graj");
    if (button(r, "Rozumiem")) await press(r, "Rozumiem");
    await press(r, "Menu");
    await press(r, "Wyjdź do lobby");
    await settle();
    expect(textOf(r)).toContain("Wznów partię");
    await press(r, "Wznów");
    expect(textOf(r)).toContain("Runda");
    // The onboarding does not come back.
    const again = await renderApp(kv);
    expect(textOf(again)).not.toContain("Jak grasz u siebie?");
  });

  it("the tutorial: only the expected button works, then a real game", async () => {
    const r = await renderApp(memoryKV());
    await press(r, "Pokaż mi zasady na przykładzie");
    for (let i = 0; i < 20 && !button(r, "Zagraj partię"); i++) {
      const hit = button(r, "Dobieram");
      const stand = button(r, "Starczy");
      expect(!!hit && !!stand).toBe(false); // never both
      if (hit) await press(r, "Dobieram");
      else if (stand) await press(r, "Starczy");
      else await settle();
    }
    expect(textOf(r)).toContain("Tak się gra w Oczko!");
    await press(r, "Zagraj partię");
    expect(textOf(r)).toContain("Rywale");
  });

  it("the rules from the table's menu, then back to the same game", async () => {
    const kv = onboarded();
    const r = await renderApp(kv);
    await press(r, "Nowa gra");
    await press(r, "Graj");
    if (button(r, "Rozumiem")) await press(r, "Rozumiem");
    const before = JSON.parse((await kv.get("oczko.save.v1"))!).match.round.hands;
    await press(r, "Menu");
    await press(r, "Zasady");
    expect(textOf(r)).toContain("Wartości kart");
    await act(async () => void pressBack());
    await settle();
    expect(textOf(r)).toContain("Runda 1");
    expect(JSON.parse((await kv.get("oczko.save.v1"))!).match.round.hands).toEqual(before);
  });

  it("settings and house rules from the lobby", async () => {
    const kv = onboarded();
    const r = await renderApp(kv);
    await press(r, "Ustawienia");
    expect(textOf(r)).toContain("Tempo rywali");
    await press(r, "Jak grasz u siebie");
    await press(r, "Z bankierem, każdy gra z bankiem");
    await press(r, "Zapisz");
    expect(textOf(r)).toContain("Z bankierem · W 2, D 3, K 4");
    expect(JSON.parse((await kv.get("oczko.rules.v1"))!).mode).toBe("bank");
  });

  it("leaves a game and resumes it from the lobby", async () => {
    const kv = onboarded();
    const r = await renderApp(kv);
    await press(r, "Nowa gra");
    await press(r, "Graj");
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
