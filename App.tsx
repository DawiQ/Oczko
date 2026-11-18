// App root: the onboarding, the main tabs (Graj · Profil · Zasady), new game,
// the table and the screens opened from them. Navigation is a plain `Screen`
// state (no library); Android "back" is handled here.
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { chunkedEvaluator } from "./src/ai/evaluate";
import { personaById } from "./src/ai/personas";
import { HistoryScreen } from "./src/history/HistoryScreen";
import type { HistoryRecord } from "./src/history/record";
import { ReplayScreen } from "./src/history/ReplayScreen";
import { FREE_HISTORY, loadHistory, MAX_HISTORY, updateRecord } from "./src/storage/history";
import { TrainerPanel, TRAINER_SAMPLES, useTrainer } from "./src/trainer/TrainerPanel";
import { DEFAULT_RULES, type Rules } from "./src/engine/rules";
import type { SavedGame } from "./src/game/GameController";
import { PACES, type Pace } from "./src/game/pace";
import { freshSeed, makeSetup } from "./src/game/setup";
import { useGame, type GameSource, type UseGameOptions } from "./src/game/useGame";
import { HomeScreen, type ResumeInfo } from "./src/home/HomeScreen";
import { LanScreen, type LanDeps } from "./src/lan/LanScreen";
import { SettingsSheet } from "./src/home/SettingsSheet";
import { TabBar, type Tab } from "./src/home/TabBar";
import { RulesScreen } from "./src/info/RulesScreen";
import { HouseRulesScreen } from "./src/newgame/HouseRulesScreen";
import { FREE_SEATS, NewGameScreen } from "./src/newgame/NewGameScreen";
import { summaryLines } from "./src/newgame/rulesText";
import { TutorialScreen } from "./src/onboarding/TutorialScreen";
import { Welcome } from "./src/onboarding/Welcome";
import { loadHouseRules, saveHouseRules } from "./src/storage/houseRules";
import { deviceKV, type KV } from "./src/storage/kv";
import { DEFAULT_CHOICES, loadChoices, saveChoices, type NewGameChoices } from "./src/storage/newGame";
import { loadOnboardingDone, saveOnboardingDone } from "./src/storage/onboarding";
import { clearSavedGame, isResumable, loadSavedGame } from "./src/storage/save";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "./src/storage/settings";
import { emptyStats, loadStats, saveStats, type Stats } from "./src/storage/stats";
import { ProfileScreen } from "./src/profile/ProfileScreen";
import { BADGES, badgesShownBy, earnedBadges, type BadgeId } from "./src/profile/progress";
import type { PersonaId } from "./src/ai/personas";
import { resetHints } from "./src/table/hints";
import { TableScreen } from "./src/table/TableScreen";
import { DialogProvider, useConfirm } from "./src/ui/Dialog";
import type { AdsApi } from "./src/premium/ads";
import { LimitSheet } from "./src/premium/LimitSheet";
import { LooksProvider, useLooks } from "./src/premium/LooksProvider";
import { LooksScreen } from "./src/premium/LooksScreen";
import { PremiumProvider, usePremium } from "./src/premium/PremiumProvider";
import type { StoreApi } from "./src/premium/store";
import type { Reward } from "./src/premium/wallet";
import { FONT_SOURCES } from "./src/ui/fonts";
import { setHapticsEnabled } from "./src/ui/haptics";
import { P } from "./src/ui/palette";
import { initSounds, setSoundEnabled } from "./src/ui/sound";

// Keep the native splash screen up until the font and stored data are ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

export type Screen =
  | { name: "home"; tab: Tab }
  | { name: "newGame"; training: boolean; bots?: PersonaId[] }
  | { name: "game"; source: GameSource; key: number }
  | { name: "tutorial"; key: number }
  | { name: "houseRules"; from: Tab }
  /** The rules opened from the table's menu (back resumes the game). */
  | { name: "rules"; backToGame: boolean }
  | { name: "history"; from: Tab }
  /** Playing with friends over Wi‑Fi (its own steps and back handling). */
  | { name: "lan"; key: number }
  | { name: "replay"; record: HistoryRecord; from: Tab }
  | { name: "looks"; from: Tab };

export interface AppProps {
  kv?: KV;
  /** Oczko Pro purchases and rewarded ads (tests pass fakes). */
  store?: StoreApi;
  ads?: AdsApi;
  /** Tests: the Wi‑Fi network in memory. */
  lanDeps?: LanDeps;
  /** Tests: the table's pace (otherwise from the settings). */
  pace?: Pace;
  /** Tests: bots' decisions and pauses. */
  decide?: UseGameOptions["decide"];
  sleep?: UseGameOptions["sleep"];
}

interface Stored {
  stats: Stats;
  saved: SavedGame | null;
  rules: Rules;
  choices: NewGameChoices;
  settings: Settings;
  onboarded: boolean;
}

export default function App(props: AppProps) {
  return (
    <SafeAreaProvider style={{ backgroundColor: P.bg }}>
      <StatusBar style="light" />
      <DialogProvider>
        <PremiumProvider kv={props.kv ?? deviceKV} store={props.store} ads={props.ads}>
          <LooksProvider kv={props.kv ?? deviceKV}>
            <Root {...props} kv={props.kv ?? deviceKV} />
          </LooksProvider>
        </PremiumProvider>
      </DialogProvider>
    </SafeAreaProvider>
  );
}

function resumeInfo(saved: SavedGame): ResumeInfo {
  const m = saved.match;
  const mode = saved.setup.rules.mode === "bank" ? "Z bankierem" : "Rodzinne";
  const kind = saved.setup.mode === "training" ? "trening" : saved.setup.mode === "single" ? "jedna runda" : `do ${saved.setup.rules.target} pkt`;
  return {
    title: `Runda ${m.roundNo}`,
    line: `${mode} · ${kind} · ${saved.setup.seats.map((s) => s.name).join(", ")}`,
    seats: saved.setup.seats.map((s, i) => ({
      name: s.name,
      color: s.kind === "bot" ? personaById(s.persona)?.color ?? P.muted : P.accent,
      score: m.scores[i],
    })),
  };
}

function GameScreen({
  source,
  opts,
  trainer,
  earned,
  onExit,
  onNewGame,
  onRules,
}: {
  source: GameSource;
  opts: UseGameOptions;
  /** The trainer's panel (the setting; always in training). */
  trainer: boolean;
  /** Badges earned before this game. */
  earned: BadgeId[];
  onExit: () => void;
  onNewGame: () => void;
  onRules: () => void;
}) {
  const [fresh, setFresh] = useState<BadgeId[]>([]);
  const [gameOpts] = useState<UseGameOptions>(() => ({
    ...opts,
    onRoundEnd: (info) => {
      const got = badgesShownBy(info.match, info.me).filter((b) => !earned.includes(b));
      if (got.length) setFresh((old) => [...old, ...got.filter((b) => !old.includes(b))]);
    },
  }));
  const { game, snapshot } = useGame(source, gameOpts);
  const premium = usePremium();
  const on = trainer || snapshot.mode === "training";
  const ev = useTrainer(snapshot, on, undefined, premium.pro ? undefined : () => premium.spend("hint"));
  return (
    <TableScreen
      game={game}
      kv={opts.kv}
      onExit={onExit}
      onNewGame={onNewGame}
      onRules={onRules}
      onGiveUp={() => void clearSavedGame(opts.kv)}
      trainer={on ? () => <TrainerPanel evaluation={ev} onMore={() => premium.showPaywall("hints")} /> : undefined}
      recommend={on && ev && ev !== "locked" ? ev.best : null}
      newBadges={BADGES.filter((b) => fresh.includes(b.id))}
    />
  );
}

/** The analysis' evaluator (one at a time). */
const analysisEvaluator = chunkedEvaluator();
const evaluateForAnalysis = (view: Parameters<typeof analysisEvaluator.evaluate>[0], seed: number) =>
  analysisEvaluator.evaluate(view, { samples: TRAINER_SAMPLES, rng: { state: seed >>> 0 }, opponentModel: { standAt: 17 } });

function applySettings(s: Settings): void {
  setSoundEnabled(s.sound);
  setHapticsEnabled(s.haptics);
}

async function loadAll(kv: KV): Promise<Stored> {
  const [saved, rules, choices, settings, done, stats] = await Promise.all([
    loadSavedGame(kv),
    loadHouseRules(kv),
    loadChoices(kv),
    loadSettings(kv),
    loadOnboardingDone(kv),
    loadStats(kv),
  ]);
  // Anyone who has played already skips the onboarding.
  const onboarded = done || stats.rounds > 0 || saved !== null;
  return { stats, saved: isResumable(saved) ? saved : null, rules, choices, settings, onboarded };
}

function Root({ kv, pace, decide, sleep, lanDeps }: AppProps & { kv: KV }) {
  const confirm = useConfirm();
  const [screen, setScreen] = useState<Screen>({ name: "home", tab: "play" });
  const [stored, setStored] = useState<Stored | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const premium = usePremium();
  const looks = useLooks();
  const [limit, setLimit] = useState<null | "analysis" | "bigTable" | "hints">(null);
  const [fontsLoaded, fontError] = useFonts(FONT_SOURCES);
  // A missing font must not block the app: it falls back to the system font.
  const ready = !!stored && (fontsLoaded || !!fontError);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    let alive = true;
    loadAll(kv).then((s) => {
      if (!alive) return;
      applySettings(s.settings);
      setStored(s);
    });
    void initSounds();
    return () => {
      alive = false;
    };
  }, [kv]);

  const reload = useCallback(
    () =>
      loadAll(kv).then((s) => {
        setStored((old) => (old ? { ...s, onboarded: true } : s));
      }),
    [kv]
  );

  const home = useCallback(
    (tab: Tab = "play") => {
      setScreen({ name: "home", tab });
      // The table saves on every move; storage reads wait for queued writes.
      setTimeout(() => void reload(), 0);
    },
    [reload]
  );

  const finishOnboarding = (rules: Rules) => {
    void saveHouseRules(kv, rules);
    void saveOnboardingDone(kv);
    setStored((s) => (s ? { ...s, rules, onboarded: true } : s));
  };

  const back = useCallback((): boolean => {
    if (stored && !stored.onboarded) return false;
    switch (screen.name) {
      case "houseRules":
      case "history":
      case "looks":
        home(screen.from);
        return true;
      case "replay":
        setScreen({ name: "history", from: screen.from });
        return true;
      case "lan":
        return false; // the Wi‑Fi screens go back step by step
      case "newGame":
      case "tutorial":
      case "game":
        home();
        return true;
      case "rules":
        if (screen.backToGame)
          // The table saved the game on leaving; storage reads wait for queued writes.
          void loadSavedGame(kv).then((s) => (isResumable(s) ? setScreen({ name: "game", source: { saved: s }, key: Date.now() }) : home()));
        else home();
        return true;
      default:
        if (screen.tab === "play") return false; // the lobby: leave the app
        setScreen({ name: "home", tab: "play" });
        return true;
    }
  }, [screen, home, stored, kv]);

  // Android back: screens go back to where they came from, other tabs go to
  // "Graj", the lobby leaves the app. Open bottom sheets handle back first.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", back);
    return () => sub.remove();
  }, [back]);

  if (!ready || !stored) return <View style={{ flex: 1, backgroundColor: P.bg }} />;

  const tablePace = pace ?? PACES[stored.settings.pace];
  const gameOpts: UseGameOptions = { kv, pace: tablePace, decide, sleep };

  const start = (choices: NewGameChoices, rules: Rules, training: boolean) => {
    // A table of 7–8: Oczko Pro, or today's free one (a rewarded ad adds one).
    // Spent only when the game really starts (not when the confirm is cancelled).
    const big = choices.bots.length + 1 > FREE_SEATS && !premium.pro;
    if (big && premium.bigTablesLeft <= 0) {
      setLimit("bigTable");
      return;
    }
    const go = () => {
      if (big && !premium.spend("bigTable")) {
        setLimit("bigTable");
        return;
      }
      void saveChoices(kv, choices);
      void clearSavedGame(kv);
      const mode = training ? "training" : choices.length === "single" ? "single" : "match";
      const setup = makeSetup(rules, choices.bots, mode, freshSeed());
      setStored((s) => (s ? { ...s, choices, saved: null } : s));
      setScreen({ name: "game", source: { setup }, key: Date.now() });
    };
    if (stored.saved)
      void confirm({
        title: "Masz niedokończoną partię",
        message: "Nowa gra zastąpi zapisaną — tamtej nie będzie już można wznowić.",
        confirmText: "Zacznij nową",
        destructive: true,
      }).then((ok) => ok && go());
    else go();
  };

  if (!stored.onboarded && screen.name !== "tutorial")
    return (
      <Welcome
        initial={stored.rules}
        onDone={(r) => {
          finishOnboarding(r);
          setScreen({ name: "home", tab: "play" });
        }}
        onTutorial={(r) => {
          finishOnboarding(r);
          setScreen({ name: "tutorial", key: Date.now() });
        }}
      />
    );

  // A daily limit's sheet shows over whatever screen is open.
  const withLimit = (el: React.ReactElement) => (
    <>
      {el}
      {limit && <Limit kind={limit} onClose={() => setLimit(null)} />}
    </>
  );

  switch (screen.name) {
    case "lan":
      return withLimit(
        <LanScreen key={screen.key} kv={kv} rules={stored.rules} pace={tablePace} pro={premium.pro} looks={looks.effective} onExit={() => home()} deps={lanDeps} />
      );
    case "looks":
      return withLimit(<LooksScreen onBack={back} />);
    case "history":
      return withLimit(
        <HistoryScreen
          records={history}
          limit={premium.pro ? MAX_HISTORY : FREE_HISTORY}
          canExport={premium.pro}
          onExportLocked={() => premium.showPaywall("export")}
          onMore={() => premium.showPaywall("history")}
          onBack={back}
          onOpen={(record) => setScreen({ name: "replay", record, from: screen.from })}
        />
      );
    case "replay":
      return withLimit(
        <ReplayScreen
          record={screen.record}
          onBack={back}
          evaluate={evaluateForAnalysis}
          spendAnalysis={() => premium.spend("analysis")}
          onAnalyseLocked={() => setLimit("analysis")}
          onAnalysed={(rec) => {
            void updateRecord(kv, rec).then(setHistory);
          }}
        />
      );
    case "tutorial":
      return withLimit(
        <TutorialScreen
          key={screen.key}
          kv={kv}
          pace={tablePace}
          sleep={sleep}
          onPlay={() => setScreen({ name: "newGame", training: false })}
          onExit={() => home()}
        />
      );
    case "houseRules":
      return withLimit(
        <HouseRulesScreen
          initial={stored.rules}
          onBack={back}
          onSave={(rules) => {
            void saveHouseRules(kv, rules);
            setStored((s) => (s ? { ...s, rules } : s));
            home(screen.from);
          }}
        />
      );
    case "rules":
      return withLimit(<RulesScreen rules={stored.rules} onBack={back} onTutorial={() => setScreen({ name: "tutorial", key: Date.now() })} />);
    case "newGame":
      return withLimit(
        <NewGameScreen
          maxTable={8 /* 7–8 need Oczko Pro or today's free big table: checked at the start */}
          key={screen.bots?.join(",") ?? "last"}
          initial={screen.bots ? { ...(stored.choices ?? DEFAULT_CHOICES), bots: screen.bots } : stored.choices ?? DEFAULT_CHOICES}
          rules={stored.rules}
          training={screen.training}
          onStart={(c, r) => start(c, r, screen.training)}
          onBack={back}
        />
      );
    case "game":
      return withLimit(
        <GameScreen
          key={screen.key}
          source={screen.source}
          opts={gameOpts}
          trainer={stored.settings.trainer}
          earned={earnedBadges(stored.stats)}
          onExit={() => home()}
          onNewGame={() => setScreen({ name: "newGame", training: false })}
          onRules={() => setScreen({ name: "rules", backToGame: true })}
        />
      );
    default:
      break;
  }

  const tab = screen.tab;
  const changeSettings = (s: Settings) => {
    applySettings(s);
    void saveSettings(kv, s);
    setStored((old) => (old ? { ...old, settings: s } : old));
  };
  return (
    <View style={{ flex: 1, backgroundColor: P.bg }}>
      <View style={{ flex: 1 }}>
        {tab === "profile" ? (
          <ProfileScreen
            pro={premium.pro}
            onPro={() => premium.showPaywall("stats")}
            stats={stored.stats}
            onPlay={(persona) => setScreen({ name: "newGame", training: false, bots: [persona as PersonaId] })}
            onHistory={() => {
              void loadHistory(kv).then(setHistory);
              setScreen({ name: "history", from: tab });
            }}
            onReset={() => {
              const fresh = emptyStats();
              void saveStats(kv, fresh);
              setStored((old) => (old ? { ...old, stats: fresh } : old));
            }}
          />
        ) : tab === "rules" ? (
          <RulesScreen rules={stored.rules} onTutorial={() => setScreen({ name: "tutorial", key: Date.now() })} />
        ) : (
          <HomeScreen
            rulesSummary={summaryLines(stored.rules)}
            resume={stored.saved ? resumeInfo(stored.saved) : null}
            onResume={() => stored.saved && setScreen({ name: "game", source: { saved: stored.saved }, key: Date.now() })}
            onNewGame={() => setScreen({ name: "newGame", training: false })}
            onFriends={() => setScreen({ name: "lan", key: Date.now() })}
            onTraining={() => setScreen({ name: "newGame", training: true })}
            onHouseRules={() => setScreen({ name: "houseRules", from: "play" })}
            onHistory={() => {
              void loadHistory(kv).then(setHistory);
              setScreen({ name: "history", from: tab });
            }}
            onSettings={() => setSettingsOpen(true)}
          />
        )}
      </View>
      <TabBar tab={tab} onChange={(t) => setScreen({ name: "home", tab: t })} />
      {settingsOpen && (
        <SettingsSheet
          settings={stored.settings ?? DEFAULT_SETTINGS}
          rules={stored.rules ?? DEFAULT_RULES}
          onChange={changeSettings}
          onHouseRules={() => {
            setSettingsOpen(false);
            setScreen({ name: "houseRules", from: tab });
          }}
          onResetTips={() => {
            void resetHints(kv);
            setSettingsOpen(false);
          }}
          onClose={() => setSettingsOpen(false)}
          extra={
            <SettingsExtra
              hintsLeft={premium.hintsLeft}
              onLooks={() => {
                setSettingsOpen(false);
                setScreen({ name: "looks", from: tab });
              }}
              onMoreHints={() => {
                setSettingsOpen(false);
                setLimit("hints");
              }}
            />
          }
        />
      )}
      {limit && <Limit kind={limit} onClose={() => setLimit(null)} />}
    </View>
  );
}

const LIMITS: Record<"analysis" | "bigTable" | "hints", { title: string; text: string; reason: "analysis" | "bigTable" | "hints"; proLabel: string; ad: { label: string; reward: Reward } }> = {
  analysis: {
    title: "Dzisiejsza analiza wykorzystana",
    text: "Bez Oczko Pro jedna analiza partii dziennie. Jutro kolejna — albo jeszcze jedna teraz, za reklamę.",
    reason: "analysis",
    proLabel: "Analiza bez limitu",
    ad: { label: "+1 analiza dziś", reward: { kind: "analysis" } },
  },
  bigTable: {
    title: "Stół dla 7–8 osób",
    text: "Bez Oczko Pro jeden duży stół dziennie. Dziś już był — kolejny za reklamę albo w Oczko Pro.",
    reason: "bigTable",
    proLabel: "Duże stoły bez limitu",
    ad: { label: "+1 duży stół dziś", reward: { kind: "bigTable" } },
  },
  hints: {
    title: "Podpowiedzi trenera",
    text: "Bez Oczko Pro trzy podpowiedzi dziennie. Kolejną dostaniesz za reklamę — oglądasz ją tylko, gdy chcesz.",
    reason: "hints",
    proLabel: "Trener bez limitu",
    ad: { label: "+1 podpowiedź dziś", reward: { kind: "hints" } },
  },
};

/** A daily limit reached: a rewarded ad (only on request) or Oczko Pro. */
function Limit({ kind, onClose }: { kind: keyof typeof LIMITS; onClose: () => void }) {
  const l = LIMITS[kind];
  return <LimitSheet title={l.title} text={l.text} reason={l.reason} proLabel={l.proLabel} ad={l.ad} onClose={onClose} />;
}

/** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
function SettingsExtra({ hintsLeft, onLooks, onMoreHints }: { hintsLeft: number; onLooks: () => void; onMoreHints: () => void }) {
  const premium = usePremium();
  const row = (label: string, sub: string, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={sub}
      style={{ minHeight: 56, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: P.line }}
    >
      <Text style={{ color: P.text, fontSize: 15, fontWeight: "600" }}>{label}</Text>
      <Text style={{ color: P.muted, fontSize: 12, marginTop: 2 }}>{sub}</Text>
    </Pressable>
  );
  return (
    <>
      {row("Wygląd", "Talie, sukna i rewersy", onLooks)}
      {!premium.pro && Number.isFinite(hintsLeft) && row("Podpowiedzi trenera", `Dziś zostało: ${hintsLeft}. Więcej za reklamę albo w Oczko Pro`, onMoreHints)}
      {premium.pro
        ? row("Oczko Pro", "Aktywne — zarządzaj subskrypcją", () => void premium.manage())
        : row("Oczko Pro", "Trener i analiza bez limitu, duże stoły, wygląd", () => premium.showPaywall("profile"))}
      {premium.codeFlow !== "none" && row("Mam kod", "Kod promocyjny Oczko Pro", () => premium.showRedeem())}
      {premium.adsAvailable && row("Prywatność reklam", "Zgody na reklamy (UE)", () => void premium.privacyOptions())}
    </>
  );
}
