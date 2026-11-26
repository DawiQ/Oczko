// A real bottom sheet: snap points, drag by the handle/header, backdrop that
// dims only above `dimFrom`, a scrollable body, a sticky footer, Android back
// closes it. Built on React Native's Animated + PanResponder (no extra native
// dependency).
//
// It must draw above everything on the table. On Android, views with an
// elevation (the cards have a shadow) are drawn above views without one, and
// layout-only containers get flattened away — so a hand card could end up on
// top of a sheet that merely came later in the tree. The sheet and its
// backdrop therefore get a higher elevation (and zIndex) than anything else.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStrings } from "../i18n";
import { P } from "./palette";

export interface BottomSheetProps {
  /** Sheet heights in px (without the bottom safe area), lowest first. */
  snapPoints: number[];
  /** Snap point the sheet opens at. */
  initialSnap?: number;
  /** From this snap point up the backdrop dims and blocks the table. */
  dimFrom?: number;
  onClose: () => void;
  accessibilityLabel: string;
  /** Draggable header (always visible, also at the lowest snap point). */
  header?: ReactNode;
  /** Scrollable content (needs a higher snap point to be seen). */
  children?: ReactNode;
  /** Pinned to the bottom of the sheet. */
  footer?: ReactNode;
  /** Hint under the handle per snap point, e.g. "przeciągnij w górę". */
  handleHints?: string[];
}

const DIM = 0.6;

export function BottomSheet({
  snapPoints,
  initialSnap = 0,
  dimFrom = 1,
  onClose,
  accessibilityLabel,
  header,
  children,
  footer,
  handleHints,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const str = useStrings();
  // By value: callers pass a fresh array each render, and the gesture handler
  // below is rebuilt whenever `snaps` changes.
  const snapKey = snapPoints.join(",");
  const snaps = useMemo(
    () => snapPoints.map((h) => h + insets.bottom),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapKey, insets.bottom]
  );
  const [height] = useState(() => new Animated.Value(0)); // visible sheet height
  const current = useRef(0); // height while dragging
  const [index, setIndex] = useState(() => Math.max(0, Math.min(snapPoints.length - 1, initialSnap)));
  const [reduceMotion, setReduceMotion] = useState(false);
  const closing = useRef(false);

  useEffect(() => {
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.())
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = height.addListener(({ value }) => {
      current.current = value;
    });
    return () => height.removeListener(id);
  }, [height]);

  const animateTo = (to: number, done?: () => void) => {
    const anim = reduceMotion
      ? Animated.timing(height, { toValue: to, duration: 0, useNativeDriver: false })
      : Animated.spring(height, { toValue: to, useNativeDriver: false, damping: 22, stiffness: 220, mass: 0.9 });
    anim.start(({ finished }) => {
      if (finished) done?.();
      // An interrupted close (the sheet grabbed mid-way) must not block the
      // next one.
      else if (to === 0) closing.current = false;
    });
  };

  const snapTo = (i: number) => {
    const k = Math.max(0, Math.min(snaps.length - 1, i));
    setIndex(k);
    animateTo(snaps[k]);
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    animateTo(0, onClose);
  };

  // Open at the initial snap point (`index` starts there already).
  useEffect(() => {
    animateTo(snaps[index]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Android back closes the sheet.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  });

  const start = useRef(0);
  const pan = useMemo(
    () =>
      // The refs are read inside the gesture handlers, never during render.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderGrant: () => {
          height.stopAnimation();
          closing.current = false;
          start.current = current.current;
        },
        onPanResponderMove: (_, g) => {
          const max = snaps[snaps.length - 1];
          height.setValue(Math.max(0, Math.min(max + 24, start.current - g.dy)));
        },
        onPanResponderRelease: (_, g) => {
          // Project the release with its velocity, then pick the nearest snap.
          const projected = current.current - g.vy * 160;
          if (projected < snaps[0] * 0.55) return close();
          let best = 0;
          snaps.forEach((h, i) => {
            if (Math.abs(h - projected) < Math.abs(snaps[best] - projected)) best = i;
          });
          snapTo(best);
        },
        onPanResponderTerminate: () => snapTo(index),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snaps, index, reduceMotion]
  );

  // No dimming up to the snap point below `dimFrom`; full dim from `dimFrom`.
  const dimAt = snaps[Math.min(dimFrom, snaps.length - 1)];
  const clearUntil = dimFrom > 0 ? snaps[dimFrom - 1] : 0;
  const backdropOpacity = height.interpolate({
    inputRange: clearUntil < dimAt ? [clearUntil, dimAt] : [0, Math.max(1, dimAt)],
    outputRange: [0, DIM],
    extrapolate: "clamp",
  });
  const blocking = index >= dimFrom;
  const cycle = () => snapTo((index + 1) % snaps.length);

  return (
    <>
      <Animated.View
        pointerEvents={blocking ? "auto" : "none"}
        style={[StyleSheet.absoluteFill, s.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={str.common.close} />
      </Animated.View>
      <Animated.View
        style={[s.sheet, { height, paddingBottom: insets.bottom }]}
        accessibilityViewIsModal={blocking}
        accessibilityLabel={accessibilityLabel}
      >
        <View {...pan.panHandlers}>
          <Pressable
            onPress={cycle}
            style={s.handleArea}
            accessibilityRole="adjustable"
            accessibilityLabel={str.ui.sheetHandle}
            accessibilityHint={str.ui.sheetHint}
            accessibilityActions={[
              { name: "increment", label: str.ui.sheetUp },
              { name: "decrement", label: str.ui.sheetDown },
            ]}
            onAccessibilityAction={(e) =>
              e.nativeEvent.actionName === "increment" ? snapTo(index + 1) : index === 0 ? close() : snapTo(index - 1)
            }
          >
            <View style={s.grabber} />
            {handleHints?.[index] ? <Text style={s.hint}>{handleHints[index]}</Text> : null}
          </Pressable>
          {header}
        </View>
        <Animated.ScrollView style={s.body} contentContainerStyle={s.bodyContent} bounces={false}>
          {children}
        </Animated.ScrollView>
        {footer ? <View style={s.footer}>{footer}</View> : null}
      </Animated.View>
    </>
  );
}

const s = StyleSheet.create({
  backdrop: { backgroundColor: "#050A10", zIndex: 40, elevation: 40 },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    elevation: 50,
    backgroundColor: P.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    overflow: "hidden",
  },
  handleArea: { alignItems: "center", paddingTop: 10, paddingBottom: 6, gap: 4, minHeight: 32 },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: "#3A4B5D" },
  hint: { color: P.muted, fontSize: 11, fontWeight: "600" },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 18, paddingBottom: 12, gap: 10 },
  footer: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12 },
});
