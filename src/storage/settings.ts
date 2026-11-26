// App settings (oczko.settings.v2; v1 — without the language — is read and
// moved over).
import type { PaceName } from "../game/pace";
import { isLangSetting, type LangSetting } from "../i18n/langs";
import { readJSON, writeJSON, type KV } from "./kv";

export const SETTINGS_KEY = "oczko.settings.v2";
export const SETTINGS_KEY_V1 = "oczko.settings.v1";

export interface Settings {
  v: 2;
  sound: boolean;
  haptics: boolean;
  pace: PaceName;
  /** The trainer's panel at the table (outside Wi‑Fi games). */
  trainer: boolean;
  /** "auto": the phone's language. */
  lang: LangSetting;
}

type SettingsV1 = Omit<Settings, "v" | "lang"> & { v: 1 };

export const DEFAULT_SETTINGS: Settings = { v: 2, sound: true, haptics: true, pace: "normal", trainer: false, lang: "auto" };

function looksLikeBase(s: SettingsV1 | Settings): boolean {
  return typeof s.sound === "boolean" && typeof s.haptics === "boolean" && ["slow", "normal", "fast"].includes(s.pace) && typeof s.trainer === "boolean";
}

export function looksLikeSettings(x: unknown): x is Settings {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Settings;
  return s.v === 2 && looksLikeBase(s) && isLangSetting(s.lang);
}

export function looksLikeSettingsV1(x: unknown): x is SettingsV1 {
  if (typeof x !== "object" || x === null) return false;
  const s = x as SettingsV1;
  return s.v === 1 && looksLikeBase(s);
}

export async function loadSettings(kv: KV): Promise<Settings> {
  const now = await readJSON(kv, SETTINGS_KEY, looksLikeSettings);
  if (now) return now;
  const old = await readJSON(kv, SETTINGS_KEY_V1, looksLikeSettingsV1);
  return old ? { ...old, v: 2, lang: "auto" } : DEFAULT_SETTINGS;
}

export const saveSettings = (kv: KV, s: Settings) => writeJSON(kv, SETTINGS_KEY, s);
