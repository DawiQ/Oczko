// Where the opponents sit on the felt: an arc over the top, from my left to
// my right, tighter and smaller for big tables. Pure.

export interface Spot {
  /** Centre of the seat, as a share of the felt's width / height. */
  x: number;
  y: number;
}

export type SeatSize = "lg" | "md" | "sm";

export function seatSize(opponents: number): SeatSize {
  return opponents <= 3 ? "lg" : opponents <= 5 ? "md" : "sm";
}

export const PORTRAIT_SIZE: Record<SeatSize, number> = { lg: 50, md: 42, sm: 34 };

/** Positions of `n` opponents (n ≥ 1), from the left. */
export function seatSpots(n: number): Spot[] {
  if (n <= 0) return [];
  if (n === 1) return [{ x: 0.5, y: 0.1 }];
  const wide = n >= 6;
  const from = wide ? 180 : 198;
  const to = wide ? 360 : 342;
  const rx = wide ? 0.42 : 0.38;
  const ry = wide ? 0.33 : 0.3;
  const cy = wide ? 0.42 : 0.4;
  return Array.from({ length: n }, (_, i) => {
    const a = ((from + (i * (to - from)) / (n - 1)) * Math.PI) / 180;
    return { x: 0.5 + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });
}

/** The opponents in seating order after me (they sit from my left round to my right). */
export function opponentsOf(seats: number, me: number): number[] {
  return Array.from({ length: seats - 1 }, (_, i) => (me + 1 + i) % seats);
}

/** Rotation (degrees) and horizontal offset of card `i` of `n` in my fan. */
export function fanCard(i: number, n: number): { rotate: number; dx: number; dy: number } {
  const spread = n <= 3 ? 12 : n <= 5 ? 9 : 6;
  const step = n <= 3 ? 30 : n <= 5 ? 24 : 17;
  const k = i - (n - 1) / 2;
  return { rotate: k * spread, dx: k * step, dy: Math.abs(k) * Math.abs(k) * 1.6 };
}
