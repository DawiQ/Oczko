// Settings (⚙︎ in the lobby): sound, haptics, the bots' pace, the trainer,
// the house rules, the one-time tips again.
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Rules } from "../engine/rules";
import { summaryLine } from "../newgame/rulesText";
import type { Settings } from "../storage/settings";
import { BottomSheet } from "../ui/BottomSheet";
import { Label, Segmented, SwitchRow } from "../ui/controls";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";

export function SettingsSheet({
  settings,
  rules,
  onChange,
  onHouseRules,
  onResetTips,
  onClose,
  extra,
}: {
  settings: Settings;
  rules: Rules;
  onChange: (s: Settings) => void;
  onHouseRules: () => void;
  onResetTips: () => void;
  onClose: () => void;
  /** More rows (looks, ads privacy — Etap 10). */
  extra?: React.ReactNode;
}) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  return (
    <BottomSheet snapPoints={[600]} onClose={onClose} accessibilityLabel="Ustawienia" dimFrom={0} header={<Text style={s.title}>Ustawienia</Text>}>
      <SwitchRow label="Dźwięk" value={settings.sound} onChange={(sound) => set({ sound })} />
      <SwitchRow label="Wibracje" value={settings.haptics} onChange={(haptics) => set({ haptics })} />
      <SwitchRow label="Trener przy stole" sub="Szansa na furę i szanse wygranej podczas ruchu" value={settings.trainer} onChange={(trainer) => set({ trainer })} />
      <Label>Tempo rywali</Label>
      <Segmented
        label="Tempo rywali"
        value={settings.pace}
        onChange={(pace) => set({ pace })}
        options={[
          { value: "slow", label: "Wolne" },
          { value: "normal", label: "Normalne" },
          { value: "fast", label: "Szybkie" },
        ]}
      />
      <View style={{ height: 10 }} />
      <Row label="Jak grasz u siebie" sub={summaryLine(rules)} onPress={onHouseRules} />
      <Row label="Pokaż wskazówki od nowa" sub="Podpowiedzi przy pierwszych sytuacjach" onPress={onResetTips} />
      {extra}
    </BottomSheet>
  );
}

function Row({ label, sub, onPress }: { label: string; sub: string; onPress: () => void }) {
  return (
    <Pressable style={s.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={sub}>
      <Text style={s.rowText}>{label}</Text>
      <Text style={s.rowSub}>{sub}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 22, paddingHorizontal: 18, paddingBottom: 4 },
  row: { minHeight: 56, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: P.line, paddingVertical: 8 },
  rowText: { color: P.text, fontSize: 15, fontWeight: "600" },
  rowSub: { color: P.muted, fontSize: 12, marginTop: 2 },
});
