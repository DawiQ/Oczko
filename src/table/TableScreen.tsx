// The table (layout: docs/mockups, screens 4–8): the rivals round the felt,
// my hand as a fan at the bottom, "Dobieram" / "Starczy" on the wooden rail,
// the round's end and the match's end. Works on any `TableGame` (local game,
// Wi‑Fi host or guest) and sees only its snapshot.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cardOf } from "../engine/cards";
import type { RoundEvent } from "../engine/round";
import type { GameSnapshot, TableGame } from "../game/TableGame";
import type { KV } from "../storage/kv";
import { ART } from "../ui/art";
import { BottomSheet } from "../ui/BottomSheet";
import { Button3D } from "../ui/Button3D";
import { CardBack } from "../ui/cards";
import { useConfirm } from "../ui/Dialog";
import { Felt } from "../ui/lookStyle";
import { DISPLAY } from "../ui/fonts";
import { haptic } from "../ui/haptics";
import { useReduceMotion } from "../ui/motion";
import { P } from "../ui/palette";
import { playSound } from "../ui/sound";
import { FuraStamp, PersianOverlay } from "./Effects";
import { Hand } from "./Hand";
import { HINT_TEXT, hintFor, loadHints, saveHints, type HintId } from "./hints";
import { opponentsOf, PORTRAIT_SIZE, seatSize, seatSpots } from "./layout";
import { OpponentSeat, ScorePop } from "./OpponentSeat";
import { MatchEndPanel, RoundEndPanel, ScoreBars } from "./RoundEnd";
import { caption } from "./texts";

const ACES = [cardOf(14, 0), cardOf(14, 3)];

function modeLine(s: GameSnapshot): string {
  const mode = s.rules.mode === "bank" ? "Z bankierem" : "Rodzinne";
  if (s.mode === "single") return `${mode} · jedna runda`;
  if (s.mode === "training") return `${mode} · trening`;
  return `${mode} · do ${s.target} pkt`;
}

/** Sounds and haptics for new events. */
function feedback(e: RoundEvent, s: GameSnapshot): void {
  const mine = "seat" in e && e.seat === s.me;
  switch (e.t) {
    case "hit":
      playSound("hit");
      if (mine) haptic.hit();
      break;
    case "stand":
      playSound("stand");
      if (mine) haptic.stand();
      break;
    case "bust":
      playSound("bust");
      if (mine) haptic.bust();
      break;
    case "persian":
      playSound("persian");
      haptic.win();
      break;
    case "reveal":
      playSound("hit");
      break;
    case "result":
      if ((e.result.points[s.me] ?? 0) > 0) {
        playSound("win");
        haptic.win();
      }
      break;
    default:
      break;
  }
}

export function TableScreen({
  game,
  kv,
  onExit,
  onNewGame,
  onRules,
  onGiveUp,
  trainer,
  recommend,
  allowed,
  coach,
  endPanel,
  newBadges,
  guest,
  banner,
  menuExtra,
}: {
  game: TableGame;
  kv: KV;
  /** Back to the lobby (the game stays saved). */
  onExit: () => void;
  onNewGame: () => void;
  onRules: () => void;
  /** The match is given up (the save is removed); then `onExit`. */
  onGiveUp?: () => void;
  /** The trainer's panel above the hand (Etap 7). */
  trainer?: (s: GameSnapshot) => ReactNode;
  /** The button the trainer recommends. */
  recommend?: "hit" | "stand" | null;
  /** Tutorial: only these moves are allowed, with a coach's line. */
  allowed?: ("hit" | "stand")[];
  coach?: string | null;
  /** Replaces the match-end panel (tutorial). */
  endPanel?: ReactNode;
  /** Badges earned in this match (shown at its end). */
  newBadges?: { name: string; desc: string }[];
  /** A Wi‑Fi guest: the host deals the next round and decides on a rematch. */
  guest?: boolean;
  /** Shown over the top of the felt (Wi‑Fi: connection, away players, time). */
  banner?: ReactNode;
  /** More menu rows (Wi‑Fi: quick reactions). */
  menuExtra?: ReactNode;
}) {
  const snap = useSyncExternalStore(game.subscribe, game.getSnapshot);
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const reduceMotion = useReduceMotion();
  const [felt, setFelt] = useState({ w: 360, h: 460 });
  const [menu, setMenu] = useState(false);
  const [seen, setSeen] = useState<HintId[] | null>(null);

  // --- feedback for new events -------------------------------------------------
  // Events already there when the table opens (a resumed game) are not replayed.
  const [mountId] = useState(() => (snap.lastEvents.length ? snap.lastEvents[snap.lastEvents.length - 1].id : 0));
  const lastId = useRef(mountId);
  useEffect(() => {
    for (const { id, event } of snap.lastEvents) {
      if (id <= lastId.current) continue;
      lastId.current = id;
      feedback(event, snap);
    }
  }, [snap]);
  const [persianSeen, setPersianSeen] = useState(0);
  const persianEv = [...snap.lastEvents].reverse().find((e) => e.event.t === "persian" && e.id > Math.max(mountId, persianSeen));
  const persian =
    persianEv && persianEv.event.t === "persian"
      ? { name: persianEv.event.seat === snap.me ? null : snap.seats[persianEv.event.seat].name, key: persianEv.id }
      : null;
  const prevPhase = useRef(snap.phase);
  const prevRound = useRef(snap.roundNo);
  useEffect(() => {
    if (snap.phase === "myTurn" && prevPhase.current !== "myTurn") {
      playSound("turn");
      haptic.turn();
    }
    if (snap.phase === "matchEnd" && prevPhase.current !== "matchEnd") playSound("end");
    if (snap.roundNo !== prevRound.current || (snap.phase === "dealing" && prevPhase.current !== "dealing")) playSound("deal");
    prevPhase.current = snap.phase;
    prevRound.current = snap.roundNo;
  }, [snap.phase, snap.roundNo]);

  // --- one-time tips --------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    loadHints(kv).then((h) => alive && setSeen(h));
    return () => {
      alive = false;
    };
  }, [kv]);
  const hint = seen && !persian && !coach ? hintFor(snap, seen) : null;
  const dismissHint = useCallback(() => {
    if (!hint || !seen) return;
    const next = [...seen, hint];
    setSeen(next);
    void saveHints(kv, next);
  }, [hint, seen, kv]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== felt.w || height !== felt.h) setFelt({ w: width, h: height });
  };

  const me = snap.seats[snap.me];
  const opp = opponentsOf(snap.seats.length, snap.me);
  const spots = seatSpots(opp.length);
  const size = seatSize(opp.length);
  const seatW = PORTRAIT_SIZE[size] + 56;
  const myTurn = snap.phase === "myTurn";
  const canHit = myTurn && snap.view.legal.includes("hit") && (!allowed || allowed.includes("hit"));
  const canStand = myTurn && (!allowed || allowed.includes("stand"));
  const at21 = myTurn && snap.view.myValue.total === 21;

  const giveUp = async () => {
    setMenu(false);
    if (await confirm({ title: "Poddać partię?", message: "Partia zostanie zakończona bez zapisu wyniku.", confirmText: "Poddaj", destructive: true })) {
      game.abandon();
      onGiveUp?.();
      onExit();
    }
  };

  return (
    <View style={s.screen}>
      <View style={[s.top, { paddingTop: insets.top + 6 }]}>
        <Image source={ART.woodTop} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <Pressable style={s.bandBtn} onPress={() => setMenu(true)} accessibilityRole="button" accessibilityLabel="Menu" hitSlop={4}>
          <Image source={ART.iconMenu} style={s.bandIcon} />
        </Pressable>
        <View style={s.titleBox}>
          <Text style={s.title} accessibilityRole="header">
            {`Runda ${snap.roundNo}`}
          </Text>
          <Text style={s.subtitle}>{modeLine(snap)}</Text>
        </View>
        <View style={s.bandBtn} accessible accessibilityLabel={`Twoje punkty: ${me.score} z ${snap.target}`}>
          <ScorePop value={me.score} reduceMotion={reduceMotion}>
            <Text style={s.myScore}>{me.score}</Text>
          </ScorePop>
        </View>
      </View>

      <View style={s.felt} onLayout={onLayout}>
        <Felt resizeMode="cover" />
        {banner ? <View style={s.banner}>{banner}</View> : null}
        {opp.map((seat, i) => (
          <View
            key={seat}
            style={[s.seatSpot, { width: seatW, left: spots[i].x * felt.w - seatW / 2, top: Math.max(4, spots[i].y * felt.h - PORTRAIT_SIZE[size] / 2) }]}
          >
            <OpponentSeat seat={snap.seats[seat]} size={size} reduceMotion={reduceMotion} />
          </View>
        ))}

        <View style={[s.stock, { top: felt.h * 0.44 - 40 }]} accessible accessibilityLabel={`Talia: ${snap.view.stockLeft} kart`}>
          {[0, 1, 2].map((i) => (
            <CardBack key={i} size="md" style={[s.stockCard, { left: i * 1.5, top: -i * 1.5 }]} />
          ))}
        </View>

        <View style={[s.captionBox, { top: felt.h * 0.44 + 38 }]}>
          <Text style={s.caption} accessibilityLiveRegion="polite" numberOfLines={2}>
            {caption(snap)}
          </Text>
        </View>

        {trainer && myTurn && <View style={s.trainer}>{trainer(snap)}</View>}

        {coach ? (
          <View style={[s.tip, s.coach]} accessibilityLiveRegion="polite">
            <Text style={s.tipText}>{coach}</Text>
          </View>
        ) : null}

        {hint && (
          <View style={s.tip} accessibilityLiveRegion="polite">
            <Text style={s.tipText}>{HINT_TEXT[hint]}</Text>
            <Pressable onPress={dismissHint} style={s.tipBtn} accessibilityRole="button" accessibilityLabel="Rozumiem">
              <Text style={s.tipBtnText}>OK</Text>
            </Pressable>
          </View>
        )}

        <View style={s.handBox}>
          <Hand cards={me.hand ?? []} value={snap.view.myValue} reduceMotion={reduceMotion} highlight={at21} />
          {me.status === "bust" && <FuraStamp key={`bust-${snap.roundNo}`} reduceMotion={reduceMotion} />}
        </View>
      </View>

      <View style={[s.bottom, { paddingBottom: insets.bottom + 10 }]}>
        <Image source={ART.woodBottom} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {myTurn ? (
          <>
            <Button3D
              label="Dobieram"
              tone={recommend === "hit" ? "accent" : "dark"}
              disabled={!canHit}
              onPress={() => game.hit()}
              style={s.btn}
              big
              testID="hit"
              accessibilityHint="Bierze jedną kartę z talii"
            />
            <Button3D
              label="Starczy"
              tone={recommend === "hit" ? "dark" : "accent"}
              disabled={!canStand}
              onPress={() => game.stand()}
              style={[s.btn, (at21 || recommend === "stand") && s.glow]}
              big
              testID="stand"
              accessibilityHint="Kończy dobieranie w tej rundzie"
            />
          </>
        ) : (
          <>
            <Button3D label="Dobieram" tone="off" disabled style={s.btn} big />
            {snap.canSkip ? (
              <Button3D label="Pokaż wynik" tone="dark" onPress={() => game.skipToEnd()} style={s.btn} big testID="skip" accessibilityHint="Rozgrywa resztę rundy od razu" />
            ) : (
              <Button3D label="Starczy" tone="off" disabled style={s.btn} big />
            )}
          </>
        )}
      </View>

      {snap.phase === "roundEnd" && <RoundEndPanel snap={snap} onNext={guest ? undefined : () => game.nextRound()} onReplay={() => game.replayRound()} />}
      {snap.phase === "matchEnd" && endPanel}
      {snap.phase === "matchEnd" && !endPanel && (
        <MatchEndPanel
          snap={snap}
          newBadges={newBadges}
          onRematch={guest ? undefined : () => game.rematch()}
          onNewGame={guest ? undefined : onNewGame} onExit={onExit} onReplay={() => game.replayRound()} reduceMotion={reduceMotion} />
      )}

      {persian && (
        <PersianOverlay
          key={persian.key}
          name={persian.name}
          aces={persian.name === null && me.hand?.length === 2 ? me.hand : ACES}
          onDone={() => setPersianSeen(persian.key)}
          reduceMotion={reduceMotion}
        />
      )}

      {menu && (
        <BottomSheet snapPoints={[420]} onClose={() => setMenu(false)} accessibilityLabel="Menu stołu" dimFrom={0}>
          <Text style={s.menuTitle}>Menu</Text>
          <MenuItem label="Zasady" onPress={() => (setMenu(false), onRules())} />
          <View style={s.menuScores}>
            <Text style={s.menuLabel}>{`Punkty · do ${snap.target}`}</Text>
            <ScoreBars snap={snap} />
          </View>
          {menuExtra}
          {onGiveUp ? (
            <>
              <MenuItem label="Wyjdź do lobby" hint="Partia zostanie zapisana" onPress={() => (setMenu(false), onExit())} />
              <MenuItem label="Poddaj partię" danger onPress={() => void giveUp()} />
            </>
          ) : (
            <MenuItem label="Opuść stół" danger onPress={() => (setMenu(false), onExit())} />
          )}
        </BottomSheet>
      )}
    </View>
  );
}

function MenuItem({ label, hint, danger, onPress }: { label: string; hint?: string; danger?: boolean; onPress: () => void }) {
  return (
    <Pressable style={s.menuItem} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint}>
      <Text style={[s.menuText, danger && { color: P.danger }]}>{label}</Text>
      {hint ? <Text style={s.menuHint}>{hint}</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  top: { overflow: "hidden", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingBottom: 8, borderBottomWidth: 3, borderBottomColor: "#2B190B" },
  bandBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" },
  bandIcon: { width: 20, height: 20, tintColor: "#F3E3CF" },
  titleBox: { alignItems: "center", flex: 1 },
  title: { color: "#F3E3CF", fontFamily: DISPLAY, fontSize: 17 },
  subtitle: { color: "#F3E3CF", opacity: 0.75, fontSize: 11 },
  myScore: { color: "#F3E3CF", fontFamily: DISPLAY, fontSize: 17 },
  felt: { flex: 1, overflow: "hidden", backgroundColor: P.felt },
  seatSpot: { position: "absolute", alignItems: "center" },
  stock: { position: "absolute", alignSelf: "center", width: 50, height: 72 },
  stockCard: { position: "absolute" },
  captionBox: { position: "absolute", left: 16, right: 16, alignItems: "center" },
  caption: { color: P.feltText, fontSize: 13, fontWeight: "600", backgroundColor: "rgba(0,0,0,0.32)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, overflow: "hidden", textAlign: "center" },
  trainer: { position: "absolute", left: 10, right: 10, bottom: 148 },
  tip: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 150,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(15,23,32,0.94)",
    borderColor: P.accent,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    zIndex: 30,
    elevation: 30,
  },
  tipText: { flex: 1, color: P.text, fontSize: 13, lineHeight: 18 },
  coach: { minHeight: 56 },
  tipBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: P.accent },
  tipBtnText: { color: P.onAccent, fontWeight: "800" },
  banner: { position: "absolute", top: 6, left: 10, right: 10, zIndex: 35, elevation: 35, gap: 6 },
  handBox: { position: "absolute", left: 0, right: 0, bottom: 10 },
  bottom: { overflow: "hidden", flexDirection: "row", gap: 10, paddingHorizontal: 12, paddingTop: 14, borderTopWidth: 3, borderTopColor: "#2B190B" },
  btn: { flex: 1 },
  glow: { shadowColor: P.accent, shadowOpacity: 0.9, shadowRadius: 14, shadowOffset: { width: 0, height: 0 }, elevation: 12 },
  menuTitle: { color: P.text, fontFamily: DISPLAY, fontSize: 22, marginBottom: 4 },
  menuItem: { minHeight: 52, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: P.line },
  menuText: { color: P.text, fontSize: 16, fontWeight: "700" },
  menuHint: { color: P.muted, fontSize: 12 },
  menuScores: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: P.line },
  menuLabel: { color: P.muted, fontSize: 12, fontWeight: "700", marginBottom: 6, letterSpacing: 0.6, textTransform: "uppercase" },
});
