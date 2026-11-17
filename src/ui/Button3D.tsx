// Chunky "physical" game button: a coloured face on a darker base that sinks
// when pressed.
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { DISPLAY } from "./fonts";
import { P } from "./palette";

export type Button3DTone = "accent" | "dark" | "off";

export const TONES: Record<Button3DTone, { face: string; base: string; text: string }> = {
  accent: { face: P.accent, base: P.accentDark, text: P.onAccent },
  dark: { face: "#22313F", base: "#121C26", text: P.text },
  off: { face: "#2A3A4B", base: "#18222D", text: P.muted },
};

const DEPTH = 5;

export function Button3D({
  label,
  children,
  tone = "accent",
  onPress,
  disabled,
  height = 58,
  big,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: {
  label?: string;
  children?: ReactNode;
  tone?: Button3DTone;
  onPress?: () => void;
  disabled?: boolean;
  height?: number;
  /** Display font (main call to action). */
  big?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}) {
  const [down, setDown] = useState(false);
  const t = TONES[disabled ? "off" : tone];
  const sink = down && !disabled ? DEPTH - 1 : 0;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={[{ height: height + DEPTH }, style]}
    >
      <View style={[s.base, { height, top: DEPTH, backgroundColor: t.base }]} />
      <View style={[s.face, { height, transform: [{ translateY: sink }], backgroundColor: t.face }]}>
        {label !== undefined ? (
          <Text
            style={[s.text, { color: t.text }, big && s.big]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {label}
          </Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { position: "absolute", left: 0, right: 0, borderRadius: 18 },
  face: { borderRadius: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  text: { fontSize: 17, fontWeight: "800" },
  big: { fontFamily: DISPLAY, fontWeight: "normal", fontSize: 22 },
});
