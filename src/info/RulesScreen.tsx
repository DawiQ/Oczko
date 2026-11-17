// "Zasady": every variant described, hands drawn as cards, the values from the
// house rules. Layout: docs/mockups, screen 10.
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { cardOf } from "../engine/cards";
import type { Rules } from "../engine/rules";
import { Button3D } from "../ui/Button3D";
import { CardFace } from "../ui/cards";
import { Segmented } from "../ui/controls";
import { DISPLAY } from "../ui/fonts";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";

type Topic = "family" | "bank" | "variants";

const c = cardOf;
const EXAMPLES: { title: string; text: string; cards: number[]; value: string; color: string }[] = [
  { title: "Perskie oczko", text: "Dwa asy — wygrywa ze wszystkim.", cards: [c(14, 0), c(14, 3)], value: "AA", color: P.accent },
  { title: "Oczko", text: "Równe 21.", cards: [c(10, 2), c(14, 1)], value: "21", color: P.ok },
  { title: "Fura", text: "Więcej niż 21 — ręka przegrywa.", cards: [c(13, 3), c(9, 0), c(10, 1)], value: "23", color: P.danger },
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
  const [topic, setTopic] = useState<Topic>(rules.mode);
  const values: [string, string][] = [
    ["2–10", "wg oczek"],
    ["W", String(rules.values[11])],
    ["D", String(rules.values[12])],
    ["K", String(rules.values[13])],
    ["A", rules.ace === "eleven" ? "11" : "1/11"],
  ];
  return (
    <View style={s.screen}>
      <Header title="Zasady" onBack={onBack} />
      <ScrollView contentContainerStyle={s.content}>
        <Segmented
          label="Temat"
          value={topic}
          onChange={setTopic}
          options={[
            { value: "family", label: "Rodzinne" },
            { value: "bank", label: "Z bankierem" },
            { value: "variants", label: "Warianty" },
          ]}
        />
        {topic === "family" && (
          <>
            <Section title="Cel">
              <T>Zbierz jak najbliżej 21 oczek, ale nie więcej. Każdy po kolei mówi „Dobieram” (bierze kartę) albo „Starczy” (kończy).</T>
            </Section>
            <Section title="Przebieg">
              <T>Każdy dostaje kartę na start. Gracie po kolei od lewej strony rozdającego. Na końcu rundy wszyscy odkrywają karty.</T>
              <T>Punkt dostaje wynik najbliżej 21 bez fury; perskie oczko wygrywa ze wszystkim. Przy remisie — wg ustawień: punkt dla każdego albo dla nikogo.</T>
            </Section>
          </>
        )}
        {topic === "bank" && (
          <>
            <Section title="Bankier">
              <T>Jedna osoba jest bankiem. Każdy gracz rozgrywa pojedynek tylko z bankiem; bank rusza się ostatni i widzi, kto ma furę.</T>
              <T>Gracz z wyższym wynikiem wygrywa pojedynek (+1). Fura gracza przegrywa zawsze; fura banku przegrywa z każdym, kto jej nie ma. Remis — zwykle dla banku.</T>
              <T>Bank dostaje punkt, gdy wygra więcej pojedynków, niż przegra (albo — w ustawieniach — punkt za każdy wygrany pojedynek). Bank przechodzi co rundę na kolejną osobę.</T>
            </Section>
          </>
        )}
        {topic === "variants" && (
          <Section title="Warianty domowe">
            <T>Wartości figur (W, D, K), talia 52, 32 albo 24 karty, as za 11 albo za 1 lub 11, perskie oczko tak albo nie, jedna lub dwie karty na start, limit kart w ręce, zasady remisów i banku.</T>
            <T>Wszystko ustawisz w „Jak grasz u siebie” i przy każdej nowej grze.</T>
          </Section>
        )}
        <View style={s.panel}>
          {EXAMPLES.map((e, i) => (
            <View key={e.title} style={[s.example, i > 0 && s.sep]} accessible accessibilityLabel={`${e.title}: ${e.text}`}>
              <View style={s.cards}>
                {e.cards.map((card) => (
                  <CardFace key={card} card={card} size="sm" style={{ marginRight: 3 }} />
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
        <Section title="Wartości kart">
          <View style={s.values}>
            {values.map(([a, b]) => (
              <View key={a} style={s.value} accessible accessibilityLabel={`${a}: ${b}`}>
                <Text style={s.valueTop}>{a}</Text>
                <Text style={s.valueSub}>{b}</Text>
              </View>
            ))}
          </View>
          <Text style={s.small}>Twoje ustawienia — zmienisz je w „Jak grasz u siebie”.</Text>
        </Section>
        <Button3D label="Pokaż na przykładzie" tone="dark" height={48} onPress={onTutorial} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
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
