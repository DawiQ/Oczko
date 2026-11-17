// Lobby (the "Graj" tab): logo, new game, playing with friends, training,
// the house rules in short and the history (layout: docs/mockups, screen 1).
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cardOf } from "../engine/cards";
import { ART } from "../ui/art";
import { Button3D } from "../ui/Button3D";
import { CardFace } from "../ui/cards";
import { DISPLAY } from "../ui/fonts";
import { P } from "../ui/palette";
import { Portrait } from "../ui/Portrait";

/** The saved game shown in the lobby. */
export interface ResumeInfo {
  title: string;
  line: string;
  seats: { name: string; color: string; score: number }[];
}

/** House rules in two short lines (until the rules come from the onboarding). */
export const DEFAULT_RULES_SUMMARY = ["Rodzinne · W 2, D 3, K 4 · 52 karty", "Perskie oczko · As za 11"];

const ACE_HEARTS = cardOf(14, 0);
const ACE_SPADES = cardOf(14, 3);

function Logo() {
  return (
    <View style={s.logo} accessible accessibilityRole="header" accessibilityLabel="Oczko — gra w karty do 21">
      <View style={s.logoCards} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <CardFace card={ACE_HEARTS} size="sm" style={{ position: "absolute", left: 0, top: 4, transform: [{ rotate: "-12deg" }] }} />
        <CardFace card={ACE_SPADES} size="sm" style={{ position: "absolute", left: 14, top: 0, transform: [{ rotate: "8deg" }] }} />
      </View>
      <View>
        <Text style={s.title}>Oczko</Text>
        <Text style={s.subtitle}>gra w karty do 21</Text>
      </View>
    </View>
  );
}

function IconButton({ icon, label, onPress }: { icon: number; label: string; onPress: () => void }) {
  return (
    <Pressable style={s.iconBtn} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      <Image source={icon} style={s.iconBtnImage} />
    </Pressable>
  );
}

function Row({
  icon,
  title,
  subtitle,
  action,
  onPress,
}: {
  icon?: number;
  title: string;
  subtitle: string;
  /** Text on the right instead of the chevron, e.g. "Zmień". */
  action?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.panel} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`}>
      {icon !== undefined && <Image source={icon} style={s.rowIcon} />}
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      {action ? <Text style={s.rowAction}>{action}</Text> : <Image source={ART.iconChevron} style={s.chevron} />}
    </Pressable>
  );
}

function ResumeCard({ info, onResume }: { info: ResumeInfo; onResume: () => void }) {
  return (
    <View style={[s.card, { borderColor: P.accentDark }]}>
      <View style={s.resumeHead}>
        <Text style={s.rowTitle}>Wznów partię</Text>
        <Text style={s.resumeBadge}>{info.title}</Text>
      </View>
      <Text style={s.rowSub}>{info.line}</Text>
      <View style={s.resumeSeats} accessible accessibilityLabel={`Punkty: ${info.seats.map((x) => `${x.name} ${x.score}`).join(", ")}`}>
        {info.seats.map((x) => (
          <View key={x.name} style={s.resumeSeat}>
            <Portrait name={x.name} size={28} color={x.color} />
            <Text style={s.resumeScore}>{x.score}</Text>
          </View>
        ))}
      </View>
      <Button3D label="Wznów" height={46} onPress={onResume} testID="home-resume" />
    </View>
  );
}

export function HomeScreen({
  rulesSummary = DEFAULT_RULES_SUMMARY,
  resume,
  onResume,
  onNewGame,
  onFriends,
  onTraining,
  onHouseRules,
  onHistory,
  onSettings,
}: {
  rulesSummary?: string[];
  resume?: ResumeInfo | null;
  onResume?: () => void;
  onNewGame: () => void;
  onFriends: () => void;
  onTraining: () => void;
  onHouseRules: () => void;
  onHistory: () => void;
  onSettings: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.content, { paddingTop: insets.top + 12 }]}>
      <View style={s.top}>
        <Logo />
        <IconButton icon={ART.iconGear} label="Ustawienia" onPress={onSettings} />
      </View>

      {resume && onResume && <ResumeCard info={resume} onResume={onResume} />}

      <Button3D label="Nowa gra" big height={64} onPress={onNewGame} testID="home-new-game" />

      <View style={s.pair}>
        <Button3D tone="dark" height={48} onPress={onFriends} style={{ flex: 1 }} accessibilityLabel="Ze znajomymi przez Wi‑Fi">
          <View style={s.btnInner}>
            <Image source={ART.iconWifi} style={s.btnIcon} />
            <Text style={s.btnText}>Ze znajomymi</Text>
          </View>
        </Button3D>
        <Button3D tone="dark" height={48} onPress={onTraining} style={{ flex: 1 }} accessibilityLabel="Trening">
          <View style={s.btnInner}>
            <Image source={ART.iconTarget} style={s.btnIcon} />
            <Text style={s.btnText}>Trening</Text>
          </View>
        </Button3D>
      </View>

      <Row title="Jak grasz u siebie" subtitle={rulesSummary.join("\n")} action="Zmień" onPress={onHouseRules} />
      <Row icon={ART.iconHistory} title="Historia" subtitle="Rozegrane partie i powtórki" onPress={onHistory} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.bg },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  logo: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCards: { width: 46, height: 46 },
  title: { color: P.text, fontFamily: DISPLAY, fontSize: 32, lineHeight: 36 },
  subtitle: { color: P.muted, fontSize: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: P.surface, borderWidth: 1, borderColor: P.line, alignItems: "center", justifyContent: "center" },
  iconBtnImage: { width: 20, height: 20, tintColor: P.textSoft },
  pair: { flexDirection: "row", gap: 10 },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnIcon: { width: 18, height: 18, tintColor: P.text },
  btnText: { color: P.text, fontFamily: DISPLAY, fontSize: 15 },
  card: { backgroundColor: P.surface, borderWidth: 1, borderRadius: 18, padding: 14, gap: 8 },
  resumeHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resumeBadge: { color: P.muted, fontSize: 11, fontWeight: "700", backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, overflow: "hidden" },
  resumeSeats: { flexDirection: "row", gap: 6, marginBottom: 4 },
  resumeSeat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  resumeScore: { color: P.text, fontFamily: DISPLAY, fontSize: 15 },
  panel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    backgroundColor: P.surface,
    borderColor: P.line,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIcon: { width: 20, height: 20, tintColor: P.textSoft },
  rowTitle: { color: P.text, fontSize: 15, fontWeight: "700" },
  rowSub: { color: P.muted, fontSize: 12.5, marginTop: 2, lineHeight: 18 },
  rowAction: { color: P.accent, fontSize: 14, fontWeight: "700" },
  chevron: { width: 16, height: 16, tintColor: P.muted },
});
