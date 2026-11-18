// "Zasady": every variant described, hands drawn as cards, the values from the
// house rules. Layout: docs/mockups, screen 10.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { cardOf } from "../engine/cards";
import type { Rules } from "../engine/rules";
import { useStrings } from "../i18n";
import { BottomSheet } from "../ui/BottomSheet";
import { Button3D } from "../ui/Button3D";
import { CardFace } from "../ui/cards";
import { Segmented } from "../ui/controls";
import { DISPLAY } from "../ui/fonts";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";
import { FONT_LICENSES } from "./licenses";

type Topic = "family" | "bank" | "variants";

const c = cardOf;
const EXAMPLES: { id: "persian" | "oczko" | "fura"; cards: number[]; value: string; color: string }[] = [
  { id: "persian", cards: [c(14, 0), c(14, 3)], value: "AA", color: P.accent },
  { id: "oczko", cards: [c(10, 2), c(14, 1)], value: "21", color: P.ok },
  { id: "fura", cards: [c(13, 3), c(9, 0), c(10, 1)], value: "23", color: P.danger },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.panel}>
      <Text style={s.h} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const T = ({ children }: { children: string }) => <Text style={s.p}>{children}</Text>;

export function RulesScreen({ rules, onTutorial, onBack }: { rules: Rules; onTutorial: () => void; onBack?: () => void }) {
  const str = useStrings();
  const t = str.rules.screen;
  const [licenses, setLicenses] = useState(false);
  const L = str.cards.rankLetters;
  const [topic, setTopic] = useState<Topic>(rules.mode);
  const values: [string, string][] = [
    [t.pipRanks, t.byPips],
    [L[11], String(rules.values[11])],
    [L[12], String(rules.values[12])],
    [L[13], String(rules.values[13])],
    [L[14], t.aceShort[rules.ace]],
  ];
  return (
    <View style={s.screen}>
      <Header title={t.title} onBack={onBack} />
      <ScrollView contentContainerStyle={s.content}>
        <Segmented
          label={t.topic}
          value={topic}
          onChange={setTopic}
          options={[
            { value: "family", label: str.rules.modes.family },
            { value: "bank", label: str.rules.modes.bank },
            { value: "variants", label: t.variants },
          ]}
        />
        {topic === "family" && (
          <>
            <Section title={t.goal}>
              <T>{t.goalText}</T>
            </Section>
            <Section title={t.flow}>
              {t.flowTexts.map((p) => (
                <T key={p}>{p}</T>
              ))}
            </Section>
          </>
        )}
        {topic === "bank" && (
          <>
            <Section title={t.banker}>
              {t.bankerTexts.map((p) => (
                <T key={p}>{p}</T>
              ))}
            </Section>
          </>
        )}
        {topic === "variants" && (
          <Section title={t.houseVariants}>
            {t.houseVariantsTexts.map((p) => (
              <T key={p}>{p}</T>
            ))}
          </Section>
        )}
        <View style={s.panel}>
          {EXAMPLES.map((e, i) => (
            <View key={e.id} style={[s.example, i > 0 && s.sep]} accessible accessibilityLabel={t.exampleA11y(t.examples[e.id].title, t.examples[e.id].text)}>
              <View style={s.cards}>
                {e.cards.map((card) => (
                  <CardFace key={card} card={card} size="sm" style={{ marginRight: 3 }} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.exTitle}>{t.examples[e.id].title}</Text>
                <Text style={s.exText}>{t.examples[e.id].text}</Text>
              </View>
              <Text style={[s.exValue, { color: e.color }]}>{e.value}</Text>
            </View>
          ))}
        </View>
        <Section title={t.cardValues}>
          <View style={s.values}>
            {values.map(([a, b]) => (
              <View key={a} style={s.value} accessible accessibilityLabel={t.valueA11y(a, b)}>
                <Text style={s.valueTop}>{a}</Text>
                <Text style={s.valueSub}>{b}</Text>
              </View>
            ))}
          </View>
          <Text style={s.small}>{t.yourSettings}</Text>
        </Section>
        <Button3D label={t.showExample} tone="dark" height={48} onPress={onTutorial} />
        <Pressable style={s.licensesLink} onPress={() => setLicenses(true)} accessibilityRole="button" accessibilityLabel={t.licenses}>
          <Text style={s.licensesText}>{t.licenses}</Text>
        </Pressable>
      </ScrollView>
      {licenses && (
        <BottomSheet snapPoints={[560]} onClose={() => setLicenses(false)} accessibilityLabel={t.licenses} header={<Text style={s.licensesTitle}>{t.licenses}</Text>}>
          {FONT_LICENSES.map((x) => (
            <View key={x.name} style={{ gap: 6, paddingBottom: 16 }}>
              <Text style={s.h}>{x.name}</Text>
              <Text style={s.licenseBody}>{x.text}</Text>
            </View>
          ))}
        </BottomSheet>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  licensesLink: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  licensesText: { color: P.muted, fontSize: 12.5, textDecorationLine: "underline" },
  licensesTitle: { color: P.text, fontFamily: DISPLAY, fontSize: 20, paddingHorizontal: 18, paddingBottom: 4 },
  licenseBody: { color: P.textSoft, fontSize: 11, lineHeight: 15 },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  panel: { backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 18, padding: 14, gap: 6 },
  h: { color: P.text, fontSize: 15, fontWeight: "700" },
  p: { color: P.textSoft, fontSize: 13.5, lineHeight: 20 },
  example: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  sep: { borderTopWidth: 1, borderTopColor: P.line },
  cards: { flexDirection: "row", width: 104 },
  exTitle: { color: P.text, fontSize: 14, fontWeight: "700" },
  exText: { color: P.muted, fontSize: 12 },
  exValue: { fontFamily: DISPLAY, fontSize: 18 },
  values: { flexDirection: "row", gap: 6 },
  value: { flex: 1, backgroundColor: P.surface2, borderColor: P.line, borderWidth: 1, borderRadius: 10, paddingVertical: 7, alignItems: "center" },
  valueTop: { color: P.text, fontFamily: DISPLAY, fontSize: 15 },
  valueSub: { color: P.muted, fontSize: 12 },
  small: { color: P.muted, fontSize: 11.5, marginTop: 4 },
});
