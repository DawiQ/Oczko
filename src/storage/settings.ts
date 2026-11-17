// App settings (oczko.settings.v1).
import type { PaceName } from "../game/pace";
import { readJSON, writeJSON, type KV } from "./kv";

export const SETTINGS_KEY = "oczko.settings.v1";

export interface Settings {
  v: 1;
  sound: boolean;
  haptics: boolean;
  pace: PaceName;
  /** The trainer's panel at the table (outside Wi‑Fi games). */
  trainer: boolean;
}

export const DEFAULT_SETTINGS: Settings = { v: 1, sound: true, haptics: true, pace: "normal", trainer: false };

export function looksLikeSettings(x: unknown): x is Settings {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Settings;
  return (
    s.v === 1 &&
    typeof s.sound === "boolean" &&
    typeof s.haptics === "boolean" &&
    ["slow", "normal", "fast"].includes(s.pace) &&
    typeof s.trainer === "boolean"
  );
}

export const loadSettings = async (kv: KV): Promise<Settings> => (await readJSON(kv, SETTINGS_KEY, looksLikeSettings)) ?? DEFAULT_SETTINGS;
export const saveSettings = (kv: KV, s: Settings) => writeJSON(kv, SETTINGS_KEY, s);
