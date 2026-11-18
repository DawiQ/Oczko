// Form controls of the dark UI: segmented choice, − n + counter, switch row,
// section label. Touch targets ≥ 44 px.
import { Pressable, StyleSheet, Switch, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useStrings } from "../i18n";
import { DISPLAY } from "./fonts";
import { P } from "./palette";

export function Label({ children }: { children: string }) {
  return (
    <Text style={s.label} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  style,
}: {
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  /** For screen readers: what is being chosen. */
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.seg, style]} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            style={[s.segItem, on && s.segOn]}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={o.sub ? `${o.label}, ${o.sub}` : o.label}
          >
            <Text style={[s.segText, on && s.segTextOn]}>{o.label}</Text>
            {o.sub ? <Text style={s.segSub}>{o.sub}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function Counter({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const str = useStrings();
  return (
    <View
      style={[s.counter, value === 0 && s.counterZero]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[
        { name: "increment", label: str.ui.more },
        { name: "decrement", label: str.ui.less },
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === "increment" && value < max) onChange(value + 1);
        if (e.nativeEvent.actionName === "decrement" && value > min) onChange(value - 1);
      }}
    >
      <Pressable style={s.counterBtn} onPress={() => value > min && onChange(value - 1)} disabled={value <= min} accessibilityLabel={str.ui.counterLess(label)} hitSlop={4}>
        <Text style={[s.counterSign, value <= min && s.dim]}>−</Text>
      </Pressable>
      <Text style={[s.counterValue, value === 0 && { color: P.muted }]}>{value}</Text>
      <Pressable style={s.counterBtn} onPress={() => value < max && onChange(value + 1)} disabled={value >= max} accessibilityLabel={str.ui.counterMore(label)} hitSlop={4}>
        <Text style={[s.counterSign, value >= max && s.dim]}>+</Text>
      </Pressable>
    </View>
  );
}

export function SwitchRow({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable style={s.switchRow} onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} accessibilityHint={sub}>
      <View style={{ flex: 1 }}>
        <Text style={s.switchText}>{label}</Text>
        {sub ? <Text style={s.switchSub}>{sub}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: P.accent, false: P.line }} thumbColor={P.text} importantForAccessibility="no" />
    </Pressable>
  );
}

const s = StyleSheet.create({
  label: { color: P.muted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.7, marginTop: 14, marginBottom: 7 },
  seg: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  segItem: {
    flex: 1,
    minWidth: 64,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: P.surface2,
    borderWidth: 1,
    borderColor: P.line,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  segOn: { borderColor: P.accent, backgroundColor: "#3A2C25" },
  segText: { color: P.textSoft, fontSize: 13.5, fontWeight: "700", textAlign: "center" },
  segTextOn: { color: P.text },
  segSub: { color: P.muted, fontSize: 10.5, marginTop: 2, textAlign: "center" },
  counter: { flexDirection: "row", alignItems: "center", backgroundColor: P.surface2, borderRadius: 12, borderWidth: 1, borderColor: P.line },
  counterZero: { opacity: 0.85 },
  counterBtn: { width: 36, height: 44, alignItems: "center", justifyContent: "center" },
  counterSign: { color: P.textSoft, fontSize: 20, fontWeight: "700" },
  counterValue: { width: 22, textAlign: "center", color: P.text, fontFamily: DISPLAY, fontSize: 17 },
  dim: { opacity: 0.3 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: P.line },
  switchText: { color: P.text, fontSize: 15, fontWeight: "600" },
  switchSub: { color: P.muted, fontSize: 12, marginTop: 2 },
});
