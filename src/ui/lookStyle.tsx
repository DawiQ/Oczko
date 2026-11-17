// The looks in use (card deck, felt, card back) for everything that draws
// cards or the table. Without a provider: the classic set.
import { createContext, useContext, type ReactNode } from "react";
import { Image, StyleSheet, View, type ImageResizeMode, type StyleProp, type ViewStyle } from "react-native";

import { BACKS, DECKS, FELTS, lookById, type BackLook, type DeckLook, type FeltLook, type LookChoice } from "../premium/looks";
import { ART } from "./art";

export interface LookStyle {
  deck: DeckLook;
  felt: FeltLook;
  back: BackLook;
}

export const CLASSIC_STYLE: LookStyle = { deck: DECKS[0], felt: FELTS[0], back: BACKS[0] };

export function styleOf(c: LookChoice): LookStyle {
  const deck = lookById(c.deck);
  const felt = lookById(c.felt);
  const back = lookById(c.back);
  return {
    deck: deck?.kind === "deck" ? deck : DECKS[0],
    felt: felt?.kind === "felt" ? felt : FELTS[0],
    back: back?.kind === "back" ? back : BACKS[0],
  };
}

const LookStyleContext = createContext<LookStyle>(CLASSIC_STYLE);

export const useLookStyle = (): LookStyle => useContext(LookStyleContext);

export function LookStyleProvider({ value, children }: { value: LookStyle; children: ReactNode }) {
  return <LookStyleContext.Provider value={value}>{children}</LookStyleContext.Provider>;
}

/** The table's felt (fills its parent): the texture alone, or over a colour. */
export function Felt({
  resizeMode = "stretch",
  look,
  style,
}: {
  resizeMode?: ImageResizeMode;
  /** A felt to show instead of the one in use (a preview). */
  look?: FeltLook;
  style?: StyleProp<ViewStyle>;
}) {
  const inUse = useLookStyle().felt;
  const felt = look ?? inUse;
  return (
    <View style={[StyleSheet.absoluteFill, felt.color ? { backgroundColor: felt.color } : null, style]} pointerEvents="none">
      <Image source={ART.felt} style={[StyleSheet.absoluteFill, felt.color ? { opacity: 0.28 } : null]} resizeMode={resizeMode} />
    </View>
  );
}
