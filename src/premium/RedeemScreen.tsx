// "Mam kod": a promo code from Google Play (typed here, confirmed in the Play
// Store) or an App Store offer code (typed in Apple's own sheet). The store
// grants Oczko Pro; back in the app we sync with it and say what happened.
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { pl, useStrings, type Strings } from "../i18n";
import { Button3D } from "../ui/Button3D";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { usePremium } from "./PremiumProvider";
import { cleanPromoCode } from "./store";

type Phase =
  | { k: "entry"; error: string | null }
  | { k: "waiting" }
  | { k: "checking" }
  | { k: "done"; expires: number | null; renews: boolean }
  | { k: "notYet"; offline: boolean };

export function RedeemScreen({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const premium = usePremium();
  const str = useStrings();
  const t = str.premium.redeem;
  const android = premium.codeFlow === "inApp";
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>({ k: "entry", error: null });
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  const clean = cleanPromoCode(code);

  const check = useCallback(async () => {
    setPhase({ k: "checking" });
    try {
      const st = await premium.syncPurchases();
      setPhase(st.active ? { k: "done", expires: st.expires, renews: st.renews } : { k: "notYet", offline: false });
    } catch {
      setPhase({ k: "notYet", offline: true });
    }
  }, [premium]);

  const checkRef = useRef(check);
  useEffect(() => {
    checkRef.current = check;
  }, [check]);
  // Back from the store: look at the account again.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (st) => {
      if (st === "active" && phaseRef.current.k === "waiting") void checkRef.current();
    });
    return () => sub?.remove();
  }, []);
  // Pro switched on by the store's own notice while we wait (only on the
  // change: a failed check must not start another one).
  const wasPro = useRef(premium.pro);
  useEffect(() => {
    const k = phaseRef.current.k;
    if (premium.pro && !wasPro.current && (k === "waiting" || k === "notYet")) void checkRef.current();
    wasPro.current = premium.pro;
  }, [premium.pro]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const open = async () => {
    if (android && !clean) return;
    const ok = await premium.redeem(android ? clean : null).catch(() => false);
    setPhase(ok ? { k: "waiting" } : { k: "entry", error: t.openFailed });
  };
  const restore = async () => {
    setPhase({ k: "checking" });
    const ok = await premium.restore().catch(() => false);
    if (ok) await check();
    else setPhase({ k: "notYet", offline: false });
  };

  const store = android ? t.googlePlay : t.appStore;

  return (
    <View style={[s.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 14 }]} accessibilityViewIsModal>
      <View style={s.top}>
        <Pressable onPress={onClose} style={s.close} accessibilityRole="button" accessibilityLabel={str.common.close} hitSlop={6}>
          <Text style={s.closeText}>×</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {phase.k === "entry" && (
          <>
            <Text style={s.title} accessibilityRole="header">
              {t.title}
            </Text>
            <Text style={s.lead}>
              {android ? t.leadAndroid : t.leadIos}
            </Text>
            {android && (
              <TextInput
                testID="redeem-code"
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase());
                  if (phase.error) setPhase({ k: "entry", error: null });
                }}
                onSubmitEditing={open}
                placeholder={t.placeholder}
                placeholderTextColor={P.muted}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                maxLength={48}
                returnKeyType="go"
                style={s.input}
                accessibilityLabel={t.code}
              />
            )}
            {phase.error && (
              <Text style={s.error} accessibilityLiveRegion="polite">
                {phase.error}
              </Text>
            )}
            <View style={{ marginTop: 8 }}>
              <Button3D
                big
                height={56}
                testID="redeem-go"
                label={android ? t.goAndroid : t.goIos}
                disabled={android && !clean}
                onPress={open}
              />
            </View>
            <Text style={s.fine}>{t.fine}</Text>
          </>
        )}

        {phase.k === "waiting" && (
          <>
            <Text style={s.title} accessibilityRole="header">
              {t.finishIn(store)}
            </Text>
            <View style={s.steps}>
              <Step n={1} on text={t.stepOpened(store)} />
              <Step n={2} text={t.stepConfirm} />
              <Step n={3} text={t.stepBack} />
            </View>
            <Button3D big height={56} testID="redeem-check" label={t.checkNow} onPress={check} />
            <Pressable onPress={() => setPhase({ k: "entry", error: null })} style={s.link} accessibilityRole="button">
              <Text style={s.linkText}>{t.otherCode}</Text>
            </Pressable>
          </>
        )}

        {phase.k === "checking" && (
          <View style={s.center}>
            <ActivityIndicator color={P.accent} size="large" />
            <Text style={s.lead}>{t.checking}</Text>
          </View>
        )}

        {phase.k === "done" && (
          <View style={s.center}>
            <Text style={s.big}>✓</Text>
            <Text style={s.title} accessibilityRole="header">
              {t.accepted}
            </Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>{t.active}</Text>
            </View>
            <Text style={s.lead}>{doneNote(phase.expires, phase.renews, str)}</Text>
            <Text style={s.fine}>{t.gives}</Text>
            <View style={{ alignSelf: "stretch", marginTop: 10 }}>
              <Button3D big height={56} testID="redeem-done" label={t.play} onPress={onClose} />
            </View>
          </View>
        )}

        {phase.k === "notYet" && (
          <>
            <Text style={s.title} accessibilityRole="header">
              {phase.offline ? t.offline : t.notYet}
            </Text>
            <Text style={s.lead}>
              {phase.offline ? t.offlineLead : t.notYetLead}
            </Text>
            {!phase.offline && (
              <View style={{ gap: 6 }}>
                {t.reasons(store).map((x) => (
                  <Text key={x} style={s.reason}>
                    {x}
                  </Text>
                ))}
              </View>
            )}
            <View style={{ gap: 10, marginTop: 8 }}>
              <Button3D big height={56} testID="redeem-retry" label={t.retry} onPress={check} />
              <Pressable onPress={restore} style={s.link} accessibilityRole="button">
                <Text style={s.linkText}>{str.premium.restore}</Text>
              </Pressable>
              <Pressable onPress={() => setPhase({ k: "entry", error: null })} style={s.link} accessibilityRole="button">
                <Text style={s.linkText}>{t.again}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

export function doneNote(expires: number | null, renews: boolean, s: Strings = pl): string {
  const t = s.premium.redeem;
  if (!expires) return t.noExpiry;
  return renews ? t.renews(expires) : t.validUntil(expires);
}

function Step({ n, text, on }: { n: number; text: string; on?: boolean }) {
  return (
    <View style={s.step}>
      <View style={[s.stepNo, on && s.stepNoOn]}>
        <Text style={[s.stepNoText, on && { color: P.onAccent }]}>{on ? "✓" : n}</Text>
      </View>
      <Text style={s.stepText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg, zIndex: 110, elevation: 110 },
  top: { flexDirection: "row", paddingHorizontal: 12 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: P.surface, alignItems: "center", justifyContent: "center" },
  closeText: { color: P.textSoft, fontSize: 26, lineHeight: 28 },
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 24, gap: 12 },
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 30, lineHeight: 36, textAlign: "center" },
  lead: { color: P.textSoft, fontSize: 15, lineHeight: 21, textAlign: "center" },
  input: {
    marginTop: 6,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: P.line,
    backgroundColor: P.surface,
    color: P.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    paddingHorizontal: 14,
  },
  error: { color: P.danger, fontSize: 14, textAlign: "center" },
  fine: { color: P.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
  steps: { gap: 12, marginVertical: 8, padding: 16, borderRadius: 16, backgroundColor: P.surface },
  step: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNo: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: P.line, alignItems: "center", justifyContent: "center" },
  stepNoOn: { backgroundColor: P.accent, borderColor: P.accent },
  stepNoText: { color: P.textSoft, fontWeight: "800" },
  stepText: { color: P.text, fontSize: 15, flex: 1 },
  link: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  linkText: { color: P.textSoft, fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  center: { alignItems: "center", gap: 12, paddingTop: 30 },
  big: { color: P.accent, fontSize: 56, fontWeight: "800" },
  badge: { backgroundColor: P.accent, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  badgeText: { color: P.onAccent, fontWeight: "800", letterSpacing: 2, fontSize: 13 },
  reason: { color: P.textSoft, fontSize: 14, lineHeight: 20 },
});
