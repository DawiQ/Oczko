// "Jak grasz u siebie" from the lobby / settings: every option, saved as the
// default for new games.
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DEFAULT_RULES, type Rules } from "../engine/rules";
import { Button3D } from "../ui/Button3D";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";
import { RulesEditor } from "./RulesEditor";
import { preview } from "./rulesText";

export function HouseRulesScreen({ initial, onSave, onBack }: { initial: Rules; onSave: (r: Rules) => void; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [rules, setRules] = useState(initial);
  return (
    <View style={s.screen}>
      <Header title="Jak grasz u siebie" onBack={onBack} />
      <ScrollView contentContainerStyle={s.content}>
        <RulesEditor rules={rules} onChange={setRules} />
        <Text style={s.preview}>{preview(rules)}</Text>
        <Button3D label="Przywróć domyślne" tone="dark" height={44} onPress={() => setRules({ ...DEFAULT_RULES, target: rules.target })} />
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button3D label="Zapisz" big onPress={() => onSave(rules)} testID="house-rules-save" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  content: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  preview: { color: P.textSoft, fontSize: 13.5, lineHeight: 20, marginTop: 14, backgroundColor: P.surface2, borderRadius: 14, padding: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: P.surface2 },
});
