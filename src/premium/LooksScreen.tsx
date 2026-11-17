// "Wygląd": card decks, felts and card backs with a live preview. The classic
// set is free; any other look can be tried for 24 h for a rewarded ad, or all
// of them with Oczko Pro.
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cardOf } from "../engine/cards";
import { Button3D } from "../ui/Button3D";
import { CardBack, CardFace } from "../ui/cards";
import { Header } from "../ui/Header";
import { Felt, styleOf } from "../ui/lookStyle";
import { P } from "../ui/palette";
import { ProTag } from "./LimitSheet";
import { BACKS, DECKS, FELTS, isFreeLook, lookById, type Look, type LookChoice, type LookKind } from "./looks";
import { useLooks } from "./LooksProvider";
import { usePremium } from "./PremiumProvider";

const TABS: { kind: LookKind; label: string; items: Look[] }[] = [
  { kind: "deck", label: "Talie", items: DECKS },
  { kind: "felt", label: "Sukna", items: FELTS },
  { kind: "back", label: "Rewersy", items: BACKS },
];

const clock = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function LooksScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const premium = usePremium();
  const { effective, setChoice } = useLooks();
  const [tab, setTab] = useState<LookKind>("deck");
  // What the preview shows: the looks in use, plus the one being looked at.
  const [preview, setPreview] = useState<LookChoice>(effective);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const shown = styleOf(preview);
  const current = preview[tab];
  const currentLook = lookById(current);
  const locked = !premium.lookUnlocked(current);

  const pick = (l: Look) => {
    setFailed(false);
    const next = { ...preview, [l.kind]: l.id };
    setPreview(next);
    if (premium.lookUnlocked(l.id)) setChoice({ ...effective, [l.kind]: l.id });
  };
  const tryIt = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    const ok = await premium.watchAd({ kind: "look", id: current });
    setBusy(false);
    if (ok) setChoice({ ...effective, [tab]: current });
    else setFailed(true);
  };

  return (
    <View style={s.screen}>
      <Header title="Wygląd" onBack={onBack} />
      <View style={s.preview} accessible accessibilityLabel={`Podgląd: ${lookById(preview.deck)?.name}, sukno ${lookById(preview.felt)?.name}, rewers ${lookById(preview.back)?.name}`}>
        <Felt look={shown.felt} resizeMode="cover" />
        <CardBack size="lg" back={shown.back} style={{ transform: [{ rotate: "-10deg" }], marginRight: -14 }} />
        <CardFace card={cardOf(14, 3)} size="lg" deck={shown.deck} />
        <CardFace card={cardOf(12, 0)} size="lg" deck={shown.deck} style={{ transform: [{ rotate: "8deg" }], marginLeft: -14 }} />
        <CardFace card={cardOf(10, 1)} size="lg" deck={shown.deck} style={{ transform: [{ rotate: "14deg" }], marginLeft: -18, marginTop: 10 }} />
      </View>

      <View style={s.tabs} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable
            key={t.kind}
            onPress={() => setTab(t.kind)}
            style={[s.tab, tab === t.kind && s.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.kind }}
          >
            <Text style={[s.tabText, tab === t.kind && s.tabTextOn]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.grid}>
        {TABS.find((t) => t.kind === tab)!.items.map((l) => {
          const on = preview[l.kind] === l.id;
          const inUse = effective[l.kind] === l.id;
          const free = isFreeLook(l.id);
          const trial = premium.pro ? null : premium.lookTrialEnds(l.id);
          const st = styleOf({ ...preview, [l.kind]: l.id });
          return (
            <Pressable
              key={l.id}
              onPress={() => pick(l)}
              style={[s.item, on && s.itemOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${l.name}${inUse ? ", w użyciu" : ""}${!free && !premium.pro ? ", w Oczko Pro" : ""}`}
            >
              <View style={s.thumb}>
                {l.kind === "felt" ? (
                  <View style={s.feltThumb}>
                    <Felt look={st.felt} resizeMode="cover" />
                  </View>
                ) : l.kind === "back" ? (
                  <CardBack size="sm" back={st.back} />
                ) : (
                  <CardFace card={cardOf(14, 0)} size="sm" deck={st.deck} />
                )}
              </View>
              <Text style={s.itemName} numberOfLines={1}>
                {l.name}
              </Text>
              <Text style={s.itemNote} numberOfLines={1}>
                {inUse ? "w użyciu" : trial ? `do ${clock(trial)}` : l.note || " "}
              </Text>
              {!free && !premium.pro && (
                <View style={s.tag}>
                  <ProTag small />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {locked && currentLook && (
        <View style={[s.footer, { paddingBottom: insets.bottom + 14 }]}>
          <Text style={s.footerNote}>{failed ? "Reklama niedostępna — spróbuj za chwilę." : `„${currentLook.name}” · podgląd`}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {premium.adsAvailable && (
              <Button3D tone="dark" style={{ flex: 1 }} label={busy ? "Chwileczkę…" : "▶ Wypróbuj 24 h"} disabled={busy} onPress={tryIt} />
            )}
            <Button3D style={{ flex: 1 }} label="Wszystkie w Pro" onPress={() => premium.showPaywall("looks")} />
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  preview: { marginHorizontal: 16, height: 170, borderRadius: 24, overflow: "hidden", flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: P.feltLine },
  tabs: { flexDirection: "row", gap: 4, marginHorizontal: 16, marginTop: 14, padding: 4, borderRadius: 12, backgroundColor: P.surface },
  tab: { flex: 1, minHeight: 44, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: P.surface2 },
  tabText: { color: P.textSoft, fontSize: 14, fontWeight: "600" },
  tabTextOn: { color: P.text, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 16 },
  item: { width: "31%", flexGrow: 1, maxWidth: "33%", alignItems: "center", gap: 6, borderRadius: 16, borderWidth: 1, borderColor: P.line, backgroundColor: P.surface, paddingVertical: 12, paddingHorizontal: 6 },
  itemOn: { borderWidth: 2, borderColor: P.accent },
  thumb: { height: 60, alignItems: "center", justifyContent: "center" },
  feltThumb: { width: 60, height: 44, borderRadius: 10, overflow: "hidden" },
  itemName: { color: P.text, fontSize: 13, fontWeight: "700" },
  itemNote: { color: P.muted, fontSize: 11 },
  tag: { position: "absolute", right: 6, top: 6 },
  footer: { paddingHorizontal: 16, paddingTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: P.line },
  footerNote: { color: P.textSoft, fontSize: 13, textAlign: "center" },
});
