// House rules in words: the lobby's two lines, one sentence, presets of the
// face values. Pure.
import { CLASSIC_VALUES, type FaceRank, type Rules } from "../engine/rules";
import { pl, type Strings } from "../i18n/pl";

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

/** Two short lines for the lobby. */
export function summaryLines(r: Rules, s: Strings = pl): [string, string] {
  const t = s.rules.summary;
  return [
    `${s.rules.modes[r.mode]} · ${t.faces(r.values[11], r.values[12], r.values[13])} · ${t.deck(r.deck)}`,
    `${r.persian ? t.persian : t.noPersian} · ${t.ace[r.ace]}`,
  ];
}

/** One line (new game, settings). */
export const summaryLine = (r: Rules, s: Strings = pl) => summaryLines(r, s).join(" · ");

/** The rules in one or two sentences ("W skrócie"). */
export function preview(r: Rules, s: Strings = pl): string {
  const t = s.rules.preview;
  const start = r.mode === "bank" ? t.bank(r.bankTie === "bankWins") : t.family;
  const persian = r.persian ? t.persian : "";
  const aceTxt = r.ace === "oneOrEleven" ? t.oneOrEleven : "";
  return start + persian + aceTxt;
}
