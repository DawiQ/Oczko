// The trainer at the table: P(fura) and the chances of "Starczy" vs
// "Dobieram" for the current hand, computed in chunks from my view only.
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { chunkedEvaluator, type ChunkedEvaluator, type Evaluation } from "../ai/evaluate";
import { splitmix32 } from "../engine/rng";
import type { GameSnapshot } from "../game/TableGame";
import { P } from "../ui/palette";

export const TRAINER_SAMPLES = 1500;

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** The evaluation for my current decision (null while computing / not my turn). */
export function useTrainer(snap: GameSnapshot, enabled: boolean, evaluatorFactory: () => ChunkedEvaluator = chunkedEvaluator): Evaluation | null {
  const key = enabled && snap.phase === "myTurn" ? `${snap.roundNo}:${snap.view.myHand.join(",")}` : null;
  const view = snap.view;
  const [ev, setEv] = useState<{ key: string; e: Evaluation } | null>(null);
  const evaluator = useRef<ChunkedEvaluator | null>(null);
  useEffect(() => {
    if (!key) return;
    const e = (evaluator.current ??= evaluatorFactory());
    e.cancel();
    let seed = 0;
    for (const ch of key) seed = splitmix32(seed ^ ch.charCodeAt(0));
    void e
      .evaluate(view, { samples: TRAINER_SAMPLES, rng: { state: seed }, opponentModel: { standAt: 17 } }, (p) => setEv({ key, e: p }))
      .then((r) => r && setEv({ key, e: r }));
    return () => e.cancel();
    // `view` belongs to `key` (the same hand in the same round).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return ev && ev.key === key ? ev.e : null;
}

function Bar({ label, value, best }: { label: string; value: number; best: boolean }) {
  return (
    <View style={s.barRow}>
      <Text style={[s.barLabel, best && { color: P.text, fontWeight: "800" }]}>{label}</Text>
      <View style={s.track}>
        <View style={[s.fill, { width: `${Math.round(value * 100)}%`, backgroundColor: best ? P.accent : P.feltMuted }]} />
      </View>
      <Text style={[s.barValue, best && { color: P.text }]}>{pct(value)}</Text>
    </View>
  );
}

export function TrainerPanel({ evaluation }: { evaluation: Evaluation | null }) {
  if (!evaluation)
    return (
      <View style={s.panel} accessible accessibilityLabel="Trener liczy szanse">
        <Text style={s.title}>Trener · liczę szanse…</Text>
      </View>
    );
  const e = evaluation;
  const hitBest = e.best === "hit";
  return (
    <View
      style={s.panel}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Trener: szansa na furę ${pct(e.bustIfHit)}. Starczy ${pct(e.winIfStand)}, Dobieram ${pct(e.winIfHit)}. Lepiej: ${hitBest ? "Dobieram" : "Starczy"}.`}
    >
      <View style={s.head}>
        <Text style={s.title}>Trener</Text>
        <Text style={s.bust}>
          Szansa na furę: <Text style={{ color: P.danger, fontWeight: "800" }}>{pct(e.bustIfHit)}</Text>
        </Text>
      </View>
      <Bar label="Starczy" value={e.winIfStand} best={!hitBest} />
      <Bar label="Dobieram" value={e.winIfHit} best={hitBest} />
    </View>
  );
}

const s = StyleSheet.create({
  panel: { backgroundColor: "rgba(8,20,16,0.78)", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, gap: 5 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: P.feltText, fontSize: 12, fontWeight: "800" },
  bust: { color: P.feltText, fontSize: 11.5 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { width: 66, color: P.feltText, fontSize: 12 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  barValue: { width: 36, textAlign: "right", color: P.feltText, fontSize: 12, fontWeight: "700" },
});
