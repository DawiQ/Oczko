// The tutorial: a real round from a fixed seed (found by
// tools/find-tutorial-seed.ts, checked by a test) — you draw twice, stop on
// 18–20; Witek goes over 21, Kuba stops lower: the point is yours.
import type { PersonaId } from "../ai/personas";
import { DEFAULT_RULES } from "../engine/rules";
import type { Action } from "../engine/round";
import type { GameSnapshot } from "../game/TableGame";
import type { GameSetup } from "../game/setup";
import { pl, type Strings } from "../i18n/pl";

export const TUTORIAL_SEED = 13;
export const TUTORIAL_BOTS: PersonaId[] = ["kuba", "witek"];
/** Seat 2 deals: you (seat 0) move first. */
export const TUTORIAL_FIRST = 2;
export const TUTORIAL_MOVES: Action[] = ["hit", "hit", "stand"];

export function tutorialSetup(seed = TUTORIAL_SEED, s: Strings = pl): GameSetup {
  return {
    v: 1,
    rules: { ...DEFAULT_RULES, target: 1 },
    seats: [
      { kind: "human", name: s.common.you },
      { kind: "bot", persona: "kuba", name: s.personas.kuba.name },
      { kind: "bot", persona: "witek", name: s.personas.witek.name },
    ],
    seed,
    mode: "single",
    first: TUTORIAL_FIRST,
  };
}

/** The move the script expects now (by the cards in my hand). */
export function expectedMove(snap: GameSnapshot): Action | null {
  if (snap.phase !== "myTurn") return null;
  return TUTORIAL_MOVES[snap.view.myHand.length - 1] ?? "stand";
}

export function coachText(snap: GameSnapshot, s: Strings = pl): string | null {
  const total = snap.view.myValue.total;
  const t = s.onboarding.coach;
  switch (snap.phase) {
    case "dealing":
      return t.dealing;
    case "myTurn": {
      const n = snap.view.myHand.length;
      if (n === 1) return t.firstCard(total);
      if (n === 2) return t.secondCard(total);
      return t.stop(total);
    }
    case "othersTurn":
    case "bankTurn":
      return t.rivals;
    case "showdown":
      return t.showdown;
    case "roundEnd":
    case "matchEnd":
      return null;
  }
}
