// The game in progress (resume after closing the app): oczko.save.v1.
import { isCard } from "../engine/cards";
import type { MatchState } from "../engine/match";
import { validateRules } from "../engine/rules";
import type { RoundState } from "../engine/round";
import type { SavedGame } from "../game/GameController";
import { looksLikeSetup } from "../game/setup";
import { readJSON, removeKey, writeJSON, type KV } from "./kv";

export const SAVE_KEY = "oczko.save.v1";

const STATUSES = ["waiting", "playing", "stood", "bust", "maxed"];
const isInt = (x: unknown, min: number, max: number) => Number.isInteger(x) && (x as number) >= min && (x as number) <= max;
const isCards = (x: unknown) => Array.isArray(x) && x.every(isCard);

function looksLikeRound(x: unknown, seats: number): x is RoundState {
  if (typeof x !== "object" || x === null) return false;
  const r = x as RoundState;
  if (r.v !== 1 || !validateRules(r.rules) || !isCards(r.stock)) return false;
  if (!Array.isArray(r.hands) || r.hands.length !== seats || !r.hands.every(isCards)) return false;
  const all = [...r.stock, ...r.hands.flat()];
  if (new Set(all).size !== all.length || all.length !== r.rules.deck) return false;
  if (!Array.isArray(r.status) || r.status.length !== seats || !r.status.every((s) => STATUSES.includes(s))) return false;
  if (!Array.isArray(r.order) || r.order.length !== seats || [...r.order].sort((a, b) => a - b).some((s, i) => s !== i)) return false;
  if (r.turn !== null && !isInt(r.turn, 0, seats - 1)) return false;
  if (!isInt(r.dealer, 0, seats - 1) || (r.bank !== null && !isInt(r.bank, 0, seats - 1))) return false;
  if (!Array.isArray(r.revealed) || r.revealed.length !== seats || !Array.isArray(r.log)) return false;
  if (r.result !== null && (typeof r.result !== "object" || !Array.isArray(r.result.points) || r.result.points.length !== seats)) return false;
  return isInt(r.seed, 0, 0xffffffff);
}

export function looksLikeMatch(x: unknown): x is MatchState {
  if (typeof x !== "object" || x === null) return false;
  const m = x as MatchState;
  if (m.v !== 1 || !validateRules(m.rules) || !isInt(m.seats, 2, 8)) return false;
  if (!Array.isArray(m.scores) || m.scores.length !== m.seats || !m.scores.every((s) => isInt(s, 0, 10000))) return false;
  if (!isInt(m.roundNo, 1, 100000) || !isInt(m.dealer, 0, m.seats - 1)) return false;
  if (m.bank !== null && !isInt(m.bank, 0, m.seats - 1)) return false;
  if (m.winner !== null && !isInt(m.winner, 0, m.seats - 1)) return false;
  return isInt(m.seedBase, 0, 0xffffffff) && looksLikeRound(m.round, m.seats);
}

export function looksLikeSavedGame(x: unknown): x is SavedGame {
  if (typeof x !== "object" || x === null) return false;
  const s = x as SavedGame;
  if (s.v !== 1 || !looksLikeSetup(s.setup) || !looksLikeMatch(s.match) || !looksLikeMatch(s.roundStart)) return false;
  if (s.match.seats !== s.setup.seats.length || s.roundStart.seats !== s.setup.seats.length) return false;
  if (!Array.isArray(s.decisions) || !s.decisions.every((d) => d && isInt(d.round, 1, 100000) && isInt(d.seat, 0, s.match.seats - 1) && (d.action === "hit" || d.action === "stand")))
    return false;
  return isInt(s.botRng, 0, 0xffffffff);
}

/** A saved game that can be continued (the match is not over). */
export const isResumable = (s: SavedGame | null): s is SavedGame => !!s && s.match.winner === null;

export const loadSavedGame = (kv: KV) => readJSON(kv, SAVE_KEY, looksLikeSavedGame);
export const saveGame = (kv: KV, s: SavedGame) => writeJSON(kv, SAVE_KEY, s);
export const clearSavedGame = (kv: KV) => removeKey(kv, SAVE_KEY);
