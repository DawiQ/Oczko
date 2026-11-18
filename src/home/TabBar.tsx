// Bottom tab bar of the main screens: Graj · Profil · Zasady.
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStrings } from "../i18n";
import { ART } from "../ui/art";
import { P } from "../ui/palette";

export type Tab = "play" | "profile" | "rules";

const TABS: { id: Tab; icon: number }[] = [
  { id: "play", icon: ART.iconCards },
  { id: "profile", icon: ART.iconPerson },
  { id: "rules", icon: ART.iconBook },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const str = useStrings();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) + 4 }]} accessibilityRole="tablist">
      {TABS.map((t) => {
        const on = t.id === tab;
        const color = on ? P.accent : P.muted;
        const label = str.home.tabs[t.id];
        return (
          <Pressable
            key={t.id}
            style={s.tab}
            onPress={() => onChange(t.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={label}
          >
            <Image source={t.icon} style={[s.icon, { tintColor: color }]} />
            <Text style={[s.label, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: P.tabBar, borderTopWidth: 1, borderTopColor: P.surface2, paddingTop: 4, paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 6, minHeight: 48 },
  icon: { width: 22, height: 22 },
  label: { fontSize: 11, fontWeight: "600" },
});
