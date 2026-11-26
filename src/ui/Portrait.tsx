// Round character portrait; a coloured initial for names without one.
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { PORTRAITS } from "./art";
import { P } from "./palette";

const COPIES = ["II", "III", "IV", "V", "VI", "VII", "VIII"];

/** "Hrabia II" → { base: "Hrabia", copy: "II" }; no number → copy "". */
export function splitCopy(name: string): { base: string; copy: string } {
  const i = name.lastIndexOf(" ");
  if (i > 0 && COPIES.includes(name.slice(i + 1))) return { base: name.slice(0, i), copy: name.slice(i + 1) };
  return { base: name, copy: "" };
}

export function Portrait({
  name,
  persona,
  size,
  color = P.accent,
  ring,
  style,
}: {
  name: string;
  /** A character's id: its portrait whatever the name's language. */
  persona?: string | null;
  size: number;
  /** Background of the initial when there is no portrait. */
  color?: string;
  /** A coloured ring around the portrait (the seat's colour). */
  ring?: string;
  style?: StyleProp<ViewStyle>;
}) {
  // "Hrabia II": Hrabia's portrait with a "II" badge (a copy at the table).
  const { base, copy } = splitCopy(name);
  const src = PORTRAITS[persona ?? base.toLowerCase()];
  const box = { width: size, height: size, borderRadius: size / 2 };
  const badge = Math.max(16, Math.round(size * 0.4));
  return (
    <View style={[{ width: size, height: size }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[box, s.wrap, ring ? { borderWidth: 3, borderColor: ring } : null]}>
        {src ? (
          <Image source={src} style={s.fill} />
        ) : (
          <View style={[s.fill, s.initial, { backgroundColor: color }]}>
            <Text style={[s.initialText, { fontSize: size * 0.42 }]}>{base.slice(0, 1)}</Text>
          </View>
        )}
      </View>
      {copy !== "" && (
        <View style={[s.copy, { minWidth: badge, height: badge, borderRadius: badge / 2, borderColor: color, right: -badge * 0.15, bottom: -badge * 0.15 }]}>
          <Text style={[s.copyText, { color, fontSize: Math.max(9, badge * 0.45) }]}>{copy}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { overflow: "hidden" },
  fill: { width: "100%", height: "100%" },
  initial: { alignItems: "center", justifyContent: "center" },
  initialText: { color: P.bg, fontWeight: "800" },
  copy: { position: "absolute", backgroundColor: P.bg, borderWidth: 2, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  copyText: { fontWeight: "800" },
});
