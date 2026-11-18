// "Pokaż mi zasady": a scripted round at the real table — the coach says what
// to do, only the expected button works. Not saved, no statistics.
import { useEffect, useState, useSyncExternalStore } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GameController } from "../game/GameController";
import type { Pace } from "../game/pace";
import { useStrings } from "../i18n";
import type { KV } from "../storage/kv";
import { TableScreen } from "../table/TableScreen";
import { Button3D } from "../ui/Button3D";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { coachText, expectedMove, TUTORIAL_SEED, tutorialSetup } from "./tutorialScript";

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
  const str = useStrings();
  const t = str.onboarding.tutorial;
  const [game] = useState(() => new GameController(tutorialSetup(TUTORIAL_SEED, str), { pace, sleep }));
  useEffect(() => () => game.dispose(), [game]);
  const snap = useSyncExternalStore(game.subscribe, game.getSnapshot);
  const expected = expectedMove(snap);
  const end = (
    <View style={[s.end, { paddingBottom: insets.bottom + 16 }]} accessibilityViewIsModal>
      <Text style={s.title} accessibilityRole="header">
        {t.endTitle}
      </Text>
      <Text style={s.text}>{t.endText}</Text>
      <Button3D label={t.play} big onPress={onPlay} testID="tutorial-play" />
      <Button3D label={t.lobby} tone="dark" height={46} onPress={onExit} />
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
      coach={coachText(snap, str)}
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
