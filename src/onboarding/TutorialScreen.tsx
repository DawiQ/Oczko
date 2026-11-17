// "Pokaż mi zasady": a scripted round at the real table — the coach says what
// to do, only the expected button works. Not saved, no statistics.
import { useEffect, useState, useSyncExternalStore } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameController } from "../game/GameController";
import type { Pace } from "../game/pace";
import type { KV } from "../storage/kv";
import { TableScreen } from "../table/TableScreen";
import { Button3D } from "../ui/Button3D";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { coachText, expectedMove, tutorialSetup } from "./tutorialScript";

export function TutorialScreen({
  kv,
  pace,
  sleep,
  onPlay,
  onExit,
}: {
  kv: KV;
  pace?: Pace;
  sleep?: (ms: number) => Promise<void>;
  onPlay: () => void;
  onExit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [game] = useState(() => new GameController(tutorialSetup(), { pace, sleep }));
  useEffect(() => () => game.dispose(), [game]);
  const snap = useSyncExternalStore(game.subscribe, game.getSnapshot);
  const expected = expectedMove(snap);
  const end = (
    <View style={[s.end, { paddingBottom: insets.bottom + 16 }]} accessibilityViewIsModal>
      <Text style={s.title} accessibilityRole="header">
        Tak się gra w Oczko!
      </Text>
      <Text style={s.text}>
        Witek przesadził (fura — ponad 21), Kuba zatrzymał się niżej, więc punkt jest Twój. Gracie do ustalonej liczby punktów; a dwa asy to perskie
        oczko, które wygrywa wszystko.
      </Text>
      <Button3D label="Zagraj partię" big onPress={onPlay} testID="tutorial-play" />
      <Button3D label="Do lobby" tone="dark" height={46} onPress={onExit} />
    </View>
  );
  return (
    <TableScreen
      game={game}
      kv={kv}
      onExit={onExit}
      onNewGame={onPlay}
      onRules={onExit}
      allowed={expected ? [expected] : []}
      coach={coachText(snap)}
      recommend={expected}
      endPanel={end}
    />
  );
}

const s = StyleSheet.create({
  end: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: P.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    gap: 12,
    zIndex: 50,
    elevation: 50,
  },
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 24 },
  text: { color: P.textSoft, fontSize: 14, lineHeight: 20 },
});
