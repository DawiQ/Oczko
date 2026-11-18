// Looks: card decks, table felts and card backs. The classic set is free; the
// rest is Oczko Pro (or a 24 h trial for a rewarded ad). Home tables only:
// cloth and wood, no lettering. Names and notes: the dictionary, by id.
import { pl, type Strings } from "../i18n/pl";

export type LookKind = "deck" | "felt" | "back";

export interface DeckLook {
  id: string;
  kind: "deck";
  face: string;
  line: string;
  /** Ink per suit: hearts, diamonds, clubs, spades. */
  ink: [string, string, string, string];
  /** Sans-serif indices (easier to read) instead of the display font. */
  sans?: boolean;
  /** Index size factor. */
  scale?: number;
}

export interface FeltLook {
  id: string;
  kind: "felt";
  /** Base colour; the felt texture lies over it (null: the texture alone). */
  color: string | null;
}

export interface BackLook {
  id: string;
  kind: "back";
  /** null: the classic printed back. */
  color: string | null;
  frame: string;
}

export type Look = DeckLook | FeltLook | BackLook;

const RED = "#C8352C";
const BLACK = "#1B232C";

export const DECKS: DeckLook[] = [
  { id: "deck.classic", kind: "deck", face: "#FBF7EE", line: "#E4DCCB", ink: [RED, RED, BLACK, BLACK] },
  { id: "deck.four", kind: "deck", face: "#FBF7EE", line: "#E4DCCB", ink: [RED, "#2D6FD2", "#1E7A45", BLACK] },
  { id: "deck.large", kind: "deck", face: "#FFFFFF", line: "#D9DDE2", ink: [RED, RED, BLACK, BLACK], sans: true, scale: 1.18 },
  { id: "deck.gold", kind: "deck", face: "#F7EFD9", line: "#C9A24A", ink: ["#A3312A", "#A3312A", "#3A2A14", "#3A2A14"] },
  { id: "deck.night", kind: "deck", face: "#1F2933", line: "#3A4A5C", ink: ["#FF8A80", "#FF8A80", "#E6EDF3", "#E6EDF3"] },
];

export const FELTS: FeltLook[] = [
  { id: "felt.green", kind: "felt", color: null },
  { id: "felt.burgundy", kind: "felt", color: "#4A1626" },
  { id: "felt.navy", kind: "felt", color: "#13304D" },
  { id: "felt.walnut", kind: "felt", color: "#4A2E18" },
  { id: "felt.graphite", kind: "felt", color: "#262C33" },
];

export const BACKS: BackLook[] = [
  { id: "back.classic", kind: "back", color: null, frame: "#F3EEE2" },
  { id: "back.copper", kind: "back", color: "#A85E2E", frame: "#FBF7EE" },
  { id: "back.green", kind: "back", color: "#1E5C45", frame: "#FBF7EE" },
  { id: "back.black", kind: "back", color: "#1B232C", frame: "#C9A24A" },
  { id: "back.gold", kind: "back", color: "#8A6A1F", frame: "#FBF7EE" },
];

export const FREE_LOOKS: ReadonlySet<string> = new Set(["deck.classic", "felt.green", "back.classic"]);
export const isFreeLook = (id: string) => FREE_LOOKS.has(id);

const ALL: Look[] = [...DECKS, ...FELTS, ...BACKS];
export const lookById = (id: string): Look | undefined => ALL.find((l) => l.id === id);

/** A look's name and note ("dwa kolory"; may be empty). */
export const lookText = (id: string, s: Strings = pl): { name: string; note: string } => s.premium.looks.items[id] ?? { name: id, note: "" };

/** The looks in use (one per kind). */
export interface LookChoice {
  deck: string;
  felt: string;
  back: string;
}

export const CLASSIC: LookChoice = { deck: "deck.classic", felt: "felt.green", back: "back.classic" };

/** Only known ids of the right kind (anything else: the classic one). */
export function cleanChoice(x: unknown): LookChoice {
  const o = (typeof x === "object" && x !== null ? x : {}) as Partial<Record<keyof LookChoice, unknown>>;
  const pick = (kind: LookKind, v: unknown, fallback: string) =>
    typeof v === "string" && lookById(v)?.kind === kind ? v : fallback;
  return {
    deck: pick("deck", o.deck, CLASSIC.deck),
    felt: pick("felt", o.felt, CLASSIC.felt),
    back: pick("back", o.back, CLASSIC.back),
  };
}

/** What may actually be shown: a locked look (trial over, Pro ended) falls back
 *  to the classic one. */
export function effectiveChoice(c: LookChoice, unlocked: (id: string) => boolean): LookChoice {
  return {
    deck: unlocked(c.deck) ? c.deck : CLASSIC.deck,
    felt: unlocked(c.felt) ? c.felt : CLASSIC.felt,
    back: unlocked(c.back) ? c.back : CLASSIC.back,
  };
}
