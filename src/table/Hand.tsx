// My hand: a fan of face-up cards with the total beside it. A new card flies
// in from the stock and turns over.
import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { Card } from "../engine/cards";
import type { HandValue } from "../engine/score";
import { useStrings } from "../i18n";
import { CardFace } from "../ui/cards";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { fanCard } from "./layout";

function FlyIn({ children, reduceMotion, animate }: { children: React.ReactNode; reduceMotion: boolean; animate: boolean }) {
  const v = useState(() => new Animated.Value(animate && !reduceMotion ? 0 : 1))[0];
  useEffect(() => {
    if (!animate || reduceMotion) return;
    Animated.timing(v, { toValue: 1, duration: 340, useNativeDriver: true }).start();
  }, [v, animate, reduceMotion]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-240, 0] });
  const scaleX = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.05, 0.05, 1] });
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  return <Animated.View style={{ opacity: v, transform: [{ translateY }, { scale }, { scaleX }] }}>{children}</Animated.View>;
}

export function Hand({ cards, value, reduceMotion, highlight }: { cards: Card[]; value: HandValue; reduceMotion: boolean; highlight?: boolean }) {
  // Cards present at the first render (a resumed game) do not fly in.
  const initial = useState(() => new Set(cards))[0];
  const str = useStrings();
  const t = str.table.myHand;
  const n = cards.length;
  return (
    <View style={s.wrap} pointerEvents="none">
      <View style={s.fan} accessible accessibilityLabel={t.label(value)}>
        {cards.map((c, i) => {
          const f = fanCard(i, n);
          return (
            <View key={c} style={[s.card, { transform: [{ translateX: f.dx }, { translateY: f.dy }, { rotate: `${f.rotate}deg` }] }]}>
              <FlyIn reduceMotion={reduceMotion} animate={!initial.has(c)}>
                <CardFace card={c} size="lg" highlight={highlight} />
              </FlyIn>
            </View>
          );
        })}
      </View>
      <View style={[s.total, value.bust && s.totalBust, value.persian && s.totalPersian, value.total === 21 && !value.bust && s.total21]}>
        <Text style={[s.totalText, value.persian && { color: P.onAccent, fontSize: 20 }]} accessibilityElementsHidden>
          {value.persian ? str.table.persianShort : value.total}
        </Text>
        <Text style={s.totalLabel} numberOfLines={1}>
          {value.persian ? t.persian : value.special ? str.table.specials[value.special] : value.bust ? t.bust : value.soft ? t.soft : str.common.you}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { height: 132, width: "100%", alignItems: "center", justifyContent: "flex-end" },
  fan: { width: 66, height: 120, alignItems: "center", justifyContent: "flex-end" },
  card: { position: "absolute", bottom: 6 },
  total: {
    position: "absolute",
    right: 18,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 2,
    borderColor: P.feltMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  total21: { borderColor: P.accent },
  totalBust: { borderColor: P.danger, backgroundColor: P.dangerBg },
  totalPersian: { backgroundColor: P.accent, borderColor: P.accentDark },
  totalText: { color: "#fff", fontFamily: DISPLAY, fontSize: 26, lineHeight: 30 },
  totalLabel: { position: "absolute", bottom: -18, color: P.feltMuted, fontSize: 10, fontWeight: "600" },
});
