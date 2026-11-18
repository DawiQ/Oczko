// Table effects: the "Fura!" stamp, the "Perskie oczko!" moment, confetti.
// Native-driver animations; with "reduce motion" they just appear.
import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import type { Card } from "../engine/cards";
import { useStrings } from "../i18n";
import { CardFace } from "../ui/cards";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";

export function FuraStamp({ reduceMotion }: { reduceMotion: boolean }) {
  const str = useStrings();
  const v = useState(() => new Animated.Value(reduceMotion ? 1 : 0))[0];
  useEffect(() => {
    if (reduceMotion) return;
    Animated.spring(v, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [v, reduceMotion]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [2.2, 1] });
  return (
    <Animated.View style={[s.stamp, { opacity: v, transform: [{ rotate: "-10deg" }, { scale }] }]} pointerEvents="none" accessibilityElementsHidden>
      <Text style={s.stampText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{str.table.effects.fura}</Text>
    </Animated.View>
  );
}

const RAYS = 14;
const COLORS = ["#E8925A", "#7FD3E6", "#FF8FA3", "#6FCF97", "#B39DFF", "#F3EEE2", "#F0B44C"];

/** Falling confetti (once). */
export function Confetti({ count = 28, reduceMotion }: { count?: number; reduceMotion: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 37) % 100,
        delay: (i * 53) % 600,
        rot: (i * 47) % 360,
        color: COLORS[i % COLORS.length],
        v: new Animated.Value(0),
      })),
    [count]
  );
  useEffect(() => {
    if (reduceMotion) return;
    Animated.parallel(
      pieces.map((p) => Animated.timing(p.v, { toValue: 1, duration: 2200, delay: p.delay, easing: Easing.in(Easing.quad), useNativeDriver: true }))
    ).start();
  }, [pieces, reduceMotion]);
  if (reduceMotion) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            s.confetti,
            {
              left: `${p.x}%`,
              backgroundColor: p.color,
              opacity: p.v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
              transform: [
                { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [-40, 720] }) },
                { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: [`${p.rot}deg`, `${p.rot + 540}deg`] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

/** "Perskie oczko!": rays, two aces flying in, the title; closes by itself. */
export function PersianOverlay({ name, aces, onDone, reduceMotion }: { name: string | null; aces: Card[]; onDone: () => void; reduceMotion: boolean }) {
  const t = useStrings().table.effects;
  const enter = useState(() => new Animated.Value(reduceMotion ? 1 : 0))[0];
  const spin = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const anims: Animated.CompositeAnimation[] = [];
    if (!reduceMotion) {
      anims.push(Animated.spring(enter, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }));
      anims.push(Animated.loop(Animated.timing(spin, { toValue: 1, duration: 9000, easing: Easing.linear, useNativeDriver: true })));
      anims.forEach((a) => a.start());
    }
    const t = setTimeout(onDone, reduceMotion ? 1600 : 2300);
    return () => {
      clearTimeout(t);
      anims.forEach((a) => a.stop());
    };
  }, [enter, spin, onDone, reduceMotion]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  return (
    <Pressable style={s.overlay} onPress={onDone} accessibilityViewIsModal accessibilityRole="alert" accessibilityLabel={t.persianA11y(name)}>
      <Animated.View style={[s.rays, { transform: [{ rotate }] }]} pointerEvents="none">
        {Array.from({ length: RAYS }, (_, i) => (
          <View key={i} style={[s.ray, { transform: [{ rotate: `${(i * 180) / RAYS}deg` }] }]} />
        ))}
      </Animated.View>
      <Animated.View style={{ alignItems: "center", opacity: enter, transform: [{ scale }] }}>
        <View style={s.aces}>
          {aces.map((c, i) => (
            <CardFace key={c} card={c} size="lg" style={{ transform: [{ rotate: i ? "10deg" : "-10deg" }, { translateX: i ? -8 : 8 }] }} />
          ))}
        </View>
        <Text style={s.title}>{t.persianTitle}</Text>
        <Text style={s.sub}>{t.persianSub(name)}</Text>
      </Animated.View>
      <Confetti reduceMotion={reduceMotion} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  stamp: {
    position: "absolute",
    alignSelf: "center",
    bottom: 70,
    borderWidth: 4,
    borderColor: P.danger,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
    backgroundColor: "rgba(58,29,34,0.88)",
  },
  stampText: { color: P.danger, fontFamily: DISPLAY, fontSize: 34 },
  confetti: { position: "absolute", top: 0, width: 8, height: 14, borderRadius: 2 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(6,10,14,0.66)", alignItems: "center", justifyContent: "center", zIndex: 60, elevation: 60 },
  rays: { position: "absolute", width: 560, height: 560, alignItems: "center", justifyContent: "center" },
  ray: { position: "absolute", width: 560, height: 26, backgroundColor: "rgba(232,146,90,0.18)" },
  aces: { flexDirection: "row", marginBottom: 18 },
  title: { color: P.accent, fontFamily: DISPLAY, fontSize: 40, lineHeight: 42, textAlign: "center", transform: [{ rotate: "-4deg" }], textShadowColor: P.accentDark, textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 0 },
  sub: { color: P.feltText, fontSize: 14, fontWeight: "600", marginTop: 14, textAlign: "center", paddingHorizontal: 24 },
});
