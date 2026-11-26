// "Nowa gra": the mode, the rivals (− n +, a character may sit several times),
// the match length, the rules (BottomSheet). Choices are remembered.
// Layout: docs/mockups, screen 3.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PERSONAS, type PersonaId } from "../ai/personas";
import { MAX_SEATS, type Rules } from "../engine/rules";
import { useStrings } from "../i18n";
import type { Length, NewGameChoices } from "../storage/newGame";
import { BottomSheet } from "../ui/BottomSheet";
import { Button3D } from "../ui/Button3D";
import { Counter, Label, Segmented } from "../ui/controls";
import { DISPLAY } from "../ui/fonts";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";
import { Portrait } from "../ui/Portrait";
import { RulesEditor } from "./RulesEditor";
import { summaryLine } from "./rulesText";

/** Seats without Oczko Pro (you included); 7–8 need Pro (Etap 10). */
export const FREE_SEATS = 6;

export function counts(bots: readonly PersonaId[]): Record<PersonaId, number> {
  const c = Object.fromEntries(PERSONAS.map((p) => [p.id, 0])) as Record<PersonaId, number>;
  for (const b of bots) c[b]++;
  return c;
}

/** Bots in level order (copies together), from the counters. */
export function botsFrom(c: Record<PersonaId, number>): PersonaId[] {
  return PERSONAS.flatMap((p) => Array.from({ length: c[p.id] }, () => p.id));
}

export function maxSeats(rules: Rules, maxTable: number): number {
  return Math.min(MAX_SEATS[rules.deck], maxTable);
}

export function NewGameScreen({
  initial,
  rules: rulesIn,
  training,
  maxTable = FREE_SEATS,
  onStart,
  onBack,
}: {
  initial: NewGameChoices;
  /** The house rules (mode comes from the choices). */
  rules: Rules;
  training: boolean;
  /** The biggest table allowed (seats, you included). */
  maxTable?: number;
  onStart: (choices: NewGameChoices, rules: Rules) => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const str = useStrings();
  const t = str.newgame;
  const [choices, setChoices] = useState(initial);
  const [rules, setRules] = useState<Rules>({ ...rulesIn, mode: initial.mode });
  const [sheet, setSheet] = useState(false);
  const c = counts(choices.bots);
  const limit = maxSeats(rules, maxTable) - 1;
  const total = choices.bots.length;
  const setCount = (id: PersonaId, n: number) => {
    const next = { ...c, [id]: n };
    setChoices({ ...choices, bots: botsFrom(next) });
  };
  const setMode = (mode: "family" | "bank") => {
    setChoices({ ...choices, mode });
    setRules({ ...rules, mode });
  };
  const over = total > limit;
  const summary = summaryLine(rules, str);
  return (
    <View style={s.screen}>
      <Header title={training ? t.training : t.title} subtitle={training ? t.trainingSub : undefined} onBack={onBack} />
      <ScrollView contentContainerStyle={[s.content, { paddingBottom: 24 }]}>
        <Segmented
          label={t.modeA11y}
          value={choices.mode}
          onChange={setMode}
          options={[
            { value: "family", label: str.rules.modes.family },
            { value: "bank", label: str.rules.modes.bank },
          ]}
        />
        <View style={s.rivalsHead}>
          <Label>{t.rivals}</Label>
          <Text style={s.count} accessibilityLiveRegion="polite">{t.rivalsCount(total, limit)}</Text>
        </View>
        <View style={s.panel}>
          {PERSONAS.map((p, i) => (
            <View key={p.id} style={[s.persona, i === PERSONAS.length - 1 && { borderBottomWidth: 0 }]}>
              <Portrait name={str.personas[p.id].name} persona={p.id} size={34} color={p.color} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{str.personas[p.id].name}</Text>
                  <Text style={[s.badge, { color: p.color, backgroundColor: `${p.color}22` }]}>{str.personas[p.id].label}</Text>
                </View>
                <Text style={s.blurb} numberOfLines={1}>
                  {str.personas[p.id].blurb}
                </Text>
              </View>
              <Counter label={t.atTable(str.personas[p.id].name)} value={c[p.id]} min={0} max={Math.max(0, c[p.id] + limit - total)} onChange={(n) => setCount(p.id, n)} />
            </View>
          ))}
        </View>
        {over && <Text style={s.warn}>{t.tooMany(limit)}</Text>}
        {!training && (
          <>
            <Label>{t.length}</Label>
            <Segmented
              label={t.lengthA11y}
              value={choices.length}
              onChange={(length: Length) => setChoices({ ...choices, length })}
              options={[
                { value: 5, label: "5" },
                { value: 10, label: "10" },
                { value: 15, label: "15" },
                { value: "single", label: str.common.rounds(1) },
              ]}
            />
          </>
        )}
        <Pressable style={[s.panel, s.rules]} onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={t.rulesA11y(summary)}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{t.rules}</Text>
            <Text style={s.blurb}>{summary}</Text>
          </View>
          <Text style={s.change}>{t.change}</Text>
        </Pressable>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button3D
          label={t.play}
          big
          disabled={total === 0 || over}
          onPress={() => onStart(choices, { ...rules, mode: choices.mode, target: choices.length === "single" ? 1 : choices.length })}
          testID="newgame-play"
        />
      </View>
      {sheet && (
        <BottomSheet snapPoints={[560]} onClose={() => setSheet(false)} accessibilityLabel={t.sheetTitle} dimFrom={0} header={<Text style={s.sheetTitle}>{t.sheetTitle}</Text>}>
          <RulesEditor
            rules={rules}
            onChange={(r) => {
              setRules(r);
              if (r.mode !== choices.mode) setChoices({ ...choices, mode: r.mode });
            }}
          />
        </BottomSheet>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  content: { paddingHorizontal: 16 },
  rivalsHead: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  count: { color: P.muted, fontSize: 12, marginBottom: 7 },
  panel: { backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12 },
  persona: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: P.line },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: P.text, fontSize: 14, fontWeight: "700" },
  badge: { fontSize: 10, fontWeight: "700", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1, overflow: "hidden" },
  blurb: { color: P.muted, fontSize: 11.5, marginTop: 1 },
  warn: { color: P.danger, fontSize: 12, marginTop: 6 },
  rules: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, marginTop: 14 },
  change: { color: P.accent, fontWeight: "700", fontSize: 13 },
  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: P.surface2 },
  sheetTitle: { color: P.text, fontFamily: DISPLAY, fontSize: 20, paddingHorizontal: 18, paddingBottom: 6 },
});
