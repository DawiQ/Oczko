// A part of the app that is still being built: a header with "back" and a
// short note. Used as a tab body (no back button) or as its own screen.
import { StyleSheet, Text, View } from "react-native";

import { DISPLAY } from "../ui/fonts";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";

export function SoonScreen({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={s.screen}>
      <Header title={title} onBack={onBack} />
      <View style={s.body}>
        <Text style={s.big}>Wkrótce</Text>
        <Text style={s.text}>Ta część aplikacji jeszcze powstaje.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  big: { color: P.accent, fontFamily: DISPLAY, fontSize: 28 },
  text: { color: P.muted, fontSize: 15, textAlign: "center" },
});
