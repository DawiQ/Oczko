// A replay move by move with every hand face up: rounds, a seek bar,
// autoplay, and the analysis of my decisions.
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

import type { Evaluation } from "../ai/evaluate";
import { handValue } from "../engine/score";
import type { SeatView } from "../engine/view";
import { personaById } from "../ai/personas";
import { useStrings, type Strings } from "../i18n";
import { Button3D } from "../ui/Button3D";
import { CardFace } from "../ui/cards";
import { DISPLAY } from "../ui/fonts";
import { Header } from "../ui/Header";
import { P } from "../ui/palette";
import { Portrait } from "../ui/Portrait";
import { analyze, summarize, type Grade } from "./analysis";
import { recordTitle } from "./HistoryScreen";
import { replay, type Frame, type HistoryRecord } from "./record";

const GRADE_COLOR: Record<Grade, string> = { best: P.ok, good: "#B9D86A", risky: "#F0B44C", mistake: P.danger };

function frameText(r: HistoryRecord, f: Frame, s: Strings): string {
  const t = s.history.replay;
  const seats = r.setup.seats;
  if (!f.decision) return t.deal(f.roundNo);
  const who = f.decision.seat === r.me ? s.common.you : seats[f.decision.seat].name;
  if (f.decision.action === "stand") return t.stand(who);
  const hand = f.match.round.hands[f.decision.seat];
  const v = handValue(hand, f.match.rules);
  return v.special ? `${t.hit(who, v)}, ${s.table.specials[v.special]}` : t.hit(who, v);
}

export function ReplayScreen({
  record,
  onBack,
  onAnalysed,
  evaluate,
  spendAnalysis = () => true,
  onAnalyseLocked,
}: {
  record: HistoryRecord;
  onBack: () => void;
  /** The record with its analysis (to be saved). */
  onAnalysed: (r: HistoryRecord) => void;
  evaluate: (view: SeatView, seed: number) => Promise<Evaluation | null>;
  /** Uses up one analysis (a free player's daily limit); false: none left. */
  spendAnalysis?: () => boolean;
  onAnalyseLocked?: () => void;
}) {
  const str = useStrings();
  const t = str.history.replay;
  const frames = useMemo(() => replay(record), [record]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState(record.analysis);
  const ok = !("error" in frames);
  const n = ok ? frames.length : 0;

  useEffect(() => {
    if (!playing || !ok) return;
    const t = setInterval(() => setI((k) => (k + 1 < n ? k + 1 : k)), 700);
    return () => clearInterval(t);
  }, [playing, ok, n]);
  const atEnd = i >= n - 1;
  const isPlaying = playing && !atEnd;

  if (!ok)
    return (
      <View style={s.screen}>
        <Header title={t.title} onBack={onBack} />
        <Text style={s.empty}>{t.cannot}</Text>
      </View>
    );

  const f = frames[i];
  const round = f.match.round;
  const roundStarts = frames.flatMap((x, k) => (x.decision === null ? [k] : []));
  const mine = f.index !== null && f.decision?.seat === record.me ? analysis?.find((a) => a.index === f.index) : undefined;
  const seek = (e: GestureResponderEvent, width: number) => setI(Math.max(0, Math.min(n - 1, Math.round((e.nativeEvent.locationX / width) * (n - 1)))));

  const runAnalysis = async () => {
    if (!spendAnalysis()) return onAnalyseLocked?.();
    setBusy(true);
    try {
      const a = await analyze(record, frames, evaluate);
      if (a) {
        setAnalysis(a);
        onAnalysed({ ...record, analysis: a });
      }
    } finally {
      setBusy(false);
    }
  };
  const sum = analysis ? summarize(analysis) : null;

  return (
    <View style={s.screen}>
      <Header title={t.title} subtitle={recordTitle(record, str)} onBack={onBack} />
      <ScrollView contentContainerStyle={s.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {roundStarts.map((k, r) => {
            const on = frames[k].roundNo === f.roundNo;
            return (
              <Pressable key={k} style={[s.chip, on && s.chipOn]} onPress={() => setI(k)} accessibilityRole="button" accessibilityLabel={t.round(r + 1)} accessibilityState={{ selected: on }}>
                <Text style={[s.chipText, on && { color: P.text }]}>{r + 1}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={s.board}>
          {record.setup.seats.map((seat, k) => {
            const hand = round.hands[k];
            const v = handValue(hand, f.match.rules);
            const color = seat.kind === "bot" ? personaById(seat.persona)?.color ?? P.muted : P.accent;
            const acting = f.decision?.seat === k;
            const name = k === record.me ? str.common.you : seat.name;
            const special = v.special ? str.table.specials[v.special] : null;
            return (
              <View key={k} style={[s.seat, acting && s.seatActing]} accessible accessibilityLabel={special ? `${t.seatLabel(name, v)}, ${special}` : t.seatLabel(name, v)}>
                <Portrait name={seat.name} persona={seat.kind === "bot" ? seat.persona : null} size={30} color={color} />
                <View style={s.name}>
                  <Text style={s.nameText} numberOfLines={1}>
                    {name}
                    {round.bank === k ? t.bankMark : ""}
                  </Text>
                  {special && (
                    <Text style={s.special} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                      {special}
                    </Text>
                  )}
                </View>
                <View style={s.hand}>
                  {hand.map((c, j) => (
                    <CardFace key={c} card={c} size="sm" style={{ marginLeft: j ? -10 : 0 }} />
                  ))}
                </View>
                <Text style={[s.total, v.bust && { color: P.danger }, special !== null && { color: P.accent }]}>{v.persian ? "AA" : v.total}</Text>
                <Text style={s.points}>{f.match.scores[k]}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.caption} accessibilityLiveRegion="polite">
          <Text style={s.captionText}>{frameText(record, f, str)}</Text>
          {mine && (
            <Text style={[s.grade, { color: GRADE_COLOR[mine.grade] }]}>
              {t.decision(mine.grade, Math.round(mine.standWin * 100), Math.round(mine.hitWin * 100))}
            </Text>
          )}
        </View>

        <SeekBar value={i} max={n - 1} label={t.progress} onSeek={seek} />
        <View style={s.controls}>
          <Ctl label="◀" a11y={t.prev} onPress={() => setI(Math.max(0, i - 1))} disabled={i === 0} />
          <Ctl label={isPlaying ? "❚❚" : "▶︎"} a11y={isPlaying ? t.pause : t.play} onPress={() => (atEnd ? (setI(0), setPlaying(true)) : setPlaying(!playing))} />
          <Ctl label="▶︎|" a11y={t.next} onPress={() => setI(Math.min(n - 1, i + 1))} disabled={atEnd} />
        </View>
        <Text style={s.counter}>{t.move(i, n - 1)}</Text>

        <View style={s.analysis}>
          {sum ? (
            <Text style={s.sumText}>{t.summary(sum)}</Text>
          ) : (
            <Button3D label={busy ? t.analysing : t.analyse} tone="dark" height={46} disabled={busy} onPress={() => void runAnalysis()} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SeekBar({ value, max, label, onSeek }: { value: number; max: number; label: string; onSeek: (e: GestureResponderEvent, width: number) => void }) {
  const [w, setW] = useState(1);
  return (
    <Pressable
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      onPress={(e) => onSeek(e, w)}
      style={s.seek}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
    >
      <View style={s.seekTrack}>
        <View style={[s.seekFill, { width: `${max ? (value / max) * 100 : 0}%` }]} />
      </View>
    </Pressable>
  );
}

function Ctl({ label, a11y, onPress, disabled }: { label: string; a11y: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable style={[s.ctl, disabled && { opacity: 0.4 }]} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={a11y}>
      <Text style={s.ctlText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  empty: { color: P.muted, textAlign: "center", marginTop: 40, paddingHorizontal: 24 },
  chips: { gap: 6 },
  chip: { minWidth: 44, minHeight: 44, borderRadius: 12, backgroundColor: P.surface2, borderWidth: 1, borderColor: P.line, alignItems: "center", justifyContent: "center" },
  chipOn: { borderColor: P.accent },
  chipText: { color: P.muted, fontFamily: DISPLAY, fontSize: 15 },
  board: { backgroundColor: P.felt, borderRadius: 18, padding: 10, gap: 6 },
  seat: { flexDirection: "row", alignItems: "center", gap: 8, padding: 6, borderRadius: 12 },
  seatActing: { backgroundColor: "rgba(232,146,90,0.18)" },
  name: { width: 70 },
  nameText: { color: P.feltText, fontSize: 12.5, fontWeight: "700" },
  special: { color: P.accent, fontSize: 10.5, fontWeight: "700" },
  hand: { flex: 1, flexDirection: "row" },
  total: { width: 30, textAlign: "right", color: P.text, fontFamily: DISPLAY, fontSize: 16 },
  points: { width: 26, textAlign: "right", color: P.feltMuted, fontSize: 12, fontWeight: "700" },
  caption: { backgroundColor: P.surface, borderRadius: 14, padding: 12, gap: 4, borderWidth: 1, borderColor: P.line },
  captionText: { color: P.text, fontSize: 15, fontWeight: "700" },
  grade: { fontSize: 12.5, fontWeight: "700" },
  seek: { height: 44, justifyContent: "center" },
  seekTrack: { height: 8, borderRadius: 4, backgroundColor: P.surface2, overflow: "hidden" },
  seekFill: { height: 8, backgroundColor: P.accent },
  controls: { flexDirection: "row", justifyContent: "center", gap: 18 },
  ctl: { width: 56, height: 48, borderRadius: 14, backgroundColor: P.surface2, alignItems: "center", justifyContent: "center" },
  ctlText: { color: P.text, fontSize: 18, fontWeight: "800" },
  counter: { color: P.muted, fontSize: 12, textAlign: "center" },
  analysis: { marginTop: 4 },
  sumText: { color: P.textSoft, fontSize: 13.5, lineHeight: 20 },
});
