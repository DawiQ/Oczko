// What the table screen needs from a game: a local controller, a Wi‑Fi host
// (the same controller) or a Wi‑Fi guest (a remote view). The table never
// sees more than this.
import type { PersonaId } from "../ai/personas";
import type { Card } from "../engine/cards";
import type { RoundEvent, RoundResult, SeatStatus } from "../engine/round";
import type { Rules } from "../engine/rules";
import type { HandValue } from "../engine/score";
import type { SeatView } from "../engine/view";
import type { GameMode } from "./setup";

export type Phase = "dealing" | "myTurn" | "othersTurn" | "bankTurn" | "showdown" | "roundEnd" | "matchEnd";

export interface SeatInfo {
  seat: number;
  name: string;
  kind: "human" | "bot" | "remote";
  persona: PersonaId | null;
  color: string;
  cards: number;
  /** As this player may see it (a hidden fura looks like "stood"). */
  status: SeatStatus;
  persian: boolean;
  isBank: boolean;
  isDealer: boolean;
  thinking: boolean;
  score: number;
  /** Face-up cards (mine always; others' once shown). */
  hand?: Card[];
  value?: HandValue;
}

export interface GameSnapshot {
  phase: Phase;
  mode: GameMode;
  rules: Rules;
  me: number;
  roundNo: number;
  view: SeatView;
  seats: SeatInfo[];
  /** The latest events as I may see them, with growing ids (animations). */
  lastEvents: { id: number; event: RoundEvent }[];
  result: RoundResult | null;
  scores: number[];
  target: number;
  winner: number | null;
  canSkip: boolean;
  canRematch: boolean;
  /** Training: play this round again on the same cards. */
  canReplay: boolean;
}

export type GameError =
  | "not-your-turn"
  | "illegal-action"
  | "round-over"
  | "round-not-over"
  | "match-over"
  | "not-training"
  | "nothing-to-skip"
  | "disposed";

export interface TableGame {
  getSnapshot(): GameSnapshot;
  subscribe(listener: () => void): () => void;
  hit(): GameError | null;
  stand(): GameError | null;
  nextRound(): GameError | null;
  /** Plays the rest of the round at once (once you are done). */
  skipToEnd(): GameError | null;
  /** The same opponents, new cards. */
  rematch(): GameError | null;
  replayRound(): GameError | null;
  abandon(): void;
}
