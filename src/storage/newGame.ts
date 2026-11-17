// The last choices of "Nowa gra" (oczko.newgame.v1).
import { personaById, type PersonaId } from "../ai/personas";
import { readJSON, writeJSON, type KV } from "./kv";

export const NEW_GAME_KEY = "oczko.newgame.v1";

export type Length = 5 | 10 | 15 | "single";

export interface NewGameChoices {
  v: 1;
  /** The rivals in seating order (a character may sit more than once). */
  bots: PersonaId[];
  mode: "family" | "bank";
  length: Length;
}

export const DEFAULT_CHOICES: NewGameChoices = { v: 1, bots: ["ola", "hela", "marek"], mode: "family", length: 10 };

export function looksLikeChoices(x: unknown): x is NewGameChoices {
  if (typeof x !== "object" || x === null) return false;
  const c = x as NewGameChoices;
  return (
    c.v === 1 &&
    Array.isArray(c.bots) &&
    c.bots.length >= 1 &&
    c.bots.length <= 7 &&
    c.bots.every((b) => !!personaById(b)) &&
    (c.mode === "family" || c.mode === "bank") &&
    [5, 10, 15, "single"].includes(c.length)
  );
}

export const loadChoices = async (kv: KV): Promise<NewGameChoices> => (await readJSON(kv, NEW_GAME_KEY, looksLikeChoices)) ?? DEFAULT_CHOICES;
export const saveChoices = (kv: KV, c: NewGameChoices) => writeJSON(kv, NEW_GAME_KEY, c);
