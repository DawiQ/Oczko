// The languages the app speaks and how one is chosen (no React, no texts).

/** Languages of the app (PLAN.md §12 adds more, stage by stage). */
export const LANGS = ["pl", "en", "de", "cs", "sk", "hu", "uk", "ru", "sh"] as const;
export type Lang = (typeof LANGS)[number];

/** Every language's name in that language (the settings' list). */
export const LANG_NAMES: Record<Lang, string> = { pl: "Polski", en: "English", de: "Deutsch", cs: "Čeština", sk: "Slovenčina", hu: "Magyar", uk: "Українська", ru: "Русский", sh: "Bosanski · Hrvatski · Srpski" };

/** Languages written in Cyrillic (their own display font). */
export const isCyrillic = (l: string): boolean => l === "uk" || l === "ru";

/** "auto": the phone's language when the app speaks it. */
export type LangSetting = "auto" | Lang;

export const isLang = (x: unknown): x is Lang => (LANGS as readonly string[]).includes(x as string);
export const isLangSetting = (x: unknown): x is LangSetting => x === "auto" || isLang(x);

/** Phone languages served by another one: Bosnian, Croatian, Serbian and
 *  Montenegrin share one Latin-script dictionary ("sh"). */
const ALIASES: Record<string, string> = { bs: "sh", hr: "sh", sr: "sh", cnr: "sh" };

export interface LocaleLike {
  languageCode?: string | null;
  /** The phone's country (ISO 3166), when known. */
  regionCode?: string | null;
}

/** The phone's preferred language the app speaks (locales in order of
 *  preference); otherwise English when the app has it, else Polish. */
export function deviceLang(locales: readonly LocaleLike[], available: readonly string[] = LANGS): Lang {
  for (const l of locales) {
    const raw = l.languageCode?.toLowerCase();
    const code = raw ? (ALIASES[raw] ?? raw) : raw;
    if (code && available.includes(code)) return code as Lang;
  }
  return (available.includes("en") ? "en" : available[0]) as Lang;
}

export const resolveLang = (setting: LangSetting, locales: readonly LocaleLike[]): Lang => (setting === "auto" ? deviceLang(locales) : setting);
