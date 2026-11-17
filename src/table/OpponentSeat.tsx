// A rival at the table: portrait (in the seat's colour, with the score),
// name, the cards (backs, or faces once shown), status, bank / dealer marks.
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { SeatInfo } from "../game/TableGame";
import { CardBack, CardFace } from "../ui/cards";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { plural } from "../ui/plural";
import { Portrait } from "../ui/Portrait";
import { PORTRAIT_SIZE, type SeatSize } from "./layout";
import { statusLabel } from "./texts";

/** A card that flips into view (scaleX 0 → 1) when it appears. */
export function FlipIn({ children, delay = 0, reduceMotion }: { children: React.ReactNode; delay?: number; reduceMotion: boolean }) {
  const v = useState(() => new Animated.Value(reduceMotion ? 1 : 0))[0];
  useEffect(() => {
    if (reduceMotion) return;
    Animated.timing(v, { toValue: 1, duration: 220, delay, useNativeDriver: true }).start();
  }, [v, delay, reduceMotion]);
  return <Animated.View style={{ transform: [{ scaleX: v }], opacity: v }}>{children}</Animated.View>;
}

/** A small "pop" when the value changes (the score). */
function Pop({ value, children, reduceMotion }: { value: number; children: React.ReactNode; reduceMotion: boolean }) {
  const s = useState(() => new Animated.Value(1))[0];
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion) return;
    s.setValue(1.6);
    Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [value, s, reduceMotion]);
  return <Animated.View style={{ transform: [{ scale: s }] }}>{children}</Animated.View>;
}

export function seatA11y(seat: SeatInfo): string {
  const parts = [seat.name, `${seat.cards} ${plural(seat.cards, "karta", "karty", "kart")}`];
  const st = statusLabel(seat);
  if (st) parts.push(st);
  if (seat.value && !seat.value.persian) parts.push(seat.value.bust ? `fura, ${seat.value.total}` : `wynik ${seat.value.total}`);
  if (seat.isBank) parts.push("bank");
  if (seat.isDealer) parts.push("rozdaje");
  parts.push(`${seat.score} ${plural(seat.score, "punkt", "punkty", "punktów")}`);
  return parts.join(", ");
}

export function OpponentSeat({ seat, size, reduceMotion }: { seat: SeatInfo; size: SeatSize; reduceMotion: boolean }) {
  const p = PORTRAIT_SIZE[size];
  const status = statusLabel(seat);
  const shown = seat.hand;
  return (
    <View style={[s.seat, { width: p + 56 }, seat.status === "bust" && s.dim]} accessible accessibilityLabel={seatA11y(seat)}>
      <View>
        <Portrait name={seat.name} size={p} color={seat.color} ring={seat.color} />
        <View style={[s.score, { borderColor: seat.color }]}>
          <Pop value={seat.score} reduceMotion={reduceMotion}>
            <Text style={s.scoreText}>{seat.score}</Text>
          </Pop>
        </View>
        {seat.isBank && (
          <View style={s.bank}>
            <Text style={s.bankText}>BANK</Text>
          </View>
        )}
        {seat.isDealer && !seat.isBank && (
          <View style={s.dealer}>
            <Text style={s.dealerText}>R</Text>
          </View>
        )}
      </View>
      <Text style={[s.name, size === "sm" && s.nameSm]} numberOfLines={1}>
        {seat.name}
      </Text>
      <View style={s.cards}>
        {shown
          ? shown.map((c, i) => (
              <View key={c} style={{ marginLeft: i ? (size === "sm" ? -18 : -14) : 0 }}>
                <FlipIn delay={i * 60} reduceMotion={reduceMotion}>
                  <CardFace card={c} size="sm" />
                </FlipIn>
              </View>
            ))
          : Array.from({ length: seat.cards }, (_, i) => (
              <View key={i} style={{ marginLeft: i ? -13 : 0 }}>
                <FlipIn reduceMotion={reduceMotion}>
                  <CardBack size="xs" />
                </FlipIn>
              </View>
            ))}
      </View>
      {seat.value && !seat.value.bust && !seat.value.persian && <Text style={s.total}>{seat.value.total}</Text>}
      {status && (
        <View style={[s.pill, pillStyle(seat)]}>
          <Text style={[s.pillText, pillText(seat)]}>{status}</Text>
        </View>
      )}
    </View>
  );
}

function pillStyle(seat: SeatInfo) {
  if (seat.thinking) return s.pillThink;
  if (seat.persian) return s.pillAccent;
  if (seat.status === "bust") return s.pillBust;
  if (seat.status === "stood" || seat.status === "maxed") return s.pillOk;
  return s.pillThink;
}
function pillText(seat: SeatInfo) {
  if (seat.persian) return { color: P.onAccent };
  if (seat.status === "bust" && !seat.thinking) return { color: P.danger, fontFamily: DISPLAY, fontWeight: "normal" as const };
  if ((seat.status === "stood" || seat.status === "maxed") && !seat.thinking) return { color: P.ok };
  return { color: P.feltText };
}

const s = StyleSheet.create({
  seat: { alignItems: "center", gap: 3 },
  dim: { opacity: 0.75 },
  score: {
    position: "absolute",
    right: -8,
    bottom: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    backgroundColor: P.bg,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: { color: P.text, fontFamily: DISPLAY, fontSize: 12 },
  bank: { position: "absolute", top: -10, alignSelf: "center", backgroundColor: P.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, elevation: 3 },
  bankText: { color: P.onAccent, fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },
  dealer: { position: "absolute", left: -8, top: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: "#F3EEE2", alignItems: "center", justifyContent: "center", elevation: 3 },
  dealerText: { color: P.black, fontFamily: DISPLAY, fontSize: 11 },
  name: { color: P.feltText, fontSize: 12, fontWeight: "700", maxWidth: 100 },
  nameSm: { fontSize: 10.5 },
  cards: { flexDirection: "row", minHeight: 32, alignItems: "center" },
  total: { color: P.text, fontFamily: DISPLAY, fontSize: 13 },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontSize: 11, fontWeight: "700" },
  pillThink: { backgroundColor: "rgba(255,255,255,0.12)" },
  pillOk: { backgroundColor: "rgba(111,207,151,0.16)" },
  pillBust: { backgroundColor: P.dangerBg, borderWidth: 1.5, borderColor: P.danger, transform: [{ rotate: "-6deg" }] },
  pillAccent: { backgroundColor: P.accent },
});
