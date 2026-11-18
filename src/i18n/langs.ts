// The languages the app speaks and how one is chosen (no React, no texts).

/** Languages of the app (PLAN.md §12 adds more, stage by stage). */
export const LANGS = ["pl", "en", "de", "cs", "sk", "hu"] as const;
export type Lang = (typeof LANGS)[number];

/** Every language's name in that language (the settings' list). */
export const LANG_NAMES: Record<Lang, string> = { pl: "Polski", en: "English", de: "Deutsch", cs: "Čeština", sk: "Slovenčina", hu: "Magyar" };

/** "auto": the phone's language when the app speaks it. */
export type LangSetting = "auto" | Lang;

export const isLang = (x: unknown): x is Lang => (LANGS as readonly string[]).includes(x as string);
export const isLangSetting = (x: unknown): x is LangSetting => x === "auto" || isLang(x);

export interface LocaleLike {
  languageCode?: string | null;
}

/** The phone's preferred language the app speaks (locales in order of
 *  preference); otherwise English when the app has it, else Polish. */
export function deviceLang(locales: readonly LocaleLike[], available: readonly string[] = LANGS): Lang {
  for (const l of locales) {
    const code = l.languageCode?.toLowerCase();
    if (code && available.includes(code)) return code as Lang;
  }
  return (available.includes("en") ? "en" : available[0]) as Lang;
}

export const resolveLang = (setting: LangSetting, locales: readonly LocaleLike[]): Lang => (setting === "auto" ? deviceLang(locales) : setting);
