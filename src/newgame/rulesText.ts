// House rules in words: the lobby's two lines, one sentence, presets of the
// face values. Pure.
import { CLASSIC_VALUES, type FaceRank, type Rules } from "../engine/rules";

export type FacesPreset = "234" | "345" | "custom";

export const FACES: Record<Exclude<FacesPreset, "custom">, [number, number, number]> = { "234": [2, 3, 4], "345": [3, 4, 5] };

export function facesPreset(r: Rules): FacesPreset {
  const w = [r.values[11], r.values[12], r.values[13]];
  const pips = ([2, 3, 4, 5, 6, 7, 8, 9, 10] as FaceRank[]).every((k) => r.values[k] === k);
  if (!pips) return "custom";
  for (const [k, v] of Object.entries(FACES)) if (v.every((x, i) => x === w[i])) return k as FacesPreset;
  return "custom";
}

/** The rules with W, D, K worth `w`, `d`, `k` (pips stay as they are). */
export function withFaces(r: Rules, w: number, d: number, k: number): Rules {
  const values = { ...CLASSIC_VALUES };
  for (const f of [2, 3, 4, 5, 6, 7, 8, 9, 10] as FaceRank[]) values[f] = r.values[f];
  return { ...r, values: { ...values, 11: w, 12: d, 13: k } };
}

const modeName = (r: Rules) => (r.mode === "bank" ? "Z bankierem" : "Rodzinne");
const faces = (r: Rules) => `W ${r.values[11]}, D ${r.values[12]}, K ${r.values[13]}`;
const deck = (r: Rules) => (r.deck === 52 ? "52 karty" : r.deck === 32 ? "32 karty" : "24 karty");
const ace = (r: Rules) => (r.ace === "eleven" ? "As za 11" : "As za 1 lub 11");

/** Two short lines for the lobby. */
export function summaryLines(r: Rules): [string, string] {
  return [`${modeName(r)} · ${faces(r)} · ${deck(r)}`, `${r.persian ? "Perskie oczko" : "Bez perskiego oczka"} · ${ace(r)}`];
}

/** One line (new game, settings). */
export const summaryLine = (r: Rules) => summaryLines(r).join(" · ");

/** The rules in one or two sentences ("W skrócie"). */
export function preview(r: Rules): string {
  const start =
    r.mode === "bank"
      ? `Każdy gra z bankiem: dobiera karty i mówi „Starczy”, bank odpowiada na końcu${r.bankTie === "bankWins" ? " i wygrywa remisy" : ""}.`
      : "Każdy dobiera karty i mówi „Starczy”, gdy chce. Punkt dostaje wynik najbliżej 21 bez fury.";
  const persian = r.persian ? " Dwa asy to perskie oczko — wygrywa wszystko." : "";
  const aceTxt = r.ace === "oneOrEleven" ? " As liczy się za 1 albo 11." : "";
  return start + persian + aceTxt;
}
