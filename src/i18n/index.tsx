// Languages of the app: the dictionaries, the language in use (the phone's or
// the one chosen in the settings) and the React glue. Texts reach components
// through `useStrings()`; modules without React take a `Strings` parameter
// (from "./pl" — no React there). Without a provider: Polish.
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getLocales } from "expo-localization";

import type { Lang, LocaleLike } from "./langs";
import { cs } from "./cs";
import { de } from "./de";
import { en } from "./en";
import { hu } from "./hu";
import { pl, type Strings } from "./pl";
import { ru } from "./ru";
import { sh } from "./sh";
import { sk } from "./sk";
import { uk } from "./uk";

export * from "./langs";
export type { Strings } from "./pl";
export { pl } from "./pl";

export const DICTIONARIES: Record<Lang, Strings> = { pl, en, de, cs, sk, hu, uk, ru, sh };

/** The phone's languages in order of preference (empty when unknown). */
export function deviceLocales(): LocaleLike[] {
  try {
    return getLocales();
  } catch {
    return [];
  }
}

interface I18n {
  lang: Lang;
  s: Strings;
}

const I18nContext = createContext<I18n>({ lang: "pl", s: pl });

export function I18nProvider({ lang, strings, children }: { lang: Lang; /** Tests: another dictionary. */ strings?: Strings; children: ReactNode }) {
  const value = useMemo(() => ({ lang, s: strings ?? DICTIONARIES[lang] }), [lang, strings]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** The texts in the language in use. */
export const useStrings = (): Strings => useContext(I18nContext).s;
export const useLang = (): Lang => useContext(I18nContext).lang;
