// The computer opponents: one character per level (weakest first, the order
// measured by `npm run tournament`, docs/BOTS.md). A table may seat a
// character more than once: the copies are numbered ("Ola II").
import type { PolicySpec } from "./policies";

export type PersonaId = "zosia" | "kuba" | "hela" | "ola" | "witek" | "marek" | "profesor" | "hrabia";

export interface Persona {
  id: PersonaId;
  name: string;
  /** "z …": the name in the instrumental case. */
  withName: string;
  /** Short label of the level / style. */
  label: string;
  blurb: string;
  color: string;
  policy: PolicySpec;
}

export const PERSONAS: Persona[] = [
  { id: "zosia", name: "Zosia", withName: "Zosią", label: "Początki", blurb: "Dobiera, póki karty są ładne", color: "#7FD3E6", policy: { kind: "noisy", t: 15, eps: 0.25 } },
  { id: "kuba", name: "Kuba", withName: "Kubą", label: "Łatwy", blurb: "Staje już przy 14", color: "#6FCF97", policy: { kind: "threshold", t: 14 } },
  { id: "witek", name: "Witek", withName: "Witkiem", label: "Ryzykant", blurb: "Ciągnie do 20, często ma furę", color: "#FF8FA3", policy: { kind: "threshold", t: 20 } },
  { id: "hela", name: "Hela", withName: "Helą", label: "Ostrożna", blurb: "Nie lubi ryzyka — staje przy 16", color: "#B9D86A", policy: { kind: "threshold", t: 16 } },
  { id: "ola", name: "Ola", withName: "Olą", label: "Średni", blurb: "Gra rozsądnie, staje przy 17", color: "#F0B44C", policy: { kind: "threshold", t: 17 } },
  { id: "marek", name: "Marek", withName: "Markiem", label: "Trudny", blurb: "Patrzy, kto jeszcze jest w grze", color: "#F2785C", policy: { kind: "contextual", t: 17 } },
  { id: "profesor", name: "Profesor", withName: "Profesorem", label: "Ekspert", blurb: "Szacuje szanse przed każdym ruchem", color: "#7FA8FF", policy: { kind: "evaluator", samples: 40, standAt: 17 } },
  { id: "hrabia", name: "Hrabia", withName: "Hrabią", label: "Mistrz", blurb: "Rozważa tysiące rozdań na ruch", color: "#B39DFF", policy: { kind: "evaluator", samples: 1500, standAt: 17 } },
];

export const personaById = (id: string): Persona | undefined => PERSONAS.find((p) => p.id === id);

const COPY = ["", " II", " III", " IV", " V", " VI", " VII", " VIII"];

/** Seat names for a table's bots: repeats of a character get a number. */
export function seatNames(ids: readonly PersonaId[]): string[] {
  const seen = new Map<PersonaId, number>();
  return ids.map((id) => {
    const k = seen.get(id) ?? 0;
    seen.set(id, k + 1);
    return (personaById(id)?.name ?? id) + COPY[Math.min(k, COPY.length - 1)];
  });
}
