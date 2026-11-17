// The only glue between the game and React: creates the controller, saves
// after every move, records the statistics, stops the bots on unmount.
import { useEffect, useState, useSyncExternalStore } from "react";

import { clearSavedGame, saveGame } from "../storage/save";
import { recordMatch, recordRound, updateStats } from "../storage/stats";
import type { KV } from "../storage/kv";
import { GameController, type ControllerDeps, type SavedGame } from "./GameController";
import type { Pace } from "./pace";
import type { GameSetup } from "./setup";
import type { GameSnapshot } from "./TableGame";

export type GameSource = { setup: GameSetup } | { saved: SavedGame };

export interface UseGameOptions {
  kv: KV;
  pace?: Pace;
  sleep?: ControllerDeps["sleep"];
  decide?: ControllerDeps["decide"];
  /** Called with every finished round (e.g. the history). */
  onRoundEnd?: ControllerDeps["onRoundEnd"];
}

export function createGame(source: GameSource, opts: UseGameOptions): GameController {
  const { kv } = opts;
  const deps: ControllerDeps = {
    pace: opts.pace,
    sleep: opts.sleep,
    decide: opts.decide,
    onSave: (s) => void (s.match.winner === null ? saveGame(kv, s) : clearSavedGame(kv)),
    onRoundEnd: (info) => {
      void updateStats(kv, (st) => recordRound(st, info.match, info.me));
      opts.onRoundEnd?.(info);
    },
    onMatchEnd: (info) => {
      const personas = info.setup.seats.flatMap((s) => (s.kind === "bot" ? [s.persona] : []));
      void updateStats(kv, (st) => recordMatch(st, info.match, info.me, personas));
    },
    onEngineError: (e) => console.warn("oczko: engine error", e),
  };
  return "saved" in source ? new GameController(source.saved.setup, deps, source.saved) : new GameController(source.setup, deps);
}

export function useGame(source: GameSource, opts: UseGameOptions): { game: GameController; snapshot: GameSnapshot } {
  const [game] = useState(() => createGame(source, opts));
  useEffect(() => () => game.dispose(), [game]);
  const snapshot = useSyncExternalStore(game.subscribe, game.getSnapshot);
  return { game, snapshot };
}
