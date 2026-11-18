// House-rule choices. `basic`: the onboarding's five questions; otherwise
// every option (new game's BottomSheet, settings).
import { StyleSheet, Text, View } from "react-native";

import type { DeckSize } from "../engine/cards";
import { presetForLocales, presetOf, PRESET_IDS, withPreset, type PresetId } from "../engine/presets";
import { type Rules } from "../engine/rules";
import { deviceLocales, useStrings } from "../i18n";
import { Counter, Label, Segmented, SwitchRow } from "../ui/controls";
import { P } from "../ui/palette";
import { FACES, facesPreset, withFaces, type FacesPreset } from "./rulesText";

const DECKS: DeckSize[] = [52, 36, 32, 24];

export function RulesEditor({
  rules,
  onChange,
  basic,
  showMode = true,
  preferPreset,
}: {
  rules: Rules;
  onChange: (r: Rules) => void;
  basic?: boolean;
  showMode?: boolean;
  /** The set shown when several have the same cards (the phone's country). */
  preferPreset?: PresetId;
}) {
  const str = useStrings();
  const t = str.rules.editor;
  const preset = facesPreset(rules);
  const set = (patch: Partial<Rules>) => onChange({ ...rules, ...patch });
  const setPreset = (p: FacesPreset) => {
    if (p === "custom") onChange(withFaces(rules, rules.values[11], rules.values[12], rules.values[13] === 4 ? 5 : rules.values[13]));
    else onChange(withFaces(rules, ...FACES[p]));
  };
  const regional = presetOf(rules, preferPreset ?? presetForLocales(deviceLocales()));
  return (
    <View>
      <Label>{t.preset}</Label>
      <Segmented
        label={t.preset}
        value={regional ?? ("custom" as const)}
        onChange={(id) => id !== "custom" && onChange(withPreset(rules, id))}
        options={PRESET_IDS.map((id) => ({ value: id as PresetId | "custom", label: t.presets[id].name, sub: t.presets[id].sub }))}
      />
      {!regional && <Text style={s.custom}>{t.presetCustom}</Text>}
      {showMode && (
        <>
          <Label>{t.mode}</Label>
          <Segmented
            label={t.modeA11y}
            value={rules.mode}
            onChange={(mode) => set({ mode })}
            options={[
              { value: "family", label: str.rules.modes.family, sub: t.modeSubs.family },
              { value: "bank", label: str.rules.modes.bank, sub: t.modeSubs.bank },
            ]}
          />
        </>
      )}
      <Label>{t.faces}</Label>
      <Segmented
        label={t.facesA11y}
        value={preset}
        onChange={setPreset}
        options={[
          { value: "234", label: "2 · 3 · 4", sub: t.facesSub },
          { value: "345", label: "3 · 4 · 5", sub: t.facesSub },
          { value: "112", label: "1 · 1 · 2", sub: t.facesSub },
          { value: "custom", label: t.custom, sub: t.customSub },
        ]}
      />
      {preset === "custom" && (
        <View style={s.faces}>
          {([11, 12, 13] as const).map((k) => (
            <View key={k} style={s.face}>
              <Text style={s.faceName}>{t.faceNames[k]}</Text>
              <Counter
                label={t.faceNames[k]}
                value={rules.values[k]}
                min={1}
                max={11}
                onChange={(v) => onChange(withFaces(rules, k === 11 ? v : rules.values[11], k === 12 ? v : rules.values[12], k === 13 ? v : rules.values[13]))}
              />
            </View>
          ))}
        </View>
      )}
      <Label>{t.deck}</Label>
      <Segmented
        label={t.deck}
        value={rules.deck}
        onChange={(deck) => set({ deck })}
        options={DECKS.map((value) => ({ value, ...t.deckOptions[value] }))}
      />
      <Label>{t.twoAces}</Label>
      <Segmented
        label={t.twoAces}
        value={rules.persian}
        // The bank passing on two aces needs the rule where they win.
        onChange={(persian) => set({ persian, ...(persian !== "wins" && rules.bankRotation === "onPersian" ? { bankRotation: "everyRound" as const } : {}) })}
        options={(["wins", "is21", "off"] as const).map((value) => ({ value, label: t.twoAcesOptions[value] }))}
      />
      <Label>{t.ace}</Label>
      <Segmented
        label={t.aceA11y}
        value={rules.ace}
        onChange={(ace) => set({ ace })}
        options={[
          { value: "eleven", label: t.aceOptions.eleven },
          { value: "oneOrEleven", label: t.aceOptions.oneOrEleven },
        ]}
      />
      {!basic && (
        <>
          <Label>{t.startCards}</Label>
          <Segmented
            label={t.startCards}
            value={rules.startCards}
            onChange={(startCards) => set({ startCards, maxCards: rules.maxCards !== null && rules.maxCards <= startCards ? startCards + 1 : rules.maxCards })}
            options={[
              { value: 1, label: t.startCardsOptions[1] },
              { value: 2, label: t.startCardsOptions[2] },
            ]}
          />
          <Label>{t.maxCards}</Label>
          <Segmented
            label={t.maxCards}
            value={rules.maxCards ?? 0}
            onChange={(v) => set({ maxCards: v === 0 ? null : v })}
            options={[
              { value: 0, label: t.noLimit },
              { value: 5, label: "5" },
              { value: 6, label: "6" },
              { value: 8, label: "8" },
            ]}
          />
          {rules.mode === "family" ? (
            <>
              <Label>{t.familyTie}</Label>
              <Segmented
                label={t.familyTieA11y}
                value={rules.familyTie}
                onChange={(familyTie) => set({ familyTie })}
                options={[
                  { value: "allScore", label: t.familyTieOptions.allScore },
                  { value: "noneScore", label: t.familyTieOptions.noneScore },
                ]}
              />
            </>
          ) : (
            <>
              <Label>{t.bankTie}</Label>
              <Segmented
                label={t.bankTie}
                value={rules.bankTie}
                onChange={(bankTie) => set({ bankTie })}
                options={[
                  { value: "bankWins", label: t.bankTieOptions.bankWins },
                  { value: "nobody", label: t.bankTieOptions.nobody },
                ]}
              />
              <Label>{t.bankScoring}</Label>
              <Segmented
                label={t.bankScoring}
                value={rules.bankScoring}
                onChange={(bankScoring) => set({ bankScoring })}
                options={[
                  { value: "majority", ...t.bankScoringOptions.majority },
                  { value: "perDuel", ...t.bankScoringOptions.perDuel },
                ]}
              />
              <Label>{t.bankRotation}</Label>
              <Segmented
                label={t.bankRotationA11y}
                value={rules.bankRotation}
                onChange={(bankRotation) => set({ bankRotation })}
                options={[
                  { value: "everyRound" as const, label: t.bankRotationOptions.everyRound },
                  ...(rules.persian === "wins" ? [{ value: "onPersian" as const, label: t.bankRotationOptions.onPersian }] : []),
                  { value: "fixed" as const, label: t.bankRotationOptions.fixed },
                ]}
              />
              <SwitchRow label={t.bankTo17} sub={t.bankTo17Sub} value={rules.bankTo17} onChange={(bankTo17) => set({ bankTo17 })} />
              <SwitchRow
                label={t.playerBustLoses}
                sub={t.playerBustLosesSub}
                value={rules.playerBustLoses}
                onChange={(playerBustLoses) => set({ playerBustLoses })}
              />
            </>
          )}
          <SwitchRow
            label={t.bustRevealed}
            sub={t.bustRevealedSub}
            value={rules.bustRevealed}
            onChange={(bustRevealed) => set({ bustRevealed })}
          />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  faces: { flexDirection: "row", gap: 8, marginTop: 10 },
  face: { flex: 1, alignItems: "center", gap: 4 },
  faceName: { color: P.textSoft, fontSize: 12, fontWeight: "600" },
  custom: { color: P.muted, fontSize: 12, marginTop: 4 },
});
