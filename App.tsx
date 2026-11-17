// App root: the main tabs (Graj · Profil · Zasady), the table and the screens
// opened from them. Navigation is a plain `Screen` state (no library);
// Android "back" is handled here.
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DEFAULT_RULES } from "./src/engine/rules";
import type { Pace } from "./src/game/pace";
import { freshSeed, makeSetup } from "./src/game/setup";
import { useGame, type GameSource, type UseGameOptions } from "./src/game/useGame";
import { HomeScreen, type ResumeInfo } from "./src/home/HomeScreen";
import { SoonScreen } from "./src/home/SoonScreen";
import { TabBar, type Tab } from "./src/home/TabBar";
import { deviceKV, type KV } from "./src/storage/kv";
import { clearSavedGame, isResumable, loadSavedGame } from "./src/storage/save";
import { TableScreen } from "./src/table/TableScreen";
import type { SavedGame } from "./src/game/GameController";
import { personaById } from "./src/ai/personas";
import { DialogProvider } from "./src/ui/Dialog";
import { FONT_SOURCES } from "./src/ui/fonts";
import { P } from "./src/ui/palette";
import { initSounds } from "./src/ui/sound";

// Keep the native splash screen up until the font and stored data are ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

export type Screen =
  | { name: "home"; tab: Tab }
  | { name: "game"; source: GameSource; key: number }
  /** A part still being built, opened from a tab (back returns to it). */
  | { name: "soon"; title: string; from: Tab };

export interface AppProps {
  kv?: KV;
  pace?: Pace;
  /** Tests: bots' decisions and pauses. */
  decide?: UseGameOptions["decide"];
  sleep?: UseGameOptions["sleep"];
}

export default function App(props: AppProps) {
  return (
    <SafeAreaProvider style={{ backgroundColor: P.bg }}>
      <StatusBar style="light" />
      <DialogProvider>
        <Root {...props} kv={props.kv ?? deviceKV} />
      </DialogProvider>
    </SafeAreaProvider>
  );
}

function resumeInfo(saved: SavedGame): ResumeInfo {
  const m = saved.match;
  const mode = saved.setup.rules.mode === "bank" ? "Z bankierem" : "Rodzinne";
  const target = saved.setup.mode === "single" ? "jedna runda" : `do ${saved.setup.rules.target} pkt`;
  return {
    title: `Runda ${m.roundNo}`,
    line: `${mode} · ${target} · ${saved.setup.seats.map((s) => s.name).join(", ")}`,
    seats: saved.setup.seats.map((s, i) => ({
      name: s.name,
      color: s.kind === "bot" ? personaById(s.persona)?.color ?? P.muted : P.accent,
      score: m.scores[i],
    })),
  };
}

function GameScreen({ source, opts, onExit, onNewGame, onRules }: { source: GameSource; opts: UseGameOptions; onExit: () => void; onNewGame: () => void; onRules: () => void }) {
  const { game } = useGame(source, opts);
  return (
    <TableScreen
      game={game}
      kv={opts.kv}
      onExit={onExit}
      onNewGame={onNewGame}
      onRules={onRules}
      onGiveUp={() => void clearSavedGame(opts.kv)}
    />
  );
}

function Root({ kv, pace, decide, sleep }: AppProps & { kv: KV }) {
  const [screen, setScreen] = useState<Screen>({ name: "home", tab: "play" });
  const [saved, setSaved] = useState<SavedGame | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fontsLoaded, fontError] = useFonts(FONT_SOURCES);
  // A missing font must not block the app: it falls back to the system font.
  const ready = loaded && (fontsLoaded || !!fontError);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const reload = useCallback(
    () =>
      loadSavedGame(kv).then((s) => {
        setSaved(isResumable(s) ? s : null);
        setLoaded(true);
      }),
    [kv]
  );

  useEffect(() => {
    let alive = true;
    loadSavedGame(kv).then((s) => {
      if (!alive) return;
      setSaved(isResumable(s) ? s : null);
      setLoaded(true);
    });
    void initSounds();
    return () => {
      alive = false;
    };
  }, [kv]);

  const home = useCallback(
    (tab: Tab = "play") => {
      setScreen({ name: "home", tab });
      // The table saves on every move; storage reads wait for queued writes.
      setTimeout(() => void reload(), 0);
    },
    [reload]
  );

  const back = useCallback((): boolean => {
    if (screen.name === "soon") {
      home(screen.from);
      return true;
    }
    if (screen.name === "game") {
      home();
      return true;
    }
    if (screen.tab !== "play") {
      setScreen({ name: "home", tab: "play" });
      return true;
    }
    return false; // the lobby: leave the app
  }, [screen, home]);

  // Android back: screens go back to where they were opened from, other tabs
  // go to "Graj", the lobby leaves the app. Open bottom sheets handle back first.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", back);
    return () => sub.remove();
  }, [back]);

  const startNew = () => {
    const setup = makeSetup(DEFAULT_RULES, ["ola", "hela", "marek"], "match", freshSeed());
    setSaved(null);
    setScreen({ name: "game", source: { setup }, key: Date.now() });
  };

  if (!ready) return <View style={{ flex: 1, backgroundColor: P.bg }} />;

  if (screen.name === "soon") return <SoonScreen title={screen.title} onBack={back} />;

  if (screen.name === "game")
    return (
      <GameScreen
        key={screen.key}
        source={screen.source}
        opts={{ kv, pace, decide, sleep }}
        onExit={() => home()}
        onNewGame={startNew}
        onRules={() => setScreen({ name: "soon", title: "Zasady", from: "play" })}
      />
    );

  const tab = screen.tab;
  const open = (title: string) => setScreen({ name: "soon", title, from: tab });
  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <View style={{ flex: 1 }}>
        {tab === "profile" ? (
          <SoonScreen title="Profil" />
        ) : tab === "rules" ? (
          <SoonScreen title="Zasady" />
        ) : (
          <HomeScreen
            resume={saved ? resumeInfo(saved) : null}
            onResume={() => saved && setScreen({ name: "game", source: { saved }, key: Date.now() })}
            onNewGame={startNew}
            onFriends={() => open("Ze znajomymi")}
            onTraining={() => open("Trening")}
            onHouseRules={() => open("Jak grasz u siebie?")}
            onHistory={() => open("Historia")}
            onSettings={() => open("Ustawienia")}
          />
        )}
      </View>
      <TabBar tab={tab} onChange={(t) => setScreen({ name: "home", tab: t })} />
    </View>
  );
}
