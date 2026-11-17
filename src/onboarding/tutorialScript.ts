// The tutorial: a real round from a fixed seed (found by
// tools/find-tutorial-seed.ts, checked by a test) — you draw twice, stop on
// 18–20; Witek goes over 21, Kuba stops lower: the point is yours.
import type { PersonaId } from "../ai/personas";
import { DEFAULT_RULES } from "../engine/rules";
import type { Action } from "../engine/round";
import type { GameSnapshot } from "../game/TableGame";
import type { GameSetup } from "../game/setup";

export const TUTORIAL_SEED = 13;
export const TUTORIAL_BOTS: PersonaId[] = ["kuba", "witek"];
/** Seat 2 deals: you (seat 0) move first. */
export const TUTORIAL_FIRST = 2;
export const TUTORIAL_MOVES: Action[] = ["hit", "hit", "stand"];

export function tutorialSetup(seed = TUTORIAL_SEED): GameSetup {
  return {
    v: 1,
    rules: { ...DEFAULT_RULES, target: 1 },
    seats: [
      { kind: "human", name: "Ty" },
      { kind: "bot", persona: "kuba", name: "Kuba" },
      { kind: "bot", persona: "witek", name: "Witek" },
    ],
    seed,
    mode: "single",
    first: TUTORIAL_FIRST,
  };
}

/** The move the script expects now (by the cards in my hand). */
export function expectedMove(s: GameSnapshot): Action | null {
  if (s.phase !== "myTurn") return null;
  return TUTORIAL_MOVES[s.view.myHand.length - 1] ?? "stand";
}

export function coachText(s: GameSnapshot): string | null {
  const total = s.view.myValue.total;
  switch (s.phase) {
    case "dealing":
      return "Każdy dostaje jedną kartę. Ty grasz pierwszy, potem Kuba i Witek.";
    case "myTurn": {
      const n = s.view.myHand.length;
      if (n === 1) return `Masz ${total}. Daleko do 21 — stuknij „Dobieram”, żeby wziąć kartę.`;
      if (n === 2) return `Masz ${total}. Wciąż bezpiecznie: dobierz jeszcze raz.`;
      return `Masz ${total} — blisko 21. Kolejna karta to spora szansa na furę (ponad 21). Powiedz „Starczy”.`;
    }
    case "othersTurn":
    case "bankTurn":
      return "Teraz rywale: Kuba staje już przy 14, Witek ryzykuje aż do 20.";
    case "showdown":
      return "Koniec ruchów — karty odkrywane są po kolei.";
    case "roundEnd":
    case "matchEnd":
      return null;
  }
}
