// Who sits at the table and under which rules (serialisable: saved games,
// history, Wi‑Fi).
import { personaById, PERSONAS, seatNames, type PersonaId } from "../ai/personas";
import { splitmix32 } from "../engine/rng";
import { MAX_SEATS, MIN_SEATS, validateRules, type Rules } from "../engine/rules";

export type SeatSetup =
  | { kind: "human"; name: string }
  | { kind: "bot"; persona: PersonaId; name: string }
  /** A person on another phone (Wi‑Fi host): moves come from outside. */
  | { kind: "remote"; name: string };

/** match: to the target; single: one round (plus extra rounds on a tie);
 *  training: a match with the trainer, "this round again", no statistics. */
export type GameMode = "match" | "single" | "training";

export interface GameSetup {
  v: 1;
  rules: Rules;
  seats: SeatSetup[];
  seed: number;
  mode: GameMode;
  /** The first dealer (and first bank). */
  first: number;
}

export const HUMAN_NAME = "Ty";

/** A local table: you at seat 0, then the bots. */
export function makeSetup(rules: Rules, bots: readonly PersonaId[], mode: GameMode, seed: number): GameSetup {
  const names = seatNames(bots);
  const seats: SeatSetup[] = [{ kind: "human", name: HUMAN_NAME }, ...bots.map((persona, i) => ({ kind: "bot" as const, persona, name: names[i] }))];
  const r = mode === "single" ? { ...rules, target: 1 } : rules;
  return { v: 1, rules: r, seats, seed: seed >>> 0, mode, first: splitmix32(seed) % seats.length };
}

/** A fresh seed for a new game (not from the engine: outside its determinism). */
export const freshSeed = (): number => (Math.floor(Math.random() * 0x100000000) ^ Date.now()) >>> 0;

const isName = (x: unknown): x is string => typeof x === "string" && x.length > 0 && x.length <= 24;

export function looksLikeSetup(x: unknown): x is GameSetup {
  if (typeof x !== "object" || x === null) return false;
  const s = x as GameSetup;
  if (s.v !== 1 || !validateRules(s.rules) || !Array.isArray(s.seats)) return false;
  if (s.seats.length < MIN_SEATS || s.seats.length > MAX_SEATS[s.rules.deck]) return false;
  if (!s.seats.every((seat) => seat && isName(seat.name) && (seat.kind === "human" || seat.kind === "remote" || (seat.kind === "bot" && !!personaById(seat.persona)))))
    return false;
  if (!["match", "single", "training"].includes(s.mode)) return false;
  if (!Number.isInteger(s.seed) || s.seed < 0 || s.seed > 0xffffffff) return false;
  return Number.isInteger(s.first) && s.first >= 0 && s.first < s.seats.length;
}

/** The persona of a bot seat (null for people). */
export const personaOf = (seat: SeatSetup) => (seat.kind === "bot" ? personaById(seat.persona) ?? null : null);

export const ALL_PERSONAS = PERSONAS.map((p) => p.id);
