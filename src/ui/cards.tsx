// Playing-card visuals shared by the screens.
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { rankOf, suitOf, type Card } from "../engine/cards";
import type { BackLook, DeckLook } from "../premium/looks";
import { DISPLAY } from "./fonts";
import { useLookStyle } from "./lookStyle";
import { P } from "./palette";

/** Index labels by rank 2..14. */
const RANK_LABELS: Record<number, string> = {
  2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "W", 12: "D", 13: "K", 14: "A",
};
// U+FE0E (text presentation) stops iOS from drawing the suits as emoji.
export const SUIT_GLYPHS = ["♥︎", "♦︎", "♣︎", "♠︎"];
export const SUIT_NAMES = ["kier", "karo", "trefl", "pik"];
/** Screen-reader names by rank: "dama", "dziewiątka"… */
const RANK_SPOKEN: Record<number, string> = {
  2: "dwójka", 3: "trójka", 4: "czwórka", 5: "piątka", 6: "szóstka", 7: "siódemka", 8: "ósemka",
  9: "dziewiątka", 10: "dziesiątka", 11: "walet", 12: "dama", 13: "król", 14: "as",
};

export const rankLabel = (c: Card) => RANK_LABELS[rankOf(c)];
export const isRed = (c: Card) => suitOf(c) < 2;
/** "D♠︎" */
export const cardLabel = (c: Card) => `${rankLabel(c)}${SUIT_GLYPHS[suitOf(c)]}`;
/** "dama pik" */
export const cardSpoken = (c: Card) => `${RANK_SPOKEN[rankOf(c)]} ${SUIT_NAMES[suitOf(c)]}`;
/** The rank alone, for "Dobrana karta: dama". */
export const rankSpoken = (c: Card) => RANK_SPOKEN[rankOf(c)];

export type CardSize = "lg" | "md" | "sm";
export const CARD_DIM: Record<CardSize, { w: number; h: number; rank: number; suit: number; r: number }> = {
  lg: { w: 66, h: 94, rank: 20, suit: 32, r: 9 },
  md: { w: 46, h: 66, rank: 15, suit: 22, r: 7 },
  sm: { w: 30, h: 43, rank: 11, suit: 0, r: 5 },
};

export function CardFace({
  card,
  size = "lg",
  highlight,
  style,
  deck: deckIn,
}: {
  card: Card;
  size?: CardSize;
  highlight?: boolean;
  style?: StyleProp<ViewStyle>;
  /** A deck to draw instead of the one in use (a preview). */
  deck?: DeckLook;
}) {
  const d = CARD_DIM[size];
  const inUse = useLookStyle().deck;
  const deck = deckIn ?? inUse;
  const color = deck.ink[suitOf(card)];
  const scale = deck.scale ?? 1;
  const font = deck.sans ? { fontWeight: "800" as const, fontFamily: undefined } : null;
  const suit = SUIT_GLYPHS[suitOf(card)];
  return (
    <View
      style={[s.card, { width: d.w, height: d.h, borderRadius: d.r, backgroundColor: deck.face, borderColor: deck.line }, highlight && s.highlight, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={cardSpoken(card)}
    >
      {/* Corner index (rank + suit): the only part visible when cards overlap. */}
      <View style={[s.index, size === "sm" && s.indexSm]}>
        <Text style={[s.rank, { color, fontSize: Math.round(d.rank * scale), lineHeight: Math.round(d.rank * scale * 1.1) }, font]}>{rankLabel(card)}</Text>
        <Text style={[s.indexSuit, { color, fontSize: Math.round(d.rank * 0.8), lineHeight: Math.round(d.rank * 0.9) }]}>{suit}</Text>
      </View>
      {d.suit > 0 && <Text style={[s.suit, { color, fontSize: d.suit }]}>{suit}</Text>}
    </View>
  );
}

export function CardBack({ size = "sm", style, back: backIn }: { size?: CardSize | "xs"; style?: StyleProp<ViewStyle>; /** A back instead of the one in use (a preview). */ back?: BackLook }) {
  const d = size === "xs" ? { w: 22, h: 32, r: 4 } : CARD_DIM[size];
  const inUse = useLookStyle().back;
  const back = backIn ?? inUse;
  return (
    <View
      style={[s.back, { width: d.w, height: d.h, borderRadius: d.r, borderColor: back.frame }, back.color ? { backgroundColor: back.color } : null, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="zakryta karta"
    >
      <View style={[s.backInner, { borderRadius: Math.max(2, d.r - 3) }]} />
      {back.color === null && <View style={s.check} />}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: P.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: P.cardLine,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  highlight: { borderWidth: 3, borderColor: P.accent },
  index: { position: "absolute", top: 4, left: 6, alignItems: "center" },
  indexSm: { top: 3, left: 4 },
  rank: { fontFamily: DISPLAY, fontWeight: "normal", includeFontPadding: false },
  indexSuit: { includeFontPadding: false, marginTop: 1 },
  suit: { position: "absolute", alignSelf: "center", top: "34%" },
  back: { backgroundColor: P.back, borderWidth: 2, borderColor: "#F3EEE2", overflow: "hidden", elevation: 2 },
  /** The classic back's light check pattern (a few stripes). */
  check: { position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderWidth: 1, borderColor: "rgba(243,238,226,0.25)", borderStyle: "dashed" },
  backInner: { position: "absolute", top: 3, left: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: "rgba(243,238,226,0.5)" },
});
