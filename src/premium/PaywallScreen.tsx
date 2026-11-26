// "Oczko Pro": what it gives, the plans from the store (in the offering's
// order set in RevenueCat; the one with a free trial picked first), buy, restore. Opened from wherever a limit is reached;
// the headline says what the player was after.
import { useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStrings } from "../i18n";
import { Button3D } from "../ui/Button3D";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { monetizationLinks } from "./config";
import { usePremium, type PaywallReason } from "./PremiumProvider";
import { ctaLabel, defaultPlan, finePrint, isSubscription, planNote, planTitle, type Plan } from "./plans";

export function PaywallScreen({ reason, onClose }: { reason: PaywallReason; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const premium = usePremium();
  const str = useStrings();
  const t = str.premium.paywall;
  const [plans, setPlans] = useState<Plan[] | null>(() => (premium.storeAvailable ? null : []));
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const links = monetizationLinks();

  useEffect(() => {
    if (!premium.storeAvailable) return;
    let alive = true;
    premium
      .plans()
      .then((list) => {
        if (!alive) return;
        setPlans(list);
        setPicked(defaultPlan(list)?.id ?? null);
      })
      .catch(() => alive && setPlans([]));
    return () => {
      alive = false;
    };
    // once per opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (premium.pro) onClose();
  }, [premium.pro, onClose]);
  // Android back closes this screen (it lies over whatever opened it).
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const plan = plans?.find((p) => p.id === picked);
  const buy = async () => {
    if (!plan || busy) return;
    setBusy(true);
    setNote(null);
    const r = await premium.purchase(plan.id);
    setBusy(false);
    if (r === "error") setNote(t.buyFailed);
    else if (r === "pending") setNote(t.pending);
  };
  const restore = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    const ok = await premium.restore().catch(() => false);
    setBusy(false);
    setNote(ok ? null : t.nothingToRestore);
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top + 8 }]} accessibilityViewIsModal>
      <View style={s.top}>
        <Pressable onPress={onClose} style={s.close} accessibilityRole="button" accessibilityLabel={str.common.close} hitSlop={6}>
          <Text style={s.closeText}>×</Text>
        </Pressable>
        {premium.storeAvailable && (
          <Pressable onPress={restore} style={s.restore} accessibilityRole="button">
            <Text style={s.restoreText}>{str.premium.restore}</Text>
          </Pressable>
        )}
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.badge}>
          <Text style={s.badgeText}>{str.premium.tag}</Text>
        </View>
        <Text style={s.title} accessibilityRole="header">
          {t.headline[reason]}
        </Text>
        <Text style={s.lead}>{t.lead}</Text>
        <View style={{ gap: 10, marginTop: 4 }}>
          {t.perks.map((p) => (
            <View key={p.title} style={s.perk}>
              <Text style={s.check}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.perkTitle}>{p.title}</Text>
                <Text style={s.perkNote}>{p.note}</Text>
              </View>
            </View>
          ))}
        </View>

        {!premium.storeAvailable ? (
          <View style={s.info}>
            <Text style={s.infoText}>{t.noStore}</Text>
          </View>
        ) : plans === null ? (
          <ActivityIndicator color={P.accent} style={{ marginTop: 20 }} />
        ) : plans.length === 0 ? (
          <View style={s.info}>
            <Text style={s.infoText}>{t.noPrices}</Text>
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 6 }} accessibilityRole="radiogroup" accessibilityLabel={t.plan}>
            {plans.map((p) => {
              const on = p.id === picked;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPicked(p.id)}
                  style={[s.plan, on && s.planOn]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={t.planLabel(planTitle(p, str), planNote(p, str))}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={s.planTitle}>{planTitle(p, str)}</Text>
                    <Text style={s.planNote}>{planNote(p, str)}</Text>
                  </View>
                  {p.trialDays && isSubscription(p.kind) ? (
                    <View style={s.trial}>
                      <Text style={s.trialText}>{str.premium.plans.trialBadge(p.trialDays)}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
        {note && (
          <Text style={s.note} accessibilityLiveRegion="polite">
            {note}
          </Text>
        )}
      </ScrollView>
      {premium.storeAvailable && plans && plans.length > 0 && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Button3D big height={58} label={busy ? str.premium.wait : ctaLabel(plan, str)} disabled={busy || !plan} onPress={buy} />
          <Text style={s.fine}>{finePrint(plan, str)}</Text>
          {(links.terms || links.privacy || premium.codeFlow !== "none") && (
            <View style={s.links}>
              {premium.codeFlow !== "none" ? (
                <Pressable onPress={premium.showRedeem} accessibilityRole="button" hitSlop={8}>
                  <Text style={s.link}>{t.haveCode}</Text>
                </Pressable>
              ) : null}
              {links.terms ? (
                <Pressable onPress={() => void Linking.openURL(links.terms!)} accessibilityRole="link" hitSlop={8}>
                  <Text style={s.link}>{t.terms}</Text>
                </Pressable>
              ) : null}
              {links.privacy ? (
                <Pressable onPress={() => void Linking.openURL(links.privacy!)} accessibilityRole="link" hitSlop={8}>
                  <Text style={s.link}>{t.privacy}</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg, zIndex: 100, elevation: 100 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: P.surface, alignItems: "center", justifyContent: "center" },
  closeText: { color: P.textSoft, fontSize: 26, lineHeight: 28 },
  restore: { minHeight: 44, justifyContent: "center", paddingHorizontal: 6 },
  restoreText: { color: P.textSoft, fontSize: 14, fontWeight: "600" },
  content: { paddingHorizontal: 22, paddingBottom: 24, gap: 10 },
  badge: { alignSelf: "center", backgroundColor: P.accent, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4, marginTop: 4 },
  badgeText: { color: P.onAccent, fontWeight: "800", letterSpacing: 2, fontSize: 13 },
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 30, lineHeight: 36, textAlign: "center" },
  lead: { color: P.textSoft, fontSize: 15, lineHeight: 21, textAlign: "center" },
  perk: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  check: { color: P.accent, fontSize: 16, fontWeight: "800", width: 20, textAlign: "center", marginTop: 1 },
  perkTitle: { color: P.text, fontSize: 15, fontWeight: "700" },
  perkNote: { color: P.muted, fontSize: 13 },
  info: { marginTop: 12, padding: 14, borderRadius: 14, backgroundColor: P.surface },
  infoText: { color: P.textSoft, fontSize: 14, lineHeight: 20, textAlign: "center" },
  plan: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 64, borderRadius: 16, borderWidth: 1, borderColor: P.line, backgroundColor: P.surface, paddingHorizontal: 16, paddingVertical: 12 },
  planOn: { borderWidth: 2, borderColor: P.accent, backgroundColor: P.surface2 },
  planTitle: { color: P.text, fontSize: 16, fontWeight: "800" },
  planNote: { color: P.textSoft, fontSize: 13 },
  trial: { backgroundColor: P.accent, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  trialText: { color: P.onAccent, fontSize: 10, fontWeight: "800" },
  note: { color: P.danger, fontSize: 14, textAlign: "center", marginTop: 8 },
  footer: { paddingHorizontal: 16, paddingTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: P.line, backgroundColor: P.bg },
  fine: { color: P.muted, fontSize: 12, lineHeight: 17, textAlign: "center" },
  links: { flexDirection: "row", justifyContent: "center", gap: 20 },
  link: { color: P.muted, fontSize: 12, textDecorationLine: "underline" },
});
