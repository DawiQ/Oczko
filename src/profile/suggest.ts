// "Następny rywal": the character one level up from the strongest one you
// beat in at least half of 2+ matches (and have not played much yet). Pure.
import { PERSONAS, type Persona } from "../ai/personas";
import type { Stats } from "../storage/stats";

export const MIN_MATCHES = 2;

export interface Suggestion {
  persona: Persona;
  /** "Wygrane z Markiem: 3 z 4". */
  reason: string;
}

export function suggestNext(s: Stats): Suggestion | null {
  for (let i = PERSONAS.length - 2; i >= 0; i--) {
    const p = PERSONAS[i];
    const rec = s.byPersona[p.id];
    if (!rec || rec.matches < MIN_MATCHES || rec.won * 2 < rec.matches) continue;
    const next = PERSONAS[i + 1];
    const played = s.byPersona[next.id]?.matches ?? 0;
    if (played >= 3) return null; // already playing the next one
    return { persona: next, reason: `Wygrane z ${p.withName}: ${rec.won} z ${rec.matches}` };
  }
  return null;
}
