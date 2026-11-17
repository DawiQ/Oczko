// First run: "Jak grasz u siebie?" — five questions, the rules in one
// sentence, "Gotowe" or "Pokaż mi zasady na przykładzie" (the tutorial).
// Layout: docs/mockups, screen 2.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Rules } from "../engine/rules";
import { RulesEditor } from "../newgame/RulesEditor";
import { preview } from "../newgame/rulesText";
import { Button3D } from "../ui/Button3D";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";

export function Welcome({ initial, onDone, onTutorial }: { initial: Rules; onDone: (r: Rules) => void; onTutorial: (r: Rules) => void }) {
  const insets = useSafeAreaInsets();
  const [rules, setRules] = useState(initial);
  return (
    <View style={[s.screen, { paddingTop: insets.top + 8 }]}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title} accessibilityRole="header">
          Jak grasz u siebie?
        </Text>
        <Text style={s.sub}>Każdy dom ma swoje Oczko. Ustaw zasady raz — można je zmienić w każdej chwili.</Text>
        <RulesEditor rules={rules} onChange={setRules} basic />
        <View style={s.preview} accessible accessibilityLabel={`W skrócie: ${preview(rules)}`}>
          <Text style={s.previewText}>
            <Text style={{ color: P.text, fontWeight: "700" }}>W skrócie: </Text>
            {preview(rules)}
          </Text>
        </View>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button3D label="Gotowe" big onPress={() => onDone(rules)} testID="welcome-done" />
        <Pressable onPress={() => onTutorial(rules)} style={s.link} accessibilityRole="button" accessibilityLabel="Pokaż mi zasady na przykładzie">
          <Text style={s.linkText}>Pokaż mi zasady na przykładzie</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 28, marginTop: 6 },
  sub: { color: P.muted, fontSize: 14, marginTop: 6, lineHeight: 20 },
  preview: { marginTop: 18, backgroundColor: P.surface2, borderRadius: 16, borderWidth: 1, borderColor: P.line, padding: 14 },
  previewText: { color: P.textSoft, fontSize: 14, lineHeight: 20 },
  footer: { paddingHorizontal: 16, paddingTop: 8, gap: 6, borderTopWidth: 1, borderTopColor: P.surface2 },
  link: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  linkText: { color: P.accent, fontSize: 15, fontWeight: "700" },
});
