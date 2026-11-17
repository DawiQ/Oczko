// App root: the main tabs (Graj · Profil · Zasady) and the screens opened from
// them. Navigation is a plain `Screen` state (no library); Android "back"
// is handled here.
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { HomeScreen } from "./src/home/HomeScreen";
import { SoonScreen } from "./src/home/SoonScreen";
import { TabBar, type Tab } from "./src/home/TabBar";
import { DialogProvider } from "./src/ui/Dialog";
import { FONT_SOURCES } from "./src/ui/fonts";
import { P } from "./src/ui/palette";

// Keep the native splash screen up until the font is ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

export type Screen =
  | { name: "home"; tab: Tab }
  /** A part still being built, opened from a tab (back returns to it). */
  | { name: "soon"; title: string; from: Tab };

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: P.bg }}>
      <StatusBar style="light" />
      <DialogProvider>
        <Root />
      </DialogProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const [screen, setScreen] = useState<Screen>({ name: "home", tab: "play" });
  const [fontsLoaded, fontError] = useFonts(FONT_SOURCES);
  // A missing font must not block the app: it falls back to the system font.
  const ready = fontsLoaded || !!fontError;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const back = useCallback((): boolean => {
    if (screen.name === "soon") {
      setScreen({ name: "home", tab: screen.from });
      return true;
    }
    if (screen.tab !== "play") {
      setScreen({ name: "home", tab: "play" });
      return true;
    }
    return false; // the lobby: leave the app
  }, [screen]);

  // Android back: screens go back to the tab they came from, other tabs go to
  // "Graj", the lobby leaves the app. Open bottom sheets handle back first.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", back);
    return () => sub.remove();
  }, [back]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: P.bg }} />;

  if (screen.name === "soon") return <SoonScreen title={screen.title} onBack={back} />;

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
            onNewGame={() => open("Nowa gra")}
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
