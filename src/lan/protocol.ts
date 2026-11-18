// Wi‑Fi table protocol: newline-delimited JSON over a TCP connection.
//
// The host's phone runs the table (GameController): it deals, runs the bots
// and checks every move. A guest sends only "Dobieram" / "Starczy" and gets
// back its own view of the table (GameController.snapshotFor) — never another
// player's face-down cards, the stock or the seed. Everything a peer sends is
// untrusted: every message is parsed and checked here before anyone acts on it.
import { personaById, type PersonaId } from "../ai/personas";
import { cleanChoice, type LookChoice } from "../premium/looks";
import { isCard } from "../engine/cards";
import { validateRules, type Rules } from "../engine/rules";
import type { GameSnapshot } from "../game/TableGame";
import type { GameMode } from "../game/setup";

/** Bumped on any incompatible change: older and newer apps refuse each other. */
export const PROTOCOL_VERSION = 1;
/** The port a table listens on (the next ones if taken). */
export const LAN_PORT = 47676;
/** A longer line is dropped (and the connection closed): no peer needs it. */
export const MAX_LINE = 128 * 1024;
export const MAX_NAME = 16;
/** Seats at a Wi‑Fi table (7–8 need the host's Oczko Pro). */
export const MAX_LAN_SEATS = 8;
export const FREE_LAN_SEATS = 4;
export const REACTION_TEXTS = ["Brawo", "Ups", "Szybciej", "Dobra gra"] as const;
export type ReactionText = (typeof REACTION_TEXTS)[number];

/** A seat in the lobby before the deal. */
export type LobbySlot =
  | { kind: "host"; name: string }
  | { kind: "guest"; name: string; online: boolean }
  | { kind: "bot"; name: string; persona: PersonaId }
  | { kind: "open" };

export interface TableInfo {
  /** "Stół Oli". */
  name: string;
  rules: Rules;
  mode: GameMode;
  /** An Oczko Pro host's deck, felt and back: the whole table sees them. */
  looks?: LookChoice;
}

export type RefuseReason = "full" | "version" | "started" | "closed";

/** Who is at the table right now (per seat, for the viewer). */
export type Presence = "here" | "online" | "away" | "bot";

export interface LanInfo {
  presence: Presence[];
  /** The latest quick reaction ("Brawo"…), with a growing number. */
  reaction: { seq: number; seat: number; text: ReactionText } | null;
  /** Seconds left for the seat on the move (a person at the table). */
  moveDeadline: number | null;
}

// ---- guest -> host ---------------------------------------------------------

export type GuestMsg =
  | { t: "hello"; v: number; name: string; token?: string }
  | { t: "move"; action: "hit" | "stand" }
  | { t: "react"; text: ReactionText }
  | { t: "leave" }
  | { t: "ping" };

// ---- host -> guest ---------------------------------------------------------

export type HostMsg =
  | { t: "welcome"; v: number; token: string; table: TableInfo }
  | { t: "refuse"; reason: RefuseReason }
  | { t: "lobby"; slots: LobbySlot[]; you: number; table: TableInfo }
  | { t: "state"; snap: GameSnapshot; lan: LanInfo }
  | { t: "reject"; code: string }
  | { t: "closed"; reason: "host-left" | "removed" }
  | { t: "pong" };

export function encode(msg: GuestMsg | HostMsg): string {
  return JSON.stringify(msg) + "\n";
}

/** Splits a byte stream into lines (a message may arrive in pieces, or
 *  several in one piece). Returns null once a line grows past MAX_LINE. */
export class LineReader {
  private buf = "";
  push(chunk: string): string[] | null {
    // Only the new chunk is searched (a line sent byte by byte stays linear).
    if (!chunk.includes("\n")) {
      this.buf += chunk;
      return this.buf.length > MAX_LINE ? null : [];
    }
    const lines = (this.buf + chunk).split("\n");
    this.buf = lines.pop() ?? "";
    if (this.buf.length > MAX_LINE || lines.some((l) => l.length > MAX_LINE)) return null;
    return lines.filter((l) => l.trim().length > 0);
  }
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const isInt = (x: unknown): x is number => typeof x === "number" && Number.isInteger(x);

function parseLine(line: string): Record<string, unknown> | null {
  try {
    const x: unknown = JSON.parse(line);
    return isObj(x) && typeof x.t === "string" ? x : null;
  } catch {
    return null;
  }
}

/** A name someone typed: printable, trimmed, at most MAX_NAME characters. */
export function cleanName(raw: unknown, fallback = "Gość"): string {
  if (typeof raw !== "string") return fallback;
  const s = Array.from(raw.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, "").trim())
    .slice(0, MAX_NAME)
    .join("")
    .trim();
  return s || fallback;
}

/** A guest's message, checked; null = malformed (ignored). */
export function parseGuestMsg(line: string): GuestMsg | null {
  const m = parseLine(line);
  if (!m) return null;
  switch (m.t) {
    case "hello":
      if (!isInt(m.v)) return null;
      return { t: "hello", v: m.v, name: cleanName(m.name), ...(typeof m.token === "string" && m.token.length <= 64 ? { token: m.token } : {}) };
    case "move":
      return m.action === "hit" || m.action === "stand" ? { t: "move", action: m.action } : null;
    case "react":
      return REACTION_TEXTS.includes(m.text as ReactionText) ? { t: "react", text: m.text as ReactionText } : null;
    case "leave":
      return { t: "leave" };
    case "ping":
      return { t: "ping" };
    default:
      return null;
  }
}

const PHASES = ["dealing", "myTurn", "othersTurn", "bankTurn", "showdown", "roundEnd", "matchEnd"];
const cards = (x: unknown) => Array.isArray(x) && x.every(isCard);

/** A snapshot from the host: the shape the table needs, cards valid. */
export function looksLikeSnapshot(x: unknown): x is GameSnapshot {
  if (!isObj(x) || !PHASES.includes(x.phase as string) || !isInt(x.me) || !isInt(x.roundNo) || !isInt(x.target)) return false;
  if (!validateRules(x.rules) || !Array.isArray(x.seats) || x.seats.length < 2 || x.seats.length > MAX_LAN_SEATS) return false;
  if (!Array.isArray(x.scores) || x.scores.length !== x.seats.length || !Array.isArray(x.lastEvents)) return false;
  const v = x.view;
  if (!isObj(v) || !cards(v.myHand) || !Array.isArray(v.legal) || !Array.isArray(v.others) || !isObj(v.myValue)) return false;
  return x.seats.every((s) => isObj(s) && typeof s.name === "string" && isInt(s.cards) && (s.hand === undefined || cards(s.hand)));
}

function looksLikeTable(x: unknown): x is TableInfo {
  return isObj(x) && typeof x.name === "string" && validateRules(x.rules) !== null && (x.mode === "match" || x.mode === "single");
}

function looksLikeSlot(x: unknown): x is LobbySlot {
  if (!isObj(x)) return false;
  switch (x.kind) {
    case "host":
      return typeof x.name === "string";
    case "guest":
      return typeof x.name === "string" && typeof x.online === "boolean";
    case "bot":
      return typeof x.name === "string" && !!personaById(x.persona as string);
    case "open":
      return true;
    default:
      return false;
  }
}

function looksLikeLan(x: unknown): x is LanInfo {
  if (!isObj(x) || !Array.isArray(x.presence)) return false;
  if (!x.presence.every((p) => p === "here" || p === "online" || p === "away" || p === "bot")) return false;
  if (x.moveDeadline !== null && !isInt(x.moveDeadline)) return false;
  const r = x.reaction;
  return r === null || (isObj(r) && isInt(r.seq) && isInt(r.seat) && REACTION_TEXTS.includes(r.text as ReactionText));
}

/** Only known look ids reach the table (anything else: the classic one). */
const withCleanLooks = (t: TableInfo): TableInfo => (t.looks === undefined ? t : { ...t, looks: cleanChoice(t.looks) });

/** The host's message, checked; null = malformed (ignored). */
export function parseHostMsg(line: string): HostMsg | null {
  const m = parseLine(line);
  if (!m) return null;
  switch (m.t) {
    case "welcome":
      return isInt(m.v) && typeof m.token === "string" && looksLikeTable(m.table) ? { t: "welcome", v: m.v, token: m.token, table: withCleanLooks(m.table) } : null;
    case "refuse":
      return m.reason === "full" || m.reason === "version" || m.reason === "started" || m.reason === "closed" ? { t: "refuse", reason: m.reason } : null;
    case "lobby":
      return Array.isArray(m.slots) && m.slots.length <= MAX_LAN_SEATS && m.slots.every(looksLikeSlot) && isInt(m.you) && looksLikeTable(m.table)
        ? { t: "lobby", slots: m.slots as LobbySlot[], you: m.you, table: withCleanLooks(m.table) }
        : null;
    case "state":
      return looksLikeSnapshot(m.snap) && looksLikeLan(m.lan) ? { t: "state", snap: m.snap, lan: m.lan } : null;
    case "reject":
      return typeof m.code === "string" ? { t: "reject", code: m.code } : null;
    case "closed":
      return m.reason === "host-left" || m.reason === "removed" ? { t: "closed", reason: m.reason } : null;
    case "pong":
      return { t: "pong" };
    default:
      return null;
  }
}
