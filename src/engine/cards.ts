// Cards: 0..51, rank = (id >> 2) + 2 (2..14; 11 = W, 12 = D, 13 = K, 14 = A),
// suit = id & 3 (0 kier, 1 karo, 2 trefl, 3 pik). Pure, no React.
export type Card = number;
export type DeckSize = 24 | 32 | 52;

export const rankOf = (c: Card): number => (c >> 2) + 2;
export const suitOf = (c: Card): number => c & 3;
export const cardOf = (rank: number, suit: number): Card => ((rank - 2) << 2) | suit;
export const isCard = (x: unknown): x is Card => Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 51;

/** Lowest rank in a deck: 24 → 9 (9–A), 32 → 7 (7–A), 52 → 2 (2–A). */
export const LOWEST_RANK: Record<DeckSize, number> = { 24: 9, 32: 7, 52: 2 };

/** The deck in id order. */
export function makeDeck(size: DeckSize): Card[] {
  const from = cardOf(LOWEST_RANK[size], 0);
  return Array.from({ length: 52 - from }, (_, i) => from + i);
}
