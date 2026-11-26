// Screen header: back button + serif title (+ optional right-side element).
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStrings } from "../i18n";
import { DISPLAY } from "./fonts";
import { P } from "./palette";

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  /** No back button without it (e.g. a tab). */
  onBack?: () => void;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const str = useStrings();
  return (
    <View style={[s.header, { paddingTop: insets.top + 8 }]}>
      {onBack ? (
        <Pressable onPress={onBack} style={s.back} accessibilityRole="button" accessibilityLabel={str.common.back} hitSlop={6}>
          <Text style={s.backText}>‹</Text>
        </Pressable>
      ) : (
        <View style={{ width: 4 }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={s.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingBottom: 8 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  backText: { color: P.textSoft, fontSize: 34, lineHeight: 36 },
  title: { color: P.text, fontSize: 26, fontFamily: DISPLAY },
  subtitle: { color: P.muted, fontSize: 12 },
});
