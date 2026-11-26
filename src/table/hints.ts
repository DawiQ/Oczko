// One-time tips at the first situations (oczko.hints.v1).
import type { GameSnapshot } from "../game/TableGame";
import { pl, type Strings } from "../i18n/pl";
import { readJSON, writeJSON, type KV } from "../storage/kv";

export const HINTS_KEY = "oczko.hints.v1";

export type HintId = "firstTurn" | "first21" | "firstBust" | "bank" | "persian";

/** Every tip (texts: `s.table.hints[id]`). */
export const HINT_IDS: readonly HintId[] = ["firstTurn", "first21", "firstBust", "bank", "persian"];

/** The tip in words. */
export const hintText = (id: HintId, s: Strings = pl): string => s.table.hints[id];

export interface HintsState {
  v: 1;
  seen: HintId[];
}

export const looksLikeHints = (x: unknown): x is HintsState =>
  typeof x === "object" && x !== null && (x as HintsState).v === 1 && Array.isArray((x as HintsState).seen) && (x as HintsState).seen.every((h) => HINT_IDS.includes(h));

export const loadHints = async (kv: KV): Promise<HintId[]> => (await readJSON(kv, HINTS_KEY, looksLikeHints))?.seen ?? [];
export const saveHints = (kv: KV, seen: HintId[]) => writeJSON(kv, HINTS_KEY, { v: 1, seen });
export const resetHints = (kv: KV) => saveHints(kv, []);

/** The tip that fits the moment (not seen yet), or null. */
export function hintFor(s: GameSnapshot, seen: readonly HintId[]): HintId | null {
  const fresh = (h: HintId) => !seen.includes(h);
  const me = s.seats[s.me];
  if (me?.persian && fresh("persian")) return "persian";
  if (me?.status === "bust" && fresh("firstBust")) return "firstBust";
  if (s.phase === "myTurn") {
    if (s.view.myValue.total === 21 && fresh("first21")) return "first21";
    if (s.rules.mode === "bank" && fresh("bank")) return "bank";
    if (fresh("firstTurn")) return "firstTurn";
  }
  return null;
}
