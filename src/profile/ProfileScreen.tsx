// "Profil": rank and progress, statistics (overall, per mode, per character),
// badges, the next rival, the history, reset. Layout: docs/mockups, screen 9.
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PERSONAS } from "../ai/personas";
import type { Stats } from "../storage/stats";
import { Button3D } from "../ui/Button3D";
import { Label } from "../ui/controls";
import { useConfirm } from "../ui/Dialog";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { Portrait } from "../ui/Portrait";
import { BADGES, earnedBadges, rankOf, ratios } from "./progress";
import { suggestNext } from "./suggest";

const pct = (x: number) => `${Math.round(x * 100)}%`;
const COLORS = ["#E8925A", "#7FD3E6", "#FF8FA3", "#6FCF97", "#B39DFF", "#F0B44C", "#7FA8FF"];

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.tile} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={s.tileValue}>{value}</Text>
      <Text style={s.tileLabel}>{label}</Text>
    </View>
  );
}

export function ProfileScreen({
  stats,
  onPlay,
  onHistory,
  onReset,
}: {
  stats: Stats;
  /** Play against a suggested character. */
  onPlay: (persona: string) => void;
  onHistory: () => void;
  onReset: () => void;
}) {
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const rank = rankOf(stats);
  const r = ratios(stats);
  const earned = new Set(earnedBadges(stats));
  const next = suggestNext(stats);
  const played = PERSONAS.filter((p) => (stats.byPersona[p.id]?.matches ?? 0) > 0);
  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: insets.top + 12 }]}>
      <Text style={s.h1} accessibilityRole="header">
        Profil
      </Text>
      <View style={s.rankCard} accessible accessibilityLabel={`Ranga: ${rank.name}, ${rank.xp} punktów doświadczenia${rank.next ? `, do rangi ${rank.next.name}: ${rank.next.at - rank.xp}` : ""}`}>
        <View style={s.rankBadge}>
          <Text style={s.rankBadgeText}>21</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.small}>Ranga</Text>
          <Text style={s.rankName}>{rank.name}</Text>
          <View style={s.track}>
            <View style={[s.fill, { width: `${Math.round(rank.progress * 100)}%` }]} />
          </View>
          <Text style={s.small}>{rank.next ? `${rank.xp} / ${rank.next.at} do rangi „${rank.next.name}”` : `${rank.xp} — najwyższa ranga`}</Text>
        </View>
      </View>

      <View style={s.tiles}>
        <Tile value={String(stats.matches)} label="partii" />
        <Tile value={pct(r.winMatches)} label="wygranych" />
        <Tile value={pct(r.bust)} label="rund z furą" />
      </View>
      <View style={s.tiles}>
        <Tile value={String(stats.rounds)} label="rund" />
        <Tile value={pct(r.winRounds)} label="rund z punktem" />
        <Tile value={stats.stands ? r.standAvg.toFixed(1).replace(".", ",") : "—"} label="średnio przy „Starczy”" />
      </View>

      <Label>{`Odznaki · ${earned.size} z ${BADGES.length}`}</Label>
      <View style={s.badges}>
        {BADGES.map((b, i) => {
          const on = earned.has(b.id);
          const c = COLORS[i % COLORS.length];
          return (
            <View key={b.id} style={[s.badge, !on && s.locked]} accessible accessibilityLabel={`${b.name}: ${b.desc}${on ? "" : " (jeszcze nie zdobyta)"}`}>
              <View style={[s.badgeIcon, { backgroundColor: on ? `${c}33` : P.surface }]}>
                <Text style={[s.badgeIconText, { color: on ? c : P.muted }]}>{b.icon}</Text>
              </View>
              <Text style={s.badgeName} numberOfLines={2}>
                {b.name}
              </Text>
            </View>
          );
        })}
      </View>

      {next && (
        <View style={s.panel}>
          <Portrait name={next.persona.name} size={42} color={next.persona.color} />
          <View style={{ flex: 1 }}>
            <Text style={s.small}>Następny rywal</Text>
            <Text style={s.name}>{next.persona.name}</Text>
            <Text style={s.small}>{next.reason}</Text>
          </View>
          <Button3D label="Zagraj" height={42} style={{ width: 92 }} onPress={() => onPlay(next.persona.id)} />
        </View>
      )}

      <Label>Tryby</Label>
      <View style={s.panel2}>
        {(["family", "bank"] as const).map((m) => {
          const x = stats.byMode[m];
          return (
            <View key={m} style={s.line}>
              <Text style={s.lineName}>{m === "family" ? "Rodzinne" : "Z bankierem"}</Text>
              <Text style={s.lineValue}>{`${x.matchesWon}/${x.matches} partii · ${x.roundsWon}/${x.rounds} rund`}</Text>
            </View>
          );
        })}
      </View>

      {played.length > 0 && (
        <>
          <Label>Rywale</Label>
          <View style={s.panel2}>
            {played.map((p) => {
              const x = stats.byPersona[p.id];
              return (
                <View key={p.id} style={s.line}>
                  <Portrait name={p.name} size={24} color={p.color} />
                  <Text style={[s.lineName, { flex: 1 }]}>{p.name}</Text>
                  <Text style={s.lineValue}>{`${x.won} z ${x.matches}`}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <Pressable style={s.link} onPress={onHistory} accessibilityRole="button" accessibilityLabel="Historia partii">
        <Text style={s.linkText}>Historia partii ›</Text>
      </Pressable>
      <Pressable
        style={s.link}
        accessibilityRole="button"
        accessibilityLabel="Wyzeruj statystyki"
        onPress={async () => {
          if (await confirm({ title: "Wyzerować statystyki?", message: "Ranga, odznaki i wyniki zaczną się od nowa. Historii partii to nie zmienia.", confirmText: "Wyzeruj", destructive: true }))
            onReset();
        }}
      >
        <Text style={[s.linkText, { color: P.danger }]}>Wyzeruj statystyki</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  content: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },
  h1: { color: P.text, fontFamily: DISPLAY, fontSize: 28 },
  rankCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 18, padding: 14 },
  rankBadge: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: P.accent, backgroundColor: "#3A2C25", alignItems: "center", justifyContent: "center" },
  rankBadgeText: { color: P.accent, fontFamily: DISPLAY, fontSize: 26 },
  rankName: { color: P.text, fontFamily: DISPLAY, fontSize: 20 },
  small: { color: P.muted, fontSize: 11.5 },
  track: { height: 6, borderRadius: 3, backgroundColor: P.surface2, overflow: "hidden", marginVertical: 6 },
  fill: { height: 6, backgroundColor: P.accent },
  tiles: { flexDirection: "row", gap: 8 },
  tile: { flex: 1, backgroundColor: P.surface2, borderColor: P.line, borderWidth: 1, borderRadius: 14, padding: 10 },
  tileValue: { color: P.text, fontFamily: DISPLAY, fontSize: 21 },
  tileLabel: { color: P.muted, fontSize: 11 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { width: "23%", flexGrow: 1, backgroundColor: P.surface2, borderColor: P.line, borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4, alignItems: "center", gap: 6 },
  locked: { opacity: 0.45 },
  badgeIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  badgeIconText: { fontFamily: DISPLAY, fontSize: 15 },
  badgeName: { color: P.textSoft, fontSize: 10.5, fontWeight: "600", textAlign: "center" },
  panel: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 18, padding: 12 },
  name: { color: P.text, fontSize: 15, fontWeight: "700" },
  panel2: { backgroundColor: P.surface, borderColor: P.line, borderWidth: 1, borderRadius: 18, paddingHorizontal: 12 },
  line: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, borderBottomWidth: 1, borderBottomColor: P.line },
  lineName: { color: P.text, fontSize: 14, fontWeight: "600", flex: 1 },
  lineValue: { color: P.muted, fontSize: 12.5 },
  link: { minHeight: 48, justifyContent: "center" },
  linkText: { color: P.accent, fontSize: 15, fontWeight: "700" },
});
