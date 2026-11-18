// "Zasady": every variant described, hands drawn as cards, the values from the
// house rules. Layout: docs/mockups, screen 10.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { cardOf, LOWEST_RANK, rankOf } from "../engine/cards";
import type { Rules } from "../engine/rules";
import { handValue } from "../engine/score";
import { useStrings, type Strings } from "../i18n";
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
type ExampleId = "persian" | "aces21" | "oczko" | "fura";
type Example = { id: string; title: string; text: string; cards: number[]; value: string; color: string };

/** Example hands under the rules in use: two aces as the rules say (none
 *  without the rule), 21, and a fura that is one under any values. */
function examples(rules: Rules, s: Strings): Example[] {
  const t = s.rules.screen.examples;
  const plain = (id: ExampleId, cards: number[], value: string, color: string): Example => ({ id, ...t[id], cards, value, color });
  const aces = [c(14, 0), c(14, 3)];
  // Cards in every deck (24 cards: 9–A).
  const fura = [c(10, 3), c(10, 1), c(9, 0)];
  // Pontoon's hands: an ace and a ten; five of the lowest cards (when they make no fura).
  const low = LOWEST_RANK[rules.deck];
  const five = [c(low, 0), c(low, 1), c(low, 2), c(low, 3), c(low + 1, 0)];
  const fiveValue = rules.maxCards !== null && rules.maxCards < 5 ? null : handValue(five, rules);
  // 21: an ace and a ten — unless that is a pontoon; then three cards (where the deck has them).
  const oczko = rules.pontoon
    ? [[c(10, 2), c(6, 1), c(5, 0)], [c(10, 2), c(10, 3), c(14, 1)]].find((h) => h.every((x) => rankOf(x) >= low) && handValue(h, rules).total === 21)
    : [c(10, 2), c(14, 1)];
  const e = s.rules.editor;
  return [
    ...(rules.persian === "wins" ? [plain("persian", aces, "AA", P.accent)] : []),
    ...(rules.persian === "is21" ? [plain("aces21", aces, "21", P.ok)] : []),
    ...(rules.pontoon ? [{ id: "pontoon", title: s.table.specials.pontoon, text: e.pontoonSub, cards: [c(14, 2), c(10, 1)], value: "21", color: P.accent }] : []),
    ...(fiveValue?.special === "fiveCard" ? [{ id: "fiveCard", title: s.table.specials.fiveCard, text: e.fiveCardTrickSub, cards: five, value: String(fiveValue.total), color: P.accent }] : []),
    ...(oczko ? [plain("oczko", oczko, "21", P.ok)] : []),
    plain("fura", fura, String(handValue(fura, rules).total), P.danger),
  ];
}

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
          {examples(rules, str).map((e, i) => (
            <View key={e.id} style={[s.example, i > 0 && s.sep]} accessible accessibilityLabel={t.exampleA11y(e.title, e.text)}>
              <View style={s.cards}>
                {e.cards.map((card, i) => (
                  // Five cards overlap to fit the column (104 px, cards 30 px).
                  <CardFace key={card} card={card} size="sm" style={{ marginLeft: i === 0 ? 0 : e.cards.length > 3 ? Math.floor((104 - 30 * e.cards.length) / (e.cards.length - 1)) : 3 }} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.exTitle}>{e.title}</Text>
                <Text style={s.exText}>{e.text}</Text>
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
