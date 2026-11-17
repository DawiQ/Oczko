import { Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";

import { matchApply, newMatch, type MatchState } from "../../engine/match";
import { dealRound } from "../../engine/round";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { stockFor } from "../../engine/testUtils";
import { emptyStats, recordRound, type Stats } from "../../storage/stats";
import { DialogProvider } from "../../ui/Dialog";
import { BADGES, badgesShownBy, earnedBadges, RANKS, rankOf, ratios, roundBadges, STREAK_BADGE, VETERAN_BADGE, XP, xpOf } from "../progress";
import { ProfileScreen } from "../ProfileScreen";
import { suggestNext } from "../suggest";

/** A finished round: hands dealt from a crafted stock, then the moves. */
function round(rules: Rules, hands: string[], draws: string, moves: ("hit" | "stand")[], dealer = 0, bank: number | null = null): MatchState {
  const start = newMatch(rules, hands.length, 1, dealer);
  let m: MatchState = { ...start, round: dealRound(rules, hands.length, stockFor(rules, hands, draws, dealer, bank), dealer, bank) };
  for (const a of moves) {
    const r = matchApply(m, m.round.turn!, a);
    if ("error" in r) throw new Error(r.error);
    m = r.state;
  }
  if (!m.round.result) throw new Error("round not over");
  return m;
}

const fam: Rules = { ...DEFAULT_RULES, target: 50 };

describe("badges from a round (seat 0 is me; dealer 1 → I move first)", () => {
  it("Oczko z pięciu kart: 21 with five cards", () => {
    // 2 + 3 + 4 + 2(W) + 10 = 21; the rival stands on 9
    const m = round(fam, ["2♥", "9♣"], "3♥ 4♥ W♥ 10♥", ["hit", "hit", "hit", "hit", "stand", "stand"], 1);
    expect(roundBadges(m, 0)).toContain("fiveCard");
  });

  it("Na krawędzi: a won 21 after drawing on 17+", () => {
    // 10 + 7 = 17, then 4 → 21 (and no five cards)
    const m = round(fam, ["10♥", "9♣"], "7♥ 4♥", ["hit", "hit", "stand", "stand"], 1);
    expect(m.round.result!.points[0]).toBe(1);
    expect(roundBadges(m, 0)).toEqual(["edge"]);
  });

  it("no 'Na krawędzi' when 21 came from below 17, or the round was lost", () => {
    const low = round(fam, ["10♥", "9♣"], "A♥", ["hit", "stand", "stand"], 1); // 10 + 11
    expect(roundBadges(low, 0)).toEqual([]);
  });

  it("Żelazny bank: the bank wins every duel (2+ players)", () => {
    const rules: Rules = { ...PRESETS.bank, target: 50 };
    // bank 0 holds 10 + 9 = 19; players stand on 15 and 16
    const m = round(rules, ["10♥", "10♣", "10♦"], "5♣ 6♦ 9♥", ["hit", "stand", "hit", "stand", "hit", "stand"], 0, 0);
    expect(m.round.result!.duels!.every((d) => d.winner === "bank")).toBe(true);
    expect(roundBadges(m, 0)).toContain("ironBank");
    expect(roundBadges(m, 1)).not.toContain("ironBank");
  });

  it("shown at the table include the counters' badges", () => {
    const m = round(fam, ["10♥", "9♣"], "7♥ 4♥", ["hit", "hit", "stand", "stand"], 1);
    expect(badgesShownBy(m, 0).sort()).toEqual(["edge", "exact21"]);
  });

  it("are stored once in the statistics", () => {
    const m = round(fam, ["10♥", "9♣"], "7♥ 4♥", ["hit", "hit", "stand", "stand"], 1);
    let s = recordRound(emptyStats(), m, 0);
    s = recordRound(s, m, 0);
    expect(s.badges).toEqual(["edge"]);
  });
});

describe("badges from the counters", () => {
  const with_ = (patch: Partial<Stats>) => ({ ...emptyStats(), ...patch });
  it.each([
    ["persian", { persians: 1 }],
    ["exact21", { twentyOnes: 1 }],
    ["streak", { bestStreak: STREAK_BADGE }],
    ["veteran", { matches: VETERAN_BADGE }],
  ] as const)("%s", (id, patch) => {
    expect(earnedBadges(with_(patch))).toEqual([id]);
  });

  it("not one short of the threshold", () => {
    expect(earnedBadges(with_({ bestStreak: STREAK_BADGE - 1, matches: VETERAN_BADGE - 1 }))).toEqual([]);
  });

  it("every badge has a unique id and a name", () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});

describe("ranks", () => {
  it("count experience", () => {
    const s = { ...emptyStats(), rounds: 10, roundsWon: 4, matchesWon: 1, persians: 1 };
    expect(xpOf(s)).toBe(10 * XP.round + 4 * XP.roundWon + XP.matchWon + XP.badge);
  });

  it.each(RANKS.map((r, i) => [r.name, r.at, i] as const))("%s from %i points", (name, at, i) => {
    const at_ = { ...emptyStats(), rounds: at };
    expect(rankOf(at_)).toMatchObject({ name, index: i });
    if (at > 0) expect(rankOf({ ...emptyStats(), rounds: at - 1 }).index).toBe(i - 1);
  });

  it("progress and the top", () => {
    const half = rankOf({ ...emptyStats(), rounds: 25 });
    expect(half.progress).toBeCloseTo(0.5);
    expect(half.next?.name).toBe("Dziesiątka");
    const top = rankOf({ ...emptyStats(), rounds: 5000 });
    expect(top).toMatchObject({ name: "Perskie oczko", next: null, progress: 1 });
  });

  it("ratios never divide by zero", () => {
    expect(ratios(emptyStats())).toEqual({ winRounds: 0, winMatches: 0, bust: 0, standAvg: 0 });
    expect(ratios({ ...emptyStats(), stands: 2, standTotal: 37 }).standAvg).toBe(18.5);
  });
});

describe("next rival", () => {
  it("one level up from the strongest beaten character", () => {
    const s = { ...emptyStats(), byPersona: { ola: { matches: 3, won: 2 }, kuba: { matches: 4, won: 4 } } };
    expect(suggestNext(s)?.persona.id).toBe("marek");
    expect(suggestNext(s)?.reason).toBe("Wygrane z Olą: 2 z 3");
  });

  it("nothing yet, or already playing the next one", () => {
    expect(suggestNext(emptyStats())).toBeNull();
    expect(suggestNext({ ...emptyStats(), byPersona: { ola: { matches: 1, won: 1 } } })).toBeNull();
    expect(suggestNext({ ...emptyStats(), byPersona: { ola: { matches: 2, won: 1 }, marek: { matches: 3, won: 0 } } })).toBeNull();
    expect(suggestNext({ ...emptyStats(), byPersona: { hrabia: { matches: 5, won: 5 } } })).toBeNull(); // no one above
  });
});

const textOf = (r: ReactTestRenderer) =>
  r.root
    .findAllByType(Text)
    .map((n) => n.props.children as unknown)
    .flat(3)
    .filter((c) => typeof c === "string")
    .join(" | ");

describe("ProfileScreen", () => {
  it("shows the rank, badges, the next rival; resets after confirming", async () => {
    const stats: Stats = { ...emptyStats(), rounds: 60, roundsWon: 20, matches: 5, matchesWon: 3, persians: 1, byPersona: { ola: { matches: 3, won: 2 } } };
    const onPlay = jest.fn();
    const onReset = jest.fn();
    let r!: ReactTestRenderer;
    await act(async () => {
      r = create(
        <DialogProvider>
          <ProfileScreen stats={stats} onPlay={onPlay} onHistory={jest.fn()} onReset={onReset} />
        </DialogProvider>
      );
    });
    const t = textOf(r);
    expect(t).toContain(rankOf(stats).name);
    expect(t).toContain(`Odznaki · 1 z ${BADGES.length}`);
    expect(t).toContain("Marek");
    const play = r.root.findAll((n) => n.props.accessibilityLabel === "Zagraj" && typeof n.props.onPress === "function")[0];
    await act(async () => play.props.onPress());
    expect(onPlay).toHaveBeenCalledWith("marek");
    const reset = r.root.findAll((n) => n.props.accessibilityLabel === "Wyzeruj statystyki" && typeof n.props.onPress === "function")[0];
    await act(async () => {
      void reset.props.onPress(); // waits for the dialog's answer
    });
    const yes = r.root.findAll((n) => typeof n.type !== "string" && typeof n.props.onPress === "function" && textOf({ root: n } as ReactTestRenderer) === "Wyzeruj")[0];
    await act(async () => yes.props.onPress());
    expect(onReset).toHaveBeenCalled();
  });
});
