// The table's pace (settings: slow / normal / fast).
export interface Pace {
  /** A bot's pause before its move while you still play (ms). */
  botDelayMs: number;
  /** The same once you are done for the round (ms). */
  fastDelayMs: number;
  /** After the deal, before the first move (ms). */
  dealDelayMs: number;
  /** Between hands shown at the end of the round (ms). */
  revealDelayMs: number;
}

export type PaceName = "slow" | "normal" | "fast";

export const PACES: Record<PaceName, Pace> = {
  slow: { botDelayMs: 1200, fastDelayMs: 450, dealDelayMs: 900, revealDelayMs: 700 },
  normal: { botDelayMs: 800, fastDelayMs: 250, dealDelayMs: 600, revealDelayMs: 450 },
  fast: { botDelayMs: 400, fastDelayMs: 120, dealDelayMs: 300, revealDelayMs: 220 },
};

/** No pauses at all (tests, "Pokaż wynik"). */
export const INSTANT: Pace = { botDelayMs: 0, fastDelayMs: 0, dealDelayMs: 0, revealDelayMs: 0 };
