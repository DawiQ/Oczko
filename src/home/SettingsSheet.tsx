// Settings (⚙︎ in the lobby): sound, haptics, the bots' pace, the trainer,
// the house rules, the one-time tips again.
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Rules } from "../engine/rules";
import { deviceLang, deviceLocales, LANG_NAMES, LANGS, useStrings, type Lang, type LangSetting } from "../i18n";
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
  langs = LANGS,
}: {
  settings: Settings;
  rules: Rules;
  onChange: (s: Settings) => void;
  onHouseRules: () => void;
  onResetTips: () => void;
  onClose: () => void;
  /** More rows (looks, ads privacy — Etap 10). */
  extra?: React.ReactNode;
  /** Languages to offer (tests); the row shows only with two or more. */
  langs?: readonly Lang[];
}) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  const str = useStrings();
  const t = str.home.settingsSheet;
  const [langOpen, setLangOpen] = useState(false);
  const nameOf = (l: Lang) => LANG_NAMES[l] ?? l;
  const langLabel = (l: LangSetting) => (l === "auto" ? t.languageAuto(nameOf(deviceLang(deviceLocales(), langs))) : nameOf(l));
  return (
    <BottomSheet snapPoints={[600]} onClose={onClose} accessibilityLabel={t.title} dimFrom={0} header={<Text style={s.title}>{t.title}</Text>}>
      <SwitchRow label={t.sound} value={settings.sound} onChange={(sound) => set({ sound })} />
      <SwitchRow label={t.haptics} value={settings.haptics} onChange={(haptics) => set({ haptics })} />
      <SwitchRow label={t.trainer} sub={t.trainerSub} value={settings.trainer} onChange={(trainer) => set({ trainer })} />
      <Label>{t.pace}</Label>
      <Segmented
        label={t.pace}
        value={settings.pace}
        onChange={(pace) => set({ pace })}
        options={[
          { value: "slow", label: t.slow },
          { value: "normal", label: t.normal },
          { value: "fast", label: t.fast },
        ]}
      />
      <View style={{ height: 10 }} />
      <Row label={t.houseRules} sub={summaryLine(rules, str)} onPress={onHouseRules} />
      <Row label={t.resetTips} sub={t.resetTipsSub} onPress={onResetTips} />
      {langs.length > 1 && (
        <>
          <Row label={t.language} sub={langLabel(settings.lang)} onPress={() => setLangOpen((o) => !o)} />
          {langOpen &&
            (["auto", ...langs] as LangSetting[]).map((l) => (
              <Pressable
                key={l}
                style={s.choice}
                onPress={() => {
                  set({ lang: l });
                  setLangOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: settings.lang === l }}
                accessibilityLabel={langLabel(l)}
              >
                <Text style={[s.choiceText, settings.lang === l && { color: P.accent }]}>{langLabel(l)}</Text>
              </Pressable>
            ))}
        </>
      )}
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
  choice: { minHeight: 44, justifyContent: "center", paddingLeft: 14, borderBottomWidth: 1, borderBottomColor: P.line },
  choiceText: { color: P.text, fontSize: 15 },
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 22, paddingHorizontal: 18, paddingBottom: 4 },
  row: { minHeight: 56, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: P.line, paddingVertical: 8 },
  rowText: { color: P.text, fontSize: 15, fontWeight: "600" },
  rowSub: { color: P.muted, fontSize: 12, marginTop: 2 },
});
