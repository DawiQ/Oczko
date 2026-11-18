// Regional rule sets (PLAN.md §13): ready house rules of the home games of 21
// in other countries. A set only fills the rules — the game, its save and
// history keep the rules themselves. Names: the dictionaries
// (`rules.editor.presets`). Pure.
import { CLASSIC_VALUES, DEFAULT_RULES, type Rules } from "./rules";

export type PresetId = "oczko" | "siebzehnUndVier" | "okoBere" | "ajnc";

export const PRESET_IDS: PresetId[] = ["oczko", "siebzehnUndVier", "okoBere", "ajnc"];

/** The card rules of a set (deck, values, ace, two aces) and its usual mode. */
type PresetRules = Pick<Rules, "deck" | "values" | "ace" | "persian" | "mode" | "bankTie">;

export const PRESETS_BY_ID: Record<PresetId, PresetRules> = {
  // Poland: the app's default.
  oczko: { deck: 52, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "family", bankTie: "bankWins" },
  // Germany, Austria — Siebzehn und Vier on 32 cards: Unter 2, Ober 3,
  // König 4, Ass 11; two aces ("Feuer") win (de.wikipedia; sources differ).
  siebzehnUndVier: { deck: 32, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "bank", bankTie: "bankWins" },
  // Czechia, Slovakia — Oko bere on 32 cards: jack and queen 1, king 2, ace
  // 11; two aces are 21 ("fojer"); the bank wins ties (cs.wikipedia).
  okoBere: { deck: 32, values: { ...CLASSIC_VALUES, 11: 1, 12: 1, 13: 2 }, ace: "eleven", persian: "is21", mode: "bank", bankTie: "bankWins" },
  // Bosnia, Croatia, Montenegro, Serbia — Ajnc: Oczko's values on 32 cards,
  // two aces ("suvi ajnc") win.
  ajnc: { deck: 32, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "bank", bankTie: "bankWins" },
};

/** The rules with a set's cards and mode (the rest — target, ties of the
 *  family game, limits — stays as it was). */
export function withPreset(base: Rules, id: PresetId): Rules {
  const p = PRESETS_BY_ID[id];
  return { ...base, ...p, values: { ...p.values } };
}

/** The set whose cards the rules use (deck, values, ace, two aces), if any;
 *  `prefer` wins when several sets have the same cards (17 und 4 and Ajnc). */
export function presetOf(r: Rules, prefer?: PresetId): PresetId | null {
  const same = (p: PresetRules) => p.deck === r.deck && p.ace === r.ace && p.persian === r.persian && (Object.keys(p.values) as unknown as (keyof Rules["values"])[]).every((k) => p.values[k] === r.values[k]);
  if (prefer && same(PRESETS_BY_ID[prefer])) return prefer;
  return PRESET_IDS.find((id) => same(PRESETS_BY_ID[id])) ?? null;
}

/** Countries (ISO 3166) and phone languages where a set is the home game. */
const BY_REGION: Record<string, PresetId> = { DE: "siebzehnUndVier", AT: "siebzehnUndVier", LI: "siebzehnUndVier", CZ: "okoBere", SK: "okoBere", BA: "ajnc", HR: "ajnc", ME: "ajnc", RS: "ajnc" };
const BY_LANG: Record<string, PresetId> = { de: "siebzehnUndVier", cs: "okoBere", sk: "okoBere", bs: "ajnc", hr: "ajnc", sr: "ajnc", cnr: "ajnc", sh: "ajnc" };

/** The set to suggest at the first start: the phone's country, else its language; else Oczko. */
export function suggestPreset(region: string | null | undefined, lang: string | null | undefined): PresetId {
  return (region && BY_REGION[region.toUpperCase()]) || (lang && BY_LANG[lang.toLowerCase()]) || "oczko";
}

/** The rules for a fresh install in a country (the app's defaults plus the set). */
export const suggestedRules = (region: string | null | undefined, lang: string | null | undefined): Rules => withPreset(DEFAULT_RULES, suggestPreset(region, lang));
