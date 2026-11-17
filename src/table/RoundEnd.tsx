// The end of a round (who scores, every hand, the points so far) and the end
// of the match (podium, confetti, rematch).
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { GameSnapshot, SeatInfo } from "../game/TableGame";
import { Button3D } from "../ui/Button3D";
import { CardFace } from "../ui/cards";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { Portrait } from "../ui/Portrait";
import { Confetti } from "./Effects";
import { headline } from "./texts";

function Pill({ text, tone }: { text: string; tone: "accent" | "bust" | "muted" }) {
  return (
    <View style={[s.pill, tone === "accent" ? s.pillAccent : tone === "bust" ? s.pillBust : s.pillMuted]}>
      <Text style={[s.pillText, { color: tone === "accent" ? P.onAccent : tone === "bust" ? P.danger : P.muted }]}>{text}</Text>
    </View>
  );
}

function outcome(snap: GameSnapshot, seat: SeatInfo): { text: string; tone: "accent" | "bust" | "muted" } {
  const pts = snap.result?.points[seat.seat] ?? 0;
  if (pts > 0) return { text: `+${pts}`, tone: "accent" };
  if (seat.value?.bust) return { text: "Fura", tone: "bust" };
  const duel = snap.result?.duels?.find((d) => d.seat === seat.seat);
  if (duel?.winner === "none") return { text: "remis", tone: "muted" };
  return { text: "—", tone: "muted" };
}

/** Points so far as bars towards the target. */
export function ScoreBars({ snap }: { snap: GameSnapshot }) {
  const max = Math.max(snap.target, ...snap.scores);
  const order = [...snap.seats].sort((a, b) => b.score - a.score);
  return (
    <View style={{ gap: 6 }} accessibilityLabel={`Punkty: ${order.map((x) => `${x.name} ${x.score}`).join(", ")}, do ${snap.target}`}>
      {order.map((x) => (
        <View key={x.seat} style={s.barRow}>
          <Text style={s.barName} numberOfLines={1}>
            {x.name}
          </Text>
          <View style={s.track}>
            <View style={[s.fill, { width: `${Math.min(100, (x.score / max) * 100)}%`, backgroundColor: x.seat === snap.me ? P.accent : x.color }]} />
          </View>
          <Text style={s.barScore}>{x.score}</Text>
        </View>
      ))}
    </View>
  );
}

export function RoundEndPanel({ snap, onNext, onReplay }: { snap: GameSnapshot; onNext: () => void; onReplay?: () => void }) {
  const insets = useSafeAreaInsets();
  const h = headline(snap);
  const order = snap.view.bank === null ? snap.seats : [...snap.seats.filter((x) => !x.isBank), ...snap.seats.filter((x) => x.isBank)];
  return (
    <View style={[s.panel, { paddingBottom: insets.bottom + 14 }]} accessibilityViewIsModal>
      <View style={s.grab} />
      <View style={s.headRow}>
        <Text style={s.title} accessibilityRole="header" accessibilityLiveRegion="polite">
          {h.title}
        </Text>
        {(snap.result?.points[snap.me] ?? 0) > 0 && <Pill text={`+${snap.result!.points[snap.me]}`} tone="accent" />}
      </View>
      <Text style={s.sub}>{h.sub}</Text>
      <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ paddingVertical: 4 }}>
        {order.map((x) => {
          const o = outcome(snap, x);
          return (
            <View key={x.seat} style={s.row} accessible accessibilityLabel={`${x.name}${x.isBank ? " (bank)" : ""}: ${x.value?.persian ? "perskie oczko" : x.value?.bust ? `fura ${x.value.total}` : x.value?.total ?? ""}, ${o.text}`}>
              <Portrait name={x.name} size={30} color={x.color} />
              <Text style={s.who} numberOfLines={1}>
                {x.name}
                {x.isBank ? " · bank" : ""}
              </Text>
              <View style={s.hand}>
                {(x.hand ?? []).map((c, i) => (
                  <CardFace key={c} card={c} size="sm" style={{ marginLeft: i ? -12 : 0 }} />
                ))}
              </View>
              <Text style={[s.val, x.value?.bust && { color: P.danger }]}>{x.value?.persian ? "AA" : x.value?.total ?? ""}</Text>
              <View style={{ width: 52, alignItems: "flex-end" }}>
                <Pill text={o.text} tone={o.tone} />
              </View>
            </View>
          );
        })}
      </ScrollView>
      <Text style={s.label}>{`Punkty · do ${snap.target}`}</Text>
      <ScoreBars snap={snap} />
      <View style={{ gap: 10, marginTop: 14 }}>
        {snap.canReplay && onReplay && <Button3D label="Ta runda jeszcze raz" tone="dark" height={46} onPress={onReplay} />}
        <Button3D label="Następna runda" big onPress={onNext} testID="next-round" />
      </View>
    </View>
  );
}

export function MatchEndPanel({
  snap,
  onRematch,
  onNewGame,
  onExit,
  onReplay,
  reduceMotion,
}: {
  snap: GameSnapshot;
  onRematch: () => void;
  onNewGame: () => void;
  onExit: () => void;
  onReplay?: () => void;
  reduceMotion: boolean;
}) {
  const insets = useSafeAreaInsets();
  const h = headline(snap);
  const ranked = [...snap.seats].sort((a, b) => b.score - a.score);
  const podium = [ranked[1], ranked[0], ranked[2]].filter(Boolean) as SeatInfo[];
  const won = snap.winner === snap.me;
  return (
    <View style={[s.full, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 16 }]} accessibilityViewIsModal>
      {won && <Confetti reduceMotion={reduceMotion} count={34} />}
      <Text style={s.subTop}>{h.sub}</Text>
      <Text style={s.big} accessibilityRole="header" accessibilityLiveRegion="polite">
        {h.title}
      </Text>
      <View style={s.podium}>
        {podium.map((x) => {
          const place = ranked.indexOf(x) + 1;
          const top = place === 1;
          return (
            <View key={x.seat} style={s.step} accessible accessibilityLabel={`${place}. miejsce: ${x.name}, ${x.score} pkt`}>
              {top && <Text style={s.crown}>★</Text>}
              <Portrait name={x.name} size={top ? 70 : 54} color={x.color} ring={x.color} />
              <Text style={s.stepName} numberOfLines={1}>
                {x.name}
              </Text>
              <View style={[s.block, { height: top ? 120 : place === 2 ? 88 : 66 }, top && { backgroundColor: P.accent }]}>
                <Text style={[s.blockScore, top && { color: P.onAccent }]}>{x.score}</Text>
                <Text style={[s.blockPlace, top && { color: P.onAccent }]}>{`${place}. miejsce`}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ gap: 10, width: "100%" }}>
        {snap.canReplay && onReplay && <Button3D label="Ta runda jeszcze raz" tone="dark" height={46} onPress={onReplay} />}
        <Button3D label="Rewanż" big onPress={onRematch} testID="rematch" accessibilityHint="Ci sami rywale, nowe karty" />
        <Button3D label="Nowa gra" tone="dark" height={48} onPress={onNewGame} />
        <Button3D label="Do lobby" tone="dark" height={44} onPress={onExit} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: P.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: P.line,
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 40,
    elevation: 40,
  },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: P.line, alignSelf: "center", marginBottom: 10 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 21, flex: 1 },
  sub: { color: P.muted, fontSize: 13, marginTop: 2, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: P.line },
  who: { width: 74, color: P.text, fontSize: 13, fontWeight: "700" },
  hand: { flex: 1, flexDirection: "row" },
  val: { width: 34, textAlign: "right", color: P.text, fontFamily: DISPLAY, fontSize: 17 },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  pillAccent: { backgroundColor: P.accent },
  pillBust: { backgroundColor: P.dangerBg },
  pillMuted: { backgroundColor: "rgba(255,255,255,0.07)" },
  pillText: { fontSize: 11, fontWeight: "800" },
  label: { color: P.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", marginTop: 12, marginBottom: 6 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barName: { width: 64, color: P.textSoft, fontSize: 12, fontWeight: "700" },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  barScore: { width: 24, textAlign: "right", color: P.text, fontFamily: DISPLAY, fontSize: 14 },
  full: { ...StyleSheet.absoluteFill, backgroundColor: P.bg, alignItems: "center", paddingHorizontal: 16, zIndex: 50, elevation: 50 },
  subTop: { color: P.muted, fontSize: 13 },
  big: { color: P.text, fontFamily: DISPLAY, fontSize: 30, textAlign: "center", marginTop: 4 },
  podium: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginTop: 30 },
  step: { width: 96, alignItems: "center", gap: 6 },
  crown: { color: P.accent, fontSize: 26, marginBottom: -4 },
  stepName: { color: P.text, fontSize: 13, fontWeight: "700" },
  block: { width: "100%", borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: P.surface2, borderWidth: 1, borderColor: P.line, alignItems: "center", justifyContent: "center" },
  blockScore: { color: P.text, fontFamily: DISPLAY, fontSize: 28 },
  blockPlace: { color: P.muted, fontSize: 11, fontWeight: "700" },
});
