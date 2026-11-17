// The game's logic without React: runs the turns, paces the bots, shows the
// hands one by one at the end of a round, saves after every move. The UI gets
// only an immutable `GameSnapshot` built from the human seat's view — never
// the stock, the seed or a hidden hand.
import { chunkedEvaluator, type ChunkedEvaluator } from "../ai/evaluate";
import { personaById } from "../ai/personas";
import { decideAsync, type PolicySpec } from "../ai/policies";
import { matchApply, newMatch, nextRound as engineNextRound, type MatchState } from "../engine/match";
import { makeRng, splitmix32, type Rng } from "../engine/rng";
import type { Action, RoundEvent } from "../engine/round";
import { handValue } from "../engine/score";
import { eventsFor, viewFor, type OtherSeat, type SeatView } from "../engine/view";
import { PACES, type Pace } from "./pace";
import type { GameError, GameSnapshot, Phase, SeatInfo, TableGame } from "./TableGame";
import type { GameSetup } from "./setup";

export interface Decision {
  round: number;
  seat: number;
  action: Action;
}

export interface SavedGame {
  v: 1;
  setup: GameSetup;
  match: MatchState;
  /** The match as the current round began (training: "this round again"). */
  roundStart: MatchState;
  decisions: Decision[];
  /** The bots' generator state. */
  botRng: number;
}

export interface RoundEndInfo {
  setup: GameSetup;
  me: number;
  /** The match right after the round (points included). */
  match: MatchState;
  decisions: Decision[];
}

export type Decide = (spec: PolicySpec, view: SeatView, rng: Rng) => Promise<{ action: Action; rng: Rng } | null>;

export interface ControllerDeps {
  sleep?: (ms: number) => Promise<void>;
  pace?: Pace;
  /** A bot's decision (default: its persona's policy, the evaluator in chunks). */
  decide?: Decide;
  onSave?: (saved: SavedGame) => void;
  /** Not called in training. */
  onRoundEnd?: (info: RoundEndInfo) => void;
  onMatchEnd?: (info: RoundEndInfo) => void;
  onEngineError?: (e: unknown) => void;
}

const HUMAN_COLOR = "#E8925A";
const REMOTE_COLOR = "#8FD3FF";

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class GameController implements TableGame {
  private setup: GameSetup;
  private readonly deps: ControllerDeps;
  private readonly pace: Pace;
  private readonly sleepFn: (ms: number) => Promise<void>;
  private readonly decide: Decide;
  private readonly evaluator: ChunkedEvaluator;
  readonly me: number;

  private match!: MatchState;
  private roundStart!: MatchState;
  private decisions: Decision[] = [];
  private botRng!: Rng;
  /** Others' hands I may see now (shown furas, then the showdown one by one). */
  private visible: boolean[] = [];
  private showdownDone = false;
  private dealing = false;
  private thinking: number | null = null;
  private fast = false;

  private gen = 0;
  private running = false;
  private disposed = false;
  private idleWaiters: (() => void)[] = [];
  private listeners = new Set<() => void>();
  private events: { id: number; event: RoundEvent }[] = [];
  private eventId = 0;
  private snapshot!: GameSnapshot;

  constructor(setup: GameSetup, deps: ControllerDeps = {}, saved?: SavedGame) {
    this.setup = setup;
    this.deps = deps;
    this.pace = deps.pace ?? PACES.normal;
    this.sleepFn = deps.sleep ?? defaultSleep;
    this.evaluator = chunkedEvaluator();
    this.decide = deps.decide ?? ((spec, view, rng) => decideAsync(spec, view, rng, this.evaluator));
    const human = setup.seats.findIndex((s) => s.kind === "human");
    this.me = human >= 0 ? human : 0;
    if (saved) {
      this.match = saved.match;
      this.roundStart = saved.roundStart;
      this.decisions = saved.decisions.slice();
      this.botRng = makeRng(saved.botRng);
      this.visible = saved.match.round.revealed.slice();
      this.showdownDone = saved.match.round.result !== null;
    } else this.begin();
    this.snapshot = this.build();
    void this.loop();
  }

  // --- TableGame ---------------------------------------------------------------

  getSnapshot = (): GameSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  hit = (): GameError | null => this.act(this.me, "hit");
  stand = (): GameError | null => this.act(this.me, "stand");

  /** A move of a person's seat (local or remote). */
  act(seat: number, action: Action): GameError | null {
    if (this.disposed) return "disposed";
    if (this.match.winner !== null) return "match-over";
    if (this.match.round.result) return "round-over";
    if (this.match.round.turn !== seat || this.setup.seats[seat]?.kind === "bot") return "not-your-turn";
    const err = this.applyMove(seat, action);
    if (err) return err;
    void this.loop();
    return null;
  }

  nextRound = (): GameError | null => {
    if (this.disposed) return "disposed";
    if (this.match.winner !== null) return "match-over";
    if (!this.match.round.result || !this.showdownDone) return "round-not-over";
    const n = engineNextRound(this.match);
    if ("error" in n) return n.error === "match-over" ? "match-over" : "round-not-over";
    this.match = n;
    this.roundStart = n;
    this.newRound();
    this.save();
    this.restart();
    return null;
  };

  skipToEnd = (): GameError | null => {
    if (this.disposed) return "disposed";
    if (this.showdownDone || this.fast || !this.myDone()) return "nothing-to-skip";
    this.fast = true;
    this.dealing = false;
    this.restart();
    return null;
  };

  rematch = (): GameError | null => {
    if (this.disposed) return "disposed";
    if (!(this.match.winner !== null && this.showdownDone)) return "round-not-over";
    const n = this.setup.seats.length;
    this.setup = { ...this.setup, seed: splitmix32(this.setup.seed + 0x9e3779b9), first: (this.setup.first + 1) % n };
    this.begin();
    this.save();
    this.restart();
    return null;
  };

  replayRound = (): GameError | null => {
    if (this.disposed) return "disposed";
    if (this.setup.mode !== "training") return "not-training";
    if (!this.match.round.result || !this.showdownDone) return "round-not-over";
    const roundNo = this.roundStart.roundNo;
    this.match = this.roundStart;
    this.decisions = this.decisions.filter((d) => d.round !== roundNo);
    this.newRound();
    this.save();
    this.restart();
    return null;
  };

  abandon = (): void => this.dispose();

  /** Stops the bots (the screen is gone); the game stays saved. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.gen++;
    this.running = false;
    this.evaluator.cancel();
    this.flushIdle();
  }

  /** The state to save (also what `deps.onSave` receives). */
  saved(): SavedGame {
    return { v: 1, setup: this.setup, match: this.match, roundStart: this.roundStart, decisions: this.decisions.slice(), botRng: this.botRng.state };
  }

  /** Resolves once the bots have nothing more to do (tests, "Pokaż wynik"). */
  idle(): Promise<void> {
    return this.running ? new Promise((r) => this.idleWaiters.push(r)) : Promise.resolve();
  }

  getSetup(): GameSetup {
    return this.setup;
  }

  // --- The flow -------------------------------------------------------------------

  private begin(): void {
    this.match = newMatch(this.setup.rules, this.setup.seats.length, this.setup.seed, this.setup.first);
    this.roundStart = this.match;
    this.decisions = [];
    this.botRng = makeRng(splitmix32(this.setup.seed ^ 0xb075eed));
    this.newRound();
  }

  /** The round in `this.match` has just been dealt. */
  private newRound(): void {
    this.visible = this.match.round.hands.map(() => false);
    this.showdownDone = false;
    this.fast = false;
    this.dealing = true;
    this.thinking = null;
    this.events = [];
    this.take(this.match.round.log);
  }

  private restart(): void {
    this.gen++;
    this.running = false;
    this.thinking = null;
    this.evaluator.cancel();
    this.emit();
    void this.loop();
  }

  private myDone(): boolean {
    const st = this.match.round.status[this.me];
    return st !== "waiting" && st !== "playing";
  }

  private sleep(ms: number): Promise<void> {
    return ms > 0 ? this.sleepFn(ms) : Promise.resolve();
  }

  private async loop(): Promise<void> {
    if (this.running || this.disposed) return;
    this.running = true;
    const g = this.gen;
    try {
      for (;;) {
        if (g !== this.gen) return;
        if (this.dealing) {
          this.emit();
          await this.sleep(this.fast ? 0 : this.pace.dealDelayMs);
          if (g !== this.gen) return;
          this.dealing = false;
        }
        const m = this.match;
        if (m.round.result) {
          if (!this.showdownDone) {
            if (!(await this.showdown(g))) return;
            this.showdownDone = true;
            this.fast = false;
            this.roundEnded();
          }
          this.emit();
          return;
        }
        const seat = m.round.turn!;
        const who = this.setup.seats[seat];
        if (who.kind !== "bot") {
          this.emit();
          return; // a person's move comes through act()
        }
        this.thinking = seat;
        this.emit();
        await this.sleep(this.fast ? 0 : this.myDone() ? this.pace.fastDelayMs : this.pace.botDelayMs);
        if (g !== this.gen) return;
        const spec = personaById(who.persona)?.policy ?? { kind: "threshold", t: 17 };
        let d: { action: Action; rng: Rng } | null;
        try {
          d = await this.decide(spec, viewFor(m, seat), this.botRng);
        } catch (e) {
          this.deps.onEngineError?.(e);
          d = { action: "stand", rng: this.botRng };
        }
        if (g !== this.gen || d === null) return;
        this.botRng = d.rng;
        this.thinking = null;
        if (this.applyMove(seat, d.action)) this.applyMove(seat, "stand");
      }
    } finally {
      if (g === this.gen) this.running = false;
      if (!this.running) this.flushIdle();
    }
  }

  /** Shows the others' hands one by one; false when interrupted. */
  private async showdown(g: number): Promise<boolean> {
    const r = this.match.round;
    for (const seat of r.order) {
      if (seat === this.me || this.visible[seat]) continue;
      this.visible[seat] = true;
      this.push({ t: "reveal", seat, hand: r.hands[seat].slice() });
      this.emit();
      await this.sleep(this.fast ? 0 : this.pace.revealDelayMs);
      if (g !== this.gen) return false;
    }
    this.push({ t: "result", result: r.result! });
    return true;
  }

  private applyMove(seat: number, action: Action): GameError | null {
    const r = matchApply(this.match, seat, action);
    if ("error" in r) return r.error === "round-over" || r.error === "not-your-turn" ? r.error : r.error === "match-over" ? "match-over" : "illegal-action";
    this.match = r.state;
    this.decisions.push({ round: this.match.roundNo, seat, action });
    this.take(r.events);
    this.save();
    return null;
  }

  /** New engine events: shown furas become visible now, the final reveals wait for the showdown. */
  private take(batch: readonly RoundEvent[]): void {
    const ends = batch.some((e) => e.t === "result");
    const mine = eventsFor(batch, this.me, this.match.round);
    if (!ends) for (const e of mine) if (e.t === "reveal") this.visible[e.seat] = true;
    if (ends) {
      // Reveals before the end-of-round block belong to furas shown at once.
      let i = mine.length - 1;
      while (i >= 0 && (mine[i].t === "reveal" || mine[i].t === "result")) i--;
      for (let k = 0; k <= i; k++) if (mine[k].t === "reveal") this.visible[(mine[k] as { seat: number }).seat] = true;
      this.events = [];
      for (const e of mine.slice(0, i + 1)) this.push(e);
    } else {
      this.events = [];
      for (const e of mine) this.push(e);
    }
    this.emit();
  }

  private push(event: RoundEvent): void {
    this.events = [...this.events, { id: ++this.eventId, event }];
  }

  private roundEnded(): void {
    const info: RoundEndInfo = {
      setup: this.setup,
      me: this.me,
      match: this.match,
      decisions: this.decisions.filter((d) => d.round === this.match.roundNo),
    };
    if (this.setup.mode !== "training") {
      try {
        this.deps.onRoundEnd?.(info);
        if (this.match.winner !== null) this.deps.onMatchEnd?.(info);
      } catch (e) {
        this.deps.onEngineError?.(e);
      }
    }
    this.save();
  }

  private save(): void {
    if (this.disposed) return;
    try {
      this.deps.onSave?.(this.saved());
    } catch (e) {
      this.deps.onEngineError?.(e);
    }
  }

  private flushIdle(): void {
    const w = this.idleWaiters;
    this.idleWaiters = [];
    w.forEach((r) => r());
  }

  // --- The snapshot ---------------------------------------------------------------

  private emit(): void {
    if (this.disposed) return;
    this.snapshot = this.build();
    this.listeners.forEach((l) => l());
  }

  private phase(): Phase {
    const r = this.match.round;
    if (r.result) return !this.showdownDone ? "showdown" : this.match.winner !== null ? "matchEnd" : "roundEnd";
    if (this.dealing) return "dealing";
    if (r.turn === this.me) return "myTurn";
    return r.turn === r.bank ? "bankTurn" : "othersTurn";
  }

  private build(): GameSnapshot {
    const m = this.match;
    const r = m.round;
    const done = this.showdownDone;
    const phase = this.phase();
    // Points of a round count once its hands are all shown.
    const scores = done || !r.result ? m.scores.slice() : m.scores.map((s, i) => s - r.result!.points[i]);
    const shown = (i: number) => i === this.me || this.visible[i];
    const raw = viewFor(m, this.me);
    const others: OtherSeat[] = raw.others.map((o) => {
      const status = o.status === "bust" && !shown(o.seat) ? ("stood" as const) : o.status;
      return shown(o.seat) ? { ...o, status, hand: r.hands[o.seat].slice() } : { seat: o.seat, cards: o.cards, status, persian: o.persian };
    });
    const view: SeatView = {
      ...raw,
      others,
      seenCards: [...raw.myHand, ...others.flatMap((o) => o.hand ?? [])],
      result: done ? r.result : null,
      winner: done ? m.winner : null,
      scores,
    };
    const seats: SeatInfo[] = this.setup.seats.map((s, i) => {
      const persona = s.kind === "bot" ? personaById(s.persona) ?? null : null;
      const o = others.find((x) => x.seat === i);
      const hand = shown(i) ? r.hands[i].slice() : undefined;
      return {
        seat: i,
        name: s.name,
        kind: s.kind,
        persona: persona?.id ?? null,
        color: persona?.color ?? (s.kind === "human" ? HUMAN_COLOR : REMOTE_COLOR),
        cards: r.hands[i].length,
        status: i === this.me ? raw.myStatus : o!.status,
        persian: i === this.me ? raw.myValue.persian : o!.persian,
        isBank: r.bank === i,
        isDealer: r.dealer === i,
        thinking: this.thinking === i,
        score: scores[i],
        ...(hand ? { hand, value: handValue(hand, m.rules) } : {}),
      };
    });
    return Object.freeze({
      phase,
      mode: this.setup.mode,
      rules: m.rules,
      me: this.me,
      roundNo: m.roundNo,
      view,
      seats,
      lastEvents: this.events,
      result: done ? r.result : null,
      scores,
      target: m.rules.target,
      winner: done ? m.winner : null,
      canSkip: !done && !this.fast && this.myDone(),
      canRematch: phase === "matchEnd",
      canReplay: this.setup.mode === "training" && (phase === "roundEnd" || phase === "matchEnd"),
    });
  }
}
