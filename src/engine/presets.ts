// Regional rule sets (PLAN.md §13): ready house rules of the home games of 21
// in other countries. A set only fills the rules — the game, its save and
// history keep the rules themselves. Names: the dictionaries
// (`rules.editor.presets`). Pure.
import { CLASSIC_VALUES, DEFAULT_RULES, type Rules } from "./rules";

export type PresetId = "oczko" | "siebzehnUndVier" | "okoBere" | "huszonegyes" | "ajnc" | "ochko" | "pontoon";

export const PRESET_IDS: PresetId[] = ["oczko", "siebzehnUndVier", "okoBere", "huszonegyes", "ajnc", "ochko", "pontoon"];

/** The card rules of a set (deck, values, ace, two aces) and its usual mode. */
type PresetRules = Pick<Rules, "deck" | "values" | "ace" | "persian" | "mode" | "bankTie" | "bankTo17" | "pontoon" | "fiveCardTrick" | "maxCards">;

export const PRESETS_BY_ID: Record<PresetId, PresetRules> = {
  // Poland: the app's default.
  oczko: { deck: 52, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "family", bankTie: "bankWins", bankTo17: false, pontoon: false, fiveCardTrick: false, maxCards: null },
  // Germany, Austria — Siebzehn und Vier on 32 cards: Unter 2, Ober 3,
  // König 4, Ass 11; two aces ("Feuer") win (de.wikipedia; sources differ).
  siebzehnUndVier: { deck: 32, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "bank", bankTie: "bankWins", bankTo17: false, pontoon: false, fiveCardTrick: false, maxCards: null },
  // Czechia, Slovakia — Oko bere on 32 cards: jack and queen 1, king 2, ace
  // 11; two aces are 21 ("fojer"); the bank wins ties (cs.wikipedia).
  okoBere: { deck: 32, values: { ...CLASSIC_VALUES, 11: 1, 12: 1, 13: 2 }, ace: "eleven", persian: "is21", mode: "bank", bankTie: "bankWins", bankTo17: false, pontoon: false, fiveCardTrick: false, maxCards: null },
  // Hungary — Huszonegyes on the 32-card Hungarian pack: alsó 2, felső 3,
  // király 4, ász 11; two aces ("két ász") win at once; the bank wins ties
  // and draws as it likes (hu.wikipedia "Huszonegyes", MEK Kisokos; docs/HUSZONEGYES.md).
  huszonegyes: { deck: 32, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "bank", bankTie: "bankWins", bankTo17: false, pontoon: false, fiveCardTrick: false, maxCards: null },
  // Bosnia, Croatia, Montenegro, Serbia — Ajnc: Oczko's values on 32 cards,
  // two aces ("suvi ajnc") win.
  ajnc: { deck: 32, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "bank", bankTie: "bankWins", bankTo17: false, pontoon: false, fiveCardTrick: false, maxCards: null },
  // Ukraine, Kazakhstan (Russian speakers) — Очко on the 36-card deck (6–A):
  // В 2, Д 3, К 4, Т 11; two aces ("золоте очко") win; the bank draws to 17
  // (ru/uk.wikipedia).
  ochko: { deck: 36, values: CLASSIC_VALUES, ace: "eleven", persian: "wins", mode: "bank", bankTie: "bankWins", bankTo17: true, pontoon: false, fiveCardTrick: false, maxCards: null },
  // Great Britain, Ireland, Australia, New Zealand — Pontoon: face cards 10,
  // the ace 1 or 11; an ace and a ten-card ("pontoon") beat any 21, five
  // cards without a fura ("five card trick") beat any total; the bank wins
  // ties; at most five cards (pagat.com). No "buying" cards — only draw/stay.
  pontoon: { deck: 52, values: { ...CLASSIC_VALUES, 11: 10, 12: 10, 13: 10 }, ace: "oneOrEleven", persian: "off", mode: "bank", bankTie: "bankWins", bankTo17: false, pontoon: true, fiveCardTrick: true, maxCards: 5 },
};

/** The rules with a set's cards and mode (the rest — target, ties of the
 *  family game, limits — stays as it was). */
export function withPreset(base: Rules, id: PresetId): Rules {
  const p = PRESETS_BY_ID[id];
  // The bank passing on two aces needs the rule where they win.
  const bankRotation = base.bankRotation === "onPersian" && p.persian !== "wins" ? "everyRound" : base.bankRotation;
  return { ...base, ...p, values: { ...p.values }, bankRotation };
}

/** The set whose cards the rules use (deck, values, ace, two aces), if any;
 *  `prefer` wins when several sets have the same cards (17 und 4, Huszonegyes, Ajnc). */
export function presetOf(r: Rules, prefer?: PresetId): PresetId | null {
  const same = (p: PresetRules) => p.deck === r.deck && p.ace === r.ace && p.persian === r.persian && p.bankTo17 === r.bankTo17 && p.pontoon === r.pontoon && p.fiveCardTrick === r.fiveCardTrick && (Object.keys(p.values) as unknown as (keyof Rules["values"])[]).every((k) => p.values[k] === r.values[k]);
  if (prefer && same(PRESETS_BY_ID[prefer])) return prefer;
  return PRESET_IDS.find((id) => same(PRESETS_BY_ID[id])) ?? null;
}

/** Countries (ISO 3166) and phone languages where a set is the home game. */
const BY_REGION: Record<string, PresetId> = {
  DE: "siebzehnUndVier", AT: "siebzehnUndVier", LI: "siebzehnUndVier",
  CZ: "okoBere", SK: "okoBere",
  HU: "huszonegyes",
  BA: "ajnc", HR: "ajnc", ME: "ajnc", RS: "ajnc",
  UA: "ochko", KZ: "ochko", MD: "ochko",
  GB: "pontoon", IE: "pontoon", AU: "pontoon", NZ: "pontoon",
};
const BY_LANG: Record<string, PresetId> = { de: "siebzehnUndVier", cs: "okoBere", sk: "okoBere", hu: "huszonegyes", bs: "ajnc", hr: "ajnc", sr: "ajnc", cnr: "ajnc", sh: "ajnc", uk: "ochko", ru: "ochko" };

/** The set to suggest at the first start: the phone's country, else its language; else Oczko. */
export function suggestPreset(region: string | null | undefined, lang: string | null | undefined): PresetId {
  if (region) return BY_REGION[region.toUpperCase()] ?? "oczko";
  return (lang && BY_LANG[lang.toLowerCase()]) || "oczko";
}

/** The set for the phone's preferred locale. */
export const presetForLocales = (locales: readonly { languageCode?: string | null; regionCode?: string | null }[]): PresetId =>
  suggestPreset(locales[0]?.regionCode, locales[0]?.languageCode);

/** The rules for a fresh install in a country (the app's defaults plus the set). */
export const suggestedRules = (region: string | null | undefined, lang: string | null | undefined): Rules => withPreset(DEFAULT_RULES, suggestPreset(region, lang));
