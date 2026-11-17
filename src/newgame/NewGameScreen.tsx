// "Nowa gra": the mode, the rivals (− n +, a character may sit several times),
// the match length, the rules (BottomSheet). Choices are remembered.
// Layout: docs/mockups, screen 3.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PERSONAS, type PersonaId } from "../ai/personas";
import { MAX_SEATS, type Rules } from "../engine/rules";
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
  return (
    <View style={s.screen}>
      <Header title={training ? "Trening" : "Nowa gra"} subtitle={training ? "Z podpowiedziami trenera" : undefined} onBack={onBack} />
      <ScrollView contentContainerStyle={[s.content, { paddingBottom: 24 }]}>
        <Segmented
          label="Tryb gry"
          value={choices.mode}
          onChange={setMode}
          options={[
            { value: "family", label: "Rodzinne" },
            { value: "bank", label: "Z bankierem" },
          ]}
        />
        <View style={s.rivalsHead}>
          <Label>Rywale</Label>
          <Text style={s.count} accessibilityLiveRegion="polite">{`Ty + ${total} · max ${limit}`}</Text>
        </View>
        <View style={s.panel}>
          {PERSONAS.map((p, i) => (
            <View key={p.id} style={[s.persona, i === PERSONAS.length - 1 && { borderBottomWidth: 0 }]}>
              <Portrait name={p.name} size={34} color={p.color} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{p.name}</Text>
                  <Text style={[s.badge, { color: p.color, backgroundColor: `${p.color}22` }]}>{p.label}</Text>
                </View>
                <Text style={s.blurb} numberOfLines={1}>
                  {p.blurb}
                </Text>
              </View>
              <Counter label={`${p.name} przy stole`} value={c[p.id]} min={0} max={Math.max(0, c[p.id] + limit - total)} onChange={(n) => setCount(p.id, n)} />
            </View>
          ))}
        </View>
        {over && <Text style={s.warn}>{`Za dużo rywali dla tej talii — najwyżej ${limit}.`}</Text>}
        {!training && (
          <>
            <Label>Do ilu punktów</Label>
            <Segmented
              label="Długość partii"
              value={choices.length}
              onChange={(length: Length) => setChoices({ ...choices, length })}
              options={[
                { value: 5, label: "5" },
                { value: 10, label: "10" },
                { value: 15, label: "15" },
                { value: "single", label: "1 runda" },
              ]}
            />
          </>
        )}
        <Pressable style={[s.panel, s.rules]} onPress={() => setSheet(true)} accessibilityRole="button" accessibilityLabel={`Zasady: ${summaryLine(rules)}. Zmień`}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>Zasady</Text>
            <Text style={s.blurb}>{summaryLine(rules)}</Text>
          </View>
          <Text style={s.change}>Zmień</Text>
        </Pressable>
      </ScrollView>
      <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button3D
          label="Graj"
          big
          disabled={total === 0 || over}
          onPress={() => onStart(choices, { ...rules, mode: choices.mode, target: choices.length === "single" ? 1 : choices.length })}
          testID="newgame-play"
        />
      </View>
      {sheet && (
        <BottomSheet snapPoints={[560]} onClose={() => setSheet(false)} accessibilityLabel="Zasady tej gry" dimFrom={0} header={<Text style={s.sheetTitle}>Zasady tej gry</Text>}>
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
