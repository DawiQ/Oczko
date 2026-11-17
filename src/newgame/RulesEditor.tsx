// House-rule choices. `basic`: the onboarding's five questions; otherwise
// every option (new game's BottomSheet, settings).
import { StyleSheet, Text, View } from "react-native";

import { type Rules } from "../engine/rules";
import { Counter, Label, Segmented, SwitchRow } from "../ui/controls";
import { P } from "../ui/palette";
import { FACES, facesPreset, withFaces, type FacesPreset } from "./rulesText";

export function RulesEditor({ rules, onChange, basic, showMode = true }: { rules: Rules; onChange: (r: Rules) => void; basic?: boolean; showMode?: boolean }) {
  const preset = facesPreset(rules);
  const set = (patch: Partial<Rules>) => onChange({ ...rules, ...patch });
  const setPreset = (p: FacesPreset) => {
    if (p === "custom") onChange(withFaces(rules, rules.values[11], rules.values[12], rules.values[13] === 4 ? 5 : rules.values[13]));
    else onChange(withFaces(rules, ...FACES[p]));
  };
  return (
    <View>
      {showMode && (
        <>
          <Label>Tryb</Label>
          <Segmented
            label="Tryb gry"
            value={rules.mode}
            onChange={(mode) => set({ mode })}
            options={[
              { value: "family", label: "Rodzinne", sub: "wszyscy na wszystkich" },
              { value: "bank", label: "Z bankierem", sub: "każdy gra z bankiem" },
            ]}
          />
        </>
      )}
      <Label>Figury</Label>
      <Segmented
        label="Wartości figur"
        value={preset}
        onChange={setPreset}
        options={[
          { value: "234", label: "2 · 3 · 4", sub: "W · D · K" },
          { value: "345", label: "3 · 4 · 5", sub: "W · D · K" },
          { value: "custom", label: "Własne", sub: "dowolne" },
        ]}
      />
      {preset === "custom" && (
        <View style={s.faces}>
          {(
            [
              [11, "Walet"],
              [12, "Dama"],
              [13, "Król"],
            ] as const
          ).map(([k, name]) => (
            <View key={k} style={s.face}>
              <Text style={s.faceName}>{name}</Text>
              <Counter
                label={name}
                value={rules.values[k]}
                min={1}
                max={11}
                onChange={(v) => onChange(withFaces(rules, k === 11 ? v : rules.values[11], k === 12 ? v : rules.values[12], k === 13 ? v : rules.values[13]))}
              />
            </View>
          ))}
        </View>
      )}
      <Label>Talia</Label>
      <Segmented
        label="Talia"
        value={rules.deck}
        onChange={(deck) => set({ deck })}
        options={[
          { value: 52, label: "52 karty" },
          ...(basic ? [] : [{ value: 32 as const, label: "32 karty", sub: "od siódemki" }]),
          { value: 24, label: "24 karty", sub: "od dziewiątki" },
        ]}
      />
      <View style={s.pair}>
        <View style={{ flex: 1 }}>
          <Label>Perskie oczko</Label>
          <Segmented
            label="Perskie oczko"
            value={rules.persian ? 1 : 0}
            onChange={(v) => set({ persian: v === 1 })}
            options={[
              { value: 1, label: "Tak" },
              { value: 0, label: "Nie" },
            ]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Label>As</Label>
          <Segmented
            label="Wartość asa"
            value={rules.ace}
            onChange={(ace) => set({ ace })}
            options={[
              { value: "eleven", label: "11" },
              { value: "oneOrEleven", label: "1 lub 11" },
            ]}
          />
        </View>
      </View>
      {!basic && (
        <>
          <Label>Karty na start</Label>
          <Segmented
            label="Karty na start"
            value={rules.startCards}
            onChange={(startCards) => set({ startCards, maxCards: rules.maxCards !== null && rules.maxCards <= startCards ? startCards + 1 : rules.maxCards })}
            options={[
              { value: 1, label: "1 karta" },
              { value: 2, label: "2 karty" },
            ]}
          />
          <Label>Limit kart w ręce</Label>
          <Segmented
            label="Limit kart w ręce"
            value={rules.maxCards ?? 0}
            onChange={(v) => set({ maxCards: v === 0 ? null : v })}
            options={[
              { value: 0, label: "Bez" },
              { value: 5, label: "5" },
              { value: 6, label: "6" },
              { value: 8, label: "8" },
            ]}
          />
          {rules.mode === "family" ? (
            <>
              <Label>Remis</Label>
              <Segmented
                label="Remis w trybie rodzinnym"
                value={rules.familyTie}
                onChange={(familyTie) => set({ familyTie })}
                options={[
                  { value: "allScore", label: "Punkt dla każdego" },
                  { value: "noneScore", label: "Nikt nie punktuje" },
                ]}
              />
            </>
          ) : (
            <>
              <Label>Remis z bankiem</Label>
              <Segmented
                label="Remis z bankiem"
                value={rules.bankTie}
                onChange={(bankTie) => set({ bankTie })}
                options={[
                  { value: "bankWins", label: "Wygrywa bank" },
                  { value: "nobody", label: "Nikt" },
                ]}
              />
              <Label>Punkty banku</Label>
              <Segmented
                label="Punkty banku"
                value={rules.bankScoring}
                onChange={(bankScoring) => set({ bankScoring })}
                options={[
                  { value: "majority", label: "Za większość", sub: "1 pkt za rundę" },
                  { value: "perDuel", label: "Za pojedynek", sub: "1 pkt za każdy" },
                ]}
              />
              <Label>Bank przechodzi</Label>
              <Segmented
                label="Kiedy bank przechodzi"
                value={rules.bankRotation}
                onChange={(bankRotation) => set({ bankRotation })}
                options={[
                  { value: "everyRound", label: "Co rundę" },
                  { value: "onPersian", label: "Po perskim" },
                  { value: "fixed", label: "Stały" },
                ]}
              />
              <SwitchRow
                label="Fura gracza przegrywa zawsze"
                sub="Także gdy bank też ma furę"
                value={rules.playerBustLoses}
                onChange={(playerBustLoses) => set({ playerBustLoses })}
              />
            </>
          )}
          <SwitchRow
            label="Furę widać od razu"
            sub="Karty z furą odkrywane natychmiast"
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
  pair: { flexDirection: "row", gap: 10 },
});
