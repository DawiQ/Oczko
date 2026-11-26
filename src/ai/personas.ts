// The computer opponents: one character per level (weakest first, the order
// measured by `npm run tournament`, docs/BOTS.md). A table may seat a
// character more than once: the copies are numbered ("Ola II").
import type { PolicySpec } from "./policies";

export type PersonaId = "zosia" | "kuba" | "hela" | "ola" | "witek" | "marek" | "profesor" | "hrabia";

export interface Persona {
  id: PersonaId;
  color: string;
  policy: PolicySpec;
}

// Names, labels and descriptions: the dictionaries (src/i18n, `personas`).
export const PERSONAS: Persona[] = [
  { id: "zosia", color: "#7FD3E6", policy: { kind: "noisy", t: 15, eps: 0.25 } },
  { id: "kuba", color: "#6FCF97", policy: { kind: "threshold", t: 14 } },
  { id: "witek", color: "#FF8FA3", policy: { kind: "threshold", t: 20 } },
  { id: "hela", color: "#B9D86A", policy: { kind: "threshold", t: 16 } },
  { id: "ola", color: "#F0B44C", policy: { kind: "threshold", t: 17 } },
  { id: "marek", color: "#F2785C", policy: { kind: "contextual", t: 17 } },
  { id: "profesor", color: "#7FA8FF", policy: { kind: "evaluator", samples: 40, standAt: 17 } },
  { id: "hrabia", color: "#B39DFF", policy: { kind: "evaluator", samples: 1500, standAt: 17 } },
];

export const personaById = (id: string): Persona | undefined => PERSONAS.find((p) => p.id === id);

const COPY = ["", " II", " III", " IV", " V", " VI", " VII", " VIII"];

/** Seat names for a table's bots (in the given language): repeats of a
 *  character get a number. */
export function seatNames(ids: readonly PersonaId[], names: (id: PersonaId) => string): string[] {
  const seen = new Map<PersonaId, number>();
  return ids.map((id) => {
    const k = seen.get(id) ?? 0;
    seen.set(id, k + 1);
    return names(id) + COPY[Math.min(k, COPY.length - 1)];
  });
}
