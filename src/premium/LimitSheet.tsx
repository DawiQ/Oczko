// A limit was reached (today's hints, an analysis, a big table...): get more
// for a rewarded ad (when ads are on), go for Oczko Pro, or carry on without.
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "../ui/BottomSheet";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { usePremium, type PaywallReason } from "./PremiumProvider";
import type { Reward } from "./wallet";

export function LimitSheet({
  title,
  text,
  reason,
  proLabel,
  ad,
  dismissLabel = "Może później",
  onClose,
  onGranted,
}: {
  title: string;
  text: string;
  /** The Oczko Pro screen's headline. */
  reason: PaywallReason;
  proLabel: string;
  /** A rewarded ad's offer (hidden when ads are off). */
  ad?: { label: string; reward: Reward };
  dismissLabel?: string;
  onClose: () => void;
  /** The ad was watched to the end and its reward granted. */
  onGranted?: () => void;
}) {
  const premium = usePremium();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const watch = async () => {
    if (!ad || busy) return;
    setBusy(true);
    setFailed(false);
    const ok = await premium.watchAd(ad.reward);
    setBusy(false);
    if (ok) {
      onClose();
      onGranted?.();
    } else setFailed(true);
  };
  const showAd = !!ad && premium.adsAvailable;
  return (
    <BottomSheet
      snapPoints={[showAd ? 410 : 330]}
      dimFrom={0}
      onClose={onClose}
      accessibilityLabel={title}
      header={<Text style={s.title}>{title}</Text>}
    >
      <Text style={s.text}>{text}</Text>
      {showAd && (
        <Pressable onPress={watch} disabled={busy} style={s.ad} accessibilityRole="button" accessibilityLabel={`Obejrzyj reklamę: ${ad!.label}`}>
          <View style={s.play}>{busy ? <ActivityIndicator color={P.feltMuted} /> : <Text style={s.playText}>▶</Text>}</View>
          <View style={{ flex: 1 }}>
            <Text style={s.adTitle}>Obejrzyj reklamę · {ad!.label}</Text>
            <Text style={s.adNote}>{failed ? "Reklama niedostępna — spróbuj za chwilę." : "około 30 sekund"}</Text>
          </View>
        </Pressable>
      )}
      <Pressable
        onPress={() => {
          onClose();
          premium.showPaywall(reason);
        }}
        style={s.pro}
        accessibilityRole="button"
      >
        <View style={{ flex: 1 }}>
          <Text style={s.proTitle}>{proLabel}</Text>
          <Text style={s.proNote}>Oczko Pro</Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>PRO</Text>
        </View>
      </Pressable>
      <Pressable onPress={onClose} style={s.dismiss} accessibilityRole="button">
        <Text style={s.dismissText}>{dismissLabel}</Text>
      </Pressable>
    </BottomSheet>
  );
}

/** A small "PRO" tag next to a locked option. */
export function ProTag({ small }: { small?: boolean }) {
  return (
    <View style={[s.badge, small && { paddingHorizontal: 6, paddingVertical: 1 }]}>
      <Text style={[s.badgeText, small && { fontSize: 9 }]}>PRO</Text>
    </View>
  );
}

const s = StyleSheet.create({
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 22, paddingHorizontal: 18 },
  text: { color: P.textSoft, fontSize: 15, lineHeight: 21, marginBottom: 12 },
  ad: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, borderRadius: 16, borderWidth: 1, borderColor: P.feltLine, backgroundColor: P.felt, paddingHorizontal: 14, marginBottom: 10 },
  play: { width: 36, height: 36, borderRadius: 18, backgroundColor: P.feltDark, alignItems: "center", justifyContent: "center" },
  playText: { color: P.feltMuted, fontSize: 14 },
  adTitle: { color: P.text, fontSize: 16, fontWeight: "700" },
  adNote: { color: P.feltMuted, fontSize: 12 },
  pro: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, borderRadius: 16, backgroundColor: P.accent, paddingHorizontal: 16 },
  proTitle: { color: P.onAccent, fontSize: 16, fontWeight: "800" },
  proNote: { color: P.onAccent, fontSize: 12, fontWeight: "600" },
  badge: { backgroundColor: P.onAccent, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  badgeText: { color: P.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  dismiss: { minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 4 },
  dismissText: { color: P.textSoft, fontSize: 15, fontWeight: "600" },
});
