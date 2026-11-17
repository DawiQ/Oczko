// One-time tips at the first situations (oczko.hints.v1).
import type { GameSnapshot } from "../game/TableGame";
import { readJSON, writeJSON, type KV } from "../storage/kv";

export const HINTS_KEY = "oczko.hints.v1";

export type HintId = "firstTurn" | "first21" | "firstBust" | "bank" | "persian";

export const HINT_TEXT: Record<HintId, string> = {
  firstTurn: "„Dobieram” bierze kartę, „Starczy” kończy ruch. Punkt dostaje wynik najbliżej 21.",
  first21: "Masz 21 — wyżej się nie da. Powiedz „Starczy”.",
  firstBust: "Fura: więcej niż 21 przegrywa. Przy 17 i więcej każda karta to spore ryzyko.",
  bank: "Gra z bankierem: każdy gra tylko z bankiem, a bank rusza się ostatni i wygrywa remisy.",
  persian: "Perskie oczko: dwa asy wygrywają ze wszystkim.",
};

export interface HintsState {
  v: 1;
  seen: HintId[];
}

const IDS = Object.keys(HINT_TEXT);
export const looksLikeHints = (x: unknown): x is HintsState =>
  typeof x === "object" && x !== null && (x as HintsState).v === 1 && Array.isArray((x as HintsState).seen) && (x as HintsState).seen.every((h) => IDS.includes(h));

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
