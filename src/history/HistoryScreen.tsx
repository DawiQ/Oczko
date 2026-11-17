// The history of matches: newest first, export as JSON, open a replay.
import { FlatList, Pressable, Share, StyleSheet, Text, View } from "react-native";

import { DISPLAY } from "../ui/fonts";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";
import { plural } from "../ui/plural";
import { exportHistory } from "../storage/history";
import type { HistoryRecord } from "./record";

const two = (n: number) => String(n).padStart(2, "0");
/** "17.11, 21:05" (no Intl: Hermes' support is partial). */
export function shortDate(ms: number): string {
  const d = new Date(ms);
  return `${two(d.getDate())}.${two(d.getMonth() + 1)}, ${two(d.getHours())}:${two(d.getMinutes())}`;
}

export function recordTitle(r: HistoryRecord): string {
  if (r.winner === null) return "Partia przerwana";
  return r.winner === r.me ? "Partia dla Ciebie" : `Wygrywa ${r.setup.seats[r.winner].name}`;
}

export function recordLine(r: HistoryRecord): string {
  const mode = r.setup.rules.mode === "bank" ? "Z bankierem" : "Rodzinne";
  const rivals = r.setup.seats.filter((_, i) => i !== r.me).map((s) => s.name).join(", ");
  return `${mode} · ${r.rounds} ${plural(r.rounds, "runda", "rundy", "rund")} · ${rivals}`;
}

export function HistoryScreen({
  records,
  limit,
  onOpen,
  onBack,
  onMore,
  canExport = true,
  onExportLocked,
}: {
  records: HistoryRecord[];
  /** Export (Oczko Pro). */
  canExport?: boolean;
  onExportLocked?: () => void;
  /** How many can be opened (without Oczko Pro: 10). */
  limit: number;
  onOpen: (r: HistoryRecord) => void;
  onBack: () => void;
  /** Shown under the list when some records are locked. */
  onMore?: () => void;
}) {
  const shown = records.slice(0, limit);
  const locked = records.length - shown.length;
  const doExport = () => {
    if (!canExport) return onExportLocked?.();
    void Share.share({ title: "Oczko — historia", message: exportHistory(shown) }).catch(() => {});
  };
  return (
    <View style={s.screen}>
      <Header
        title="Historia"
        onBack={onBack}
        right={
          shown.length ? (
            <Pressable onPress={doExport} style={s.export} accessibilityRole="button" accessibilityLabel="Eksportuj historię (JSON)">
              <Text style={s.exportText}>Eksport</Text>
            </Pressable>
          ) : undefined
        }
      />
      <FlatList
        data={shown}
        keyExtractor={(r) => r.id}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>Tu pojawią się rozegrane partie — z powtórką ruch po ruchu.</Text>}
        renderItem={({ item }) => {
          const me = item.scores[item.me];
          const won = item.winner === item.me;
          return (
            <Pressable style={s.row} onPress={() => onOpen(item)} accessibilityRole="button" accessibilityLabel={`${recordTitle(item)}, ${recordLine(item)}, ${shortDate(item.date)}`}>
              <View style={[s.score, won && { backgroundColor: P.accent }]}>
                <Text style={[s.scoreText, won && { color: P.onAccent }]}>{me}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{recordTitle(item)}</Text>
                <Text style={s.line} numberOfLines={1}>
                  {recordLine(item)}
                </Text>
              </View>
              <Text style={s.date}>{shortDate(item.date)}</Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          locked > 0 ? (
            <Pressable style={s.more} onPress={onMore} accessibilityRole="button" accessibilityLabel={`Jeszcze ${locked} w Oczko Pro`}>
              <Text style={s.moreText}>{`Jeszcze ${locked} ${plural(locked, "partia", "partie", "partii")} w Oczko Pro`}</Text>
            </Pressable>
          ) : undefined
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  empty: { color: P.muted, fontSize: 14, textAlign: "center", marginTop: 40, paddingHorizontal: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: P.surface, borderRadius: 16, borderWidth: 1, borderColor: P.line, padding: 12, minHeight: 60 },
  score: { width: 40, height: 40, borderRadius: 20, backgroundColor: P.surface2, alignItems: "center", justifyContent: "center" },
  scoreText: { color: P.text, fontFamily: DISPLAY, fontSize: 17 },
  title: { color: P.text, fontSize: 14, fontWeight: "700" },
  line: { color: P.muted, fontSize: 12, marginTop: 2 },
  date: { color: P.muted, fontSize: 11 },
  export: { minHeight: 44, minWidth: 44, justifyContent: "center", paddingHorizontal: 8 },
  exportText: { color: P.accent, fontWeight: "700" },
  more: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  moreText: { color: P.accent, fontWeight: "700" },
});
