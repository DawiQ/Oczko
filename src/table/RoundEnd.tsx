// The end of a round (who scores, every hand, the points so far) and the end
// of the match (podium, confetti, rematch).
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { GameSnapshot, SeatInfo } from "../game/TableGame";
import { useStrings, type Strings } from "../i18n";
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

function outcome(snap: GameSnapshot, seat: SeatInfo, s: Strings): { text: string; tone: "accent" | "bust" | "muted" } {
  const pts = snap.result?.points[seat.seat] ?? 0;
  if (pts > 0) return { text: `+${pts}`, tone: "accent" };
  if (seat.value?.bust) return { text: s.table.roundEnd.bust, tone: "bust" };
  const duel = snap.result?.duels?.find((d) => d.seat === seat.seat);
  if (duel?.winner === "none") return { text: s.table.roundEnd.draw, tone: "muted" };
  return { text: "—", tone: "muted" };
}

/** Points so far as bars towards the target. */
export function ScoreBars({ snap }: { snap: GameSnapshot }) {
  const str = useStrings();
  const max = Math.max(snap.target, ...snap.scores);
  const order = [...snap.seats].sort((a, b) => b.score - a.score);
  return (
    <View style={{ gap: 6 }} accessibilityLabel={str.table.roundEnd.scores(order, snap.target)}>
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

export function RoundEndPanel({ snap, onNext, onReplay }: { snap: GameSnapshot; /** Absent at a Wi‑Fi guest's table: the host deals. */ onNext?: () => void; onReplay?: () => void }) {
  const insets = useSafeAreaInsets();
  const str = useStrings();
  const t = str.table.roundEnd;
  const h = headline(snap, str);
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
          const o = outcome(snap, x, str);
          // Pontoon / five cards: why a lower total wins.
          const special = x.value?.special ? str.table.specials[x.value.special] : null;
          return (
            <View key={x.seat} style={s.row} accessible accessibilityLabel={t.row(x.name, x.isBank, x.value, special ? `${special}, ${o.text}` : o.text)}>
              <Portrait name={x.name} persona={x.persona} size={30} color={x.color} />
              <View style={s.who}>
                <Text style={s.whoText} numberOfLines={1}>
                  {t.who(x.name, x.isBank)}
                </Text>
                {special && (
                  <Text style={s.special} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                    {special}
                  </Text>
                )}
              </View>
              <View style={s.hand}>
                {(x.hand ?? []).map((c, i) => (
                  <CardFace key={c} card={c} size="sm" style={{ marginLeft: i ? -12 : 0 }} />
                ))}
              </View>
              <Text style={[s.val, x.value?.bust && { color: P.danger }, special !== null && { color: P.accent }]}>{x.value?.persian ? str.table.persianShort : x.value?.total ?? ""}</Text>
              <View style={{ width: 52, alignItems: "flex-end" }}>
                <Pill text={o.text} tone={o.tone} />
              </View>
            </View>
          );
        })}
      </ScrollView>
      <Text style={s.label}>{str.table.pointsTo(snap.target)}</Text>
      <ScoreBars snap={snap} />
      <View style={{ gap: 10, marginTop: 14 }}>
        {snap.canReplay && onReplay && <Button3D label={t.replay} tone="dark" height={46} onPress={onReplay} />}
        {onNext ? (
          <Button3D label={t.next} big onPress={onNext} testID="next-round" />
        ) : (
          <Text style={s.wait} accessibilityLiveRegion="polite">
            {t.hostDeals}
          </Text>
        )}
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
  newBadges = [],
}: {
  snap: GameSnapshot;
  /** Badges earned in this match (names and descriptions). */
  newBadges?: { name: string; desc: string }[];
  /** Absent at a Wi‑Fi guest's table (the host decides). */
  onRematch?: () => void;
  onNewGame?: () => void;
  onExit: () => void;
  onReplay?: () => void;
  reduceMotion: boolean;
}) {
  const insets = useSafeAreaInsets();
  const str = useStrings();
  const t = str.table.matchEnd;
  const h = headline(snap, str);
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
            <View key={x.seat} style={s.step} accessible accessibilityLabel={t.placeA11y(place, x.name, x.score)}>
              {top && <Text style={s.crown}>★</Text>}
              <Portrait name={x.name} persona={x.persona} size={top ? 70 : 54} color={x.color} ring={x.color} />
              <Text style={s.stepName} numberOfLines={1}>
                {x.name}
              </Text>
              <View style={[s.block, { height: top ? 120 : place === 2 ? 88 : 66 }, top && { backgroundColor: P.accent }]}>
                <Text style={[s.blockScore, top && { color: P.onAccent }]}>{x.score}</Text>
                <Text style={[s.blockPlace, top && { color: P.onAccent }]}>{t.place(place)}</Text>
              </View>
            </View>
          );
        })}
      </View>
      {newBadges.map((b) => (
        <View key={b.name} style={s.newBadge} accessible accessibilityLabel={t.badgeA11y(b.name, b.desc)}>
          <Text style={s.newBadgeIcon}>★</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.newBadgeTitle}>{t.badge(b.name)}</Text>
            <Text style={s.newBadgeDesc}>{b.desc}</Text>
          </View>
        </View>
      ))}
      <View style={{ flex: 1 }} />
      <View style={{ gap: 10, width: "100%" }}>
        {snap.canReplay && onReplay && <Button3D label={str.table.roundEnd.replay} tone="dark" height={46} onPress={onReplay} />}
        {onRematch && <Button3D label={t.rematch} big onPress={onRematch} testID="rematch" accessibilityHint={t.rematchHint} />}
        {onNewGame && <Button3D label={t.newGame} tone="dark" height={48} onPress={onNewGame} />}
        <Button3D label={t.lobby} tone="dark" height={44} onPress={onExit} />
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
  who: { width: 74 },
  whoText: { color: P.text, fontSize: 13, fontWeight: "700" },
  special: { color: P.accent, fontSize: 11, fontWeight: "700" },
  hand: { flex: 1, flexDirection: "row" },
  val: { width: 34, textAlign: "right", color: P.text, fontFamily: DISPLAY, fontSize: 17 },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  pillAccent: { backgroundColor: P.accent },
  pillBust: { backgroundColor: P.dangerBg },
  pillMuted: { backgroundColor: "rgba(255,255,255,0.07)" },
  pillText: { fontSize: 11, fontWeight: "800" },
  label: { color: P.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", marginTop: 12, marginBottom: 6 },
  wait: { color: P.muted, fontSize: 14, textAlign: "center", paddingVertical: 14 },
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
  newBadge: { flexDirection: "row", alignItems: "center", gap: 10, width: "100%", backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 14, padding: 10, marginTop: 12 },
  newBadgeIcon: { color: P.accent, fontSize: 22 },
  newBadgeTitle: { color: P.text, fontSize: 13, fontWeight: "700" },
  newBadgeDesc: { color: P.muted, fontSize: 11.5 },
  blockPlace: { color: P.muted, fontSize: 11, fontWeight: "700" },
});
