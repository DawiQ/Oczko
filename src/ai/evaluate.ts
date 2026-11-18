// The evaluator: how risky is "Dobieram", and what are the chances of scoring
// with "Starczy" vs "Dobieram". Pure (randomness from the given seed) and
// computed from a seat's view only — it never sees hidden cards.
//
// P(fura) is exact under the usual assumption that every unseen card is
// equally likely to be next. The chances to score come from Monte Carlo:
// the others' face-down hands are drawn from the unseen cards, consistent with
// what is known (card counts, announced perskie oczko, "Starczy" under the
// opponent model), and the rest of the round is played out by that model.
//
// The hot loop works on typed arrays with a local mutable generator (no
// allocation per sample); the result does not depend on how the samples are
// split into chunks.
import { makeDeck, rankOf, type Card } from "../engine/cards";
import type { Rng } from "../engine/rng";
import { playOrder, type Action } from "../engine/round";
import type { FaceRank, Rules } from "../engine/rules";
import { ACE } from "../engine/score";
import type { SeatView } from "../engine/view";

/** How the others play in the simulation: "Dobieram" below `standAt`. */
export interface OpponentModel {
  standAt: number;
}

export interface EvaluateOptions {
  samples: number;
  rng: Rng;
  opponentModel: OpponentModel;
  /** After "Dobieram", the simulated me keeps drawing below this total
   *  (0 = one card only). Default: the opponent model's threshold. */
  continueAt?: number;
}

export interface Evaluation {
  /** P(fura) after one more card. */
  bustIfHit: number;
  /** Expected share of this round's points for me with "Starczy" (0..1). */
  winIfStand: number;
  /** The same with "Dobieram" (then playing on by `continueAt`). */
  winIfHit: number;
  best: Action;
  /** How sure `best` is (0..1, from the standard error of the difference). */
  confidence: number;
  samples: number;
}

// --- Fast hands -------------------------------------------------------------

/** Points per card id (an ace counts 0 here; aces are counted apart). */
function valueTable(rules: Rules): Int8Array {
  const t = new Int8Array(52);
  for (let c = 0; c < 52; c++) {
    const r = rankOf(c);
    t[c] = r === ACE ? 0 : rules.values[r as FaceRank];
  }
  return t;
}

const isAce = (c: Card) => rankOf(c) === ACE;

/** `aces21`: two aces in two cards count 21 (`n` = cards in the hand). */
function totalOf(sum: number, aces: number, eleven: boolean, aces21 = false, n = 0): number {
  if (aces21 && n === 2 && aces === 2) return 21;
  if (eleven) return sum + 11 * aces;
  const t = sum + aces;
  return aces > 0 && t + 10 <= 21 ? t + 10 : t;
}

// --- Setup from the view ------------------------------------------------------

interface Setup {
  rules: Rules;
  me: number;
  seats: number;
  order: number[];
  /** Seats that still play after me, in order. */
  after: number[];
  value: Int8Array;
  eleven: boolean;
  /** Known cards per seat (mine, revealed hands). */
  known: Card[][];
  /** Face-down card counts per seat (0 for me and revealed seats). */
  hiddenCount: number[];
  /** Seats whose hidden hand is an announced perskie oczko. */
  persian: boolean[];
  /** Finished, face-down seats: their hand must be consistent with stopping. */
  stood: boolean[];
  maxed: boolean[];
  /** Unseen cards (the pool the hidden hands and the stock come from). */
  pool: Int16Array;
  /** Is everyone but the bank out with a known fura before the bank's turn? */
  bustRevealed: boolean;
  standAt: number;
  continueAt: number;
  myCards: Card[];
  stockLeft: number;
}

function setup(view: SeatView, opts: EvaluateOptions): Setup {
  const rules = view.rules;
  const seats = view.others.length + 1;
  const order = playOrder(seats, view.dealer, view.bank);
  const known: Card[][] = Array.from({ length: seats }, () => []);
  const hiddenCount = new Array(seats).fill(0);
  const persian = new Array(seats).fill(false);
  const stood = new Array(seats).fill(false);
  const maxed = new Array(seats).fill(false);
  const status: string[] = new Array(seats).fill("waiting");
  known[view.me] = view.myHand.slice();
  status[view.me] = view.myStatus;
  for (const o of view.others) {
    status[o.seat] = o.status;
    if (o.hand) known[o.seat] = o.hand.slice();
    else {
      hiddenCount[o.seat] = o.cards;
      persian[o.seat] = o.persian;
      stood[o.seat] = o.status === "stood" && !o.persian;
      maxed[o.seat] = o.status === "maxed";
    }
  }
  const seen = new Set<Card>(view.seenCards);
  const pool = Int16Array.from(makeDeck(rules.deck).filter((c) => !seen.has(c)));
  const myPos = order.indexOf(view.me);
  const after = order.slice(myPos + 1).filter((s) => status[s] === "waiting" || status[s] === "playing");
  return {
    rules,
    me: view.me,
    seats,
    order,
    after,
    value: valueTable(rules),
    eleven: rules.ace === "eleven",
    known,
    hiddenCount,
    persian,
    stood,
    maxed,
    pool,
    bustRevealed: rules.bustRevealed,
    standAt: opts.opponentModel.standAt,
    continueAt: opts.continueAt ?? opts.opponentModel.standAt,
    myCards: view.myHand.slice(),
    stockLeft: view.stockLeft,
  };
}

/** P(fura) with one more card: unseen cards that bust my hand / unseen cards. */
function exactBust(st: Setup): number {
  if (st.pool.length === 0 || st.stockLeft === 0) return 0;
  let sum = 0;
  let aces = 0;
  for (const c of st.myCards) {
    if (isAce(c)) aces++;
    else sum += st.value[c];
  }
  let bust = 0;
  for (const c of st.pool) {
    const a = aces + (isAce(c) ? 1 : 0);
    const s = sum + (isAce(c) ? 0 : st.value[c]);
    const persian = st.rules.persian !== "off" && st.myCards.length === 1 && a === 2;
    if (!persian && totalOf(s, a, st.eleven) > 21) bust++;
  }
  return bust / st.pool.length;
}

// --- Monte Carlo ------------------------------------------------------------

export interface Accumulator {
  st: Setup;
  /** Local generator state (mulberry32). */
  seed: number;
  done: number;
  stand: number;
  hit: number;
  /** Sum of squared differences (hit - stand), for the confidence. */
  diffSq: number;
  bustIfHit: number;
  // scratch
  deck: Int16Array;
  /** Deck positions [top, shuffledTo) already drawn at random (shared by both branches). */
  shuffledTo: number;
  sum: Int16Array;
  aces: Int8Array;
  n: Int8Array;
  bust: Uint8Array;
  pers: Uint8Array;
  sum2: Int16Array;
  aces2: Int8Array;
  n2: Int8Array;
  bust2: Uint8Array;
  pers2: Uint8Array;
  /** Redraws spent per seat so far (to spot seats that ignore the model). */
  tries: Float64Array;
}

export function startEvaluation(view: SeatView, opts: EvaluateOptions): Accumulator {
  const st = setup(view, opts);
  const z = st.seats;
  return {
    st,
    seed: opts.rng.state >>> 0,
    done: 0,
    stand: 0,
    hit: 0,
    diffSq: 0,
    bustIfHit: exactBust(st),
    deck: new Int16Array(st.pool.length),
    shuffledTo: 0,
    sum: new Int16Array(z),
    aces: new Int8Array(z),
    n: new Int8Array(z),
    bust: new Uint8Array(z),
    pers: new Uint8Array(z),
    sum2: new Int16Array(z),
    aces2: new Int8Array(z),
    n2: new Int8Array(z),
    bust2: new Uint8Array(z),
    pers2: new Uint8Array(z),
    tries: new Float64Array(z),
  };
}

/** Redraws of one hidden hand before accepting an inconsistent one (a
 *  person may well stop below the model's threshold). A seat that keeps
 *  needing many redraws plainly does not follow the model: after a few
 *  samples it gets only `FEW_TRIES`. */
const MAX_TRIES = 100;
const FEW_TRIES = 6;

/** Runs `count` more samples (mutates the accumulator). */
export function runSamples(acc: Accumulator, count: number): void {
  const st = acc.st;
  const { rules, value, eleven } = st;
  const aces21 = rules.persian === "is21";
  const deck = acc.deck;
  const poolLen = st.pool.length;
  let seed = acc.seed;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const { sum, aces, n, bust, pers } = acc;

  for (let k = 0; k < count; k++) {
    deck.set(st.pool);
    let top = 0; // cards [0, top) are taken
    // Base hands: known cards.
    for (let s = 0; s < st.seats; s++) {
      let su = 0;
      let ac = 0;
      for (const c of st.known[s]) {
        if (isAce(c)) ac++;
        else su += value[c];
      }
      sum[s] = su;
      aces[s] = ac;
      n[s] = st.known[s].length;
    }
    // Hidden hands, drawn from the pool and kept only if consistent.
    for (const s of st.order) {
      const h = st.hiddenCount[s];
      if (h === 0) continue;
      if (st.persian[s]) {
        // Two aces from the pool.
        let got = 0;
        for (let i = top; i < poolLen && got < 2; i++)
          if (isAce(deck[i])) {
            const tmp = deck[top];
            deck[top] = deck[i];
            deck[i] = tmp;
            top++;
            got++;
          }
        aces[s] += got;
        n[s] += got;
        continue;
      }
      let tries = 0;
      const limit = acc.done >= 20 && acc.tries[s] / acc.done > 30 ? FEW_TRIES : MAX_TRIES;
      for (;;) {
        let su = sum[s];
        let ac = aces[s];
        for (let j = 0; j < h; j++) {
          const i = top + j + Math.floor(rand() * (poolLen - top - j));
          const tmp = deck[top + j];
          deck[top + j] = deck[i];
          deck[i] = tmp;
          const c = deck[top + j];
          if (isAce(c)) ac++;
          else su += value[c];
        }
        const tot = totalOf(su, ac, eleven, aces21, n[s] + h);
        const isPers = rules.persian === "wins" && n[s] + h === 2 && ac === 2;
        const over = !isPers && tot > 21;
        let ok: boolean;
        if (isPers) ok = false; // it would have been announced
        else if (st.stood[s]) ok = over ? !st.bustRevealed : tot >= st.standAt; // a hidden fura looks like "Starczy"
        else if (st.maxed[s]) ok = !over || !st.bustRevealed;
        else ok = !over; // still waiting: holds only its deal
        if (ok || ++tries >= limit) {
          acc.tries[s] += tries;
          sum[s] = su;
          aces[s] = ac;
          n[s] += h;
          top += h;
          break;
        }
      }
    }
    for (let s = 0; s < st.seats; s++) {
      const tot = totalOf(sum[s], aces[s], eleven, aces21, n[s]);
      pers[s] = rules.persian === "wins" && n[s] === 2 && aces[s] === 2 ? 1 : 0;
      bust[s] = !pers[s] && tot > 21 ? 1 : 0;
    }
    // The stock: the rest of the pool, shuffled lazily as it is drawn; both
    // branches see the same order (common random numbers).
    acc.shuffledTo = top;
    const standScore = playOut(acc, top, false, rand);
    const hitScore = playOut(acc, top, true, rand);
    acc.stand += standScore;
    acc.hit += hitScore;
    acc.diffSq += (hitScore - standScore) ** 2;
    acc.done++;
  }
  acc.seed = seed;
}

/**
 * Plays the round out from the sampled position (on copies of the hands) and
 * returns my share of the points. Both branches see the same stock order:
 * the deck tail is shuffled lazily and deterministically by position.
 */
function playOut(acc: Accumulator, top0: number, hitFirst: boolean, rand: () => number): number {
  const st = acc.st;
  const { rules, value, eleven } = st;
  const aces21 = rules.persian === "is21";
  const deck = acc.deck;
  const poolLen = st.pool.length;
  const sum = acc.sum2;
  const aces = acc.aces2;
  const n = acc.n2;
  const bust = acc.bust2;
  const pers = acc.pers2;
  sum.set(acc.sum);
  aces.set(acc.aces);
  n.set(acc.n);
  bust.set(acc.bust);
  pers.set(acc.pers);
  let top = top0;
  const draw = (): number => {
    if (top >= poolLen) return -1;
    if (top >= acc.shuffledTo) {
      const j = acc.shuffledTo;
      const i = j + Math.floor(rand() * (poolLen - j));
      const tmp = deck[j];
      deck[j] = deck[i];
      deck[i] = tmp;
      acc.shuffledTo++;
    }
    return deck[top++];
  };
  const maxCards = rules.maxCards ?? 99;
  const take = (s: number): boolean => {
    const c = draw();
    if (c < 0) return false;
    if (isAce(c)) aces[s]++;
    else sum[s] += value[c];
    n[s]++;
    if (rules.persian === "wins" && n[s] === 2 && aces[s] === 2) {
      pers[s] = 1;
      return false;
    }
    if (totalOf(sum[s], aces[s], eleven, aces21, n[s]) > 21) {
      bust[s] = 1;
      return false;
    }
    return n[s] < maxCards;
  };
  const playTo = (s: number, standAt: number) => {
    while (totalOf(sum[s], aces[s], eleven, aces21, n[s]) < standAt && take(s));
  };

  const me = st.me;
  if (hitFirst && take(me)) playTo(me, st.continueAt);
  for (const s of st.after) {
    if (rules.mode === "bank" && s === st.order[st.order.length - 1] && st.bustRevealed) {
      let allOut = true;
      for (const p of st.order) if (p !== s && !bust[p]) allOut = false;
      if (allOut) continue;
    }
    playTo(s, st.standAt);
  }
  return myShare(acc, sum, aces, n, bust, pers);
}

function myShare(acc: Accumulator, sum: Int16Array, aces: Int8Array, n: Int8Array, bust: Uint8Array, pers: Uint8Array): number {
  const st = acc.st;
  const { rules, eleven, me } = st;
  const total = (s: number) => totalOf(sum[s], aces[s], eleven, st.rules.persian === "is21", n[s]);
  // As the engine's handRank: perskie oczko > pontoon > five cards > total; fura -1.
  const rank = (s: number): number => {
    if (bust[s]) return -1;
    if (pers[s]) return 300;
    const t = total(s);
    if (rules.pontoon && n[s] === 2 && aces[s] > 0 && t === 21) return 200;
    if (rules.fiveCardTrick && n[s] >= 5) return 100;
    return t;
  };
  if (rules.mode === "family") {
    let best = -1;
    for (let s = 0; s < st.seats; s++) best = Math.max(best, rank(s));
    if (best < 0 || rank(me) !== best) return 0;
    let winners = 0;
    for (let s = 0; s < st.seats; s++) if (rank(s) === best) winners++;
    return winners > 1 && rules.familyTie === "noneScore" ? 0 : 1;
  }
  const bank = st.order[st.order.length - 1];
  const duel = (p: number): number => {
    // 1 player, -1 bank, 0 nobody
    if (bust[p]) return bust[bank] && !rules.playerBustLoses ? 0 : -1;
    if (bust[bank]) return 1;
    const r = Math.sign(rank(p) - rank(bank));
    return r === 0 ? (rules.bankTie === "bankWins" ? -1 : 0) : r;
  };
  if (me !== bank) return duel(me) === 1 ? 1 : 0;
  let won = 0;
  let lost = 0;
  let players = 0;
  for (const p of st.order) {
    if (p === bank) continue;
    players++;
    const d = duel(p);
    if (d < 0) won++;
    else if (d > 0) lost++;
  }
  if (rules.bankScoring === "perDuel") return players ? won / players : 0;
  return won > lost ? 1 : 0;
}

/** Normal CDF via erf (Abramowitz–Stegun 7.1.26). */
function phi(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}

export function finishEvaluation(acc: Accumulator): Evaluation {
  const k = Math.max(1, acc.done);
  const winIfStand = acc.stand / k;
  const winIfHit = acc.hit / k;
  const canHit = acc.st.stockLeft > 0 && acc.st.myCards.length < (acc.st.rules.maxCards ?? 99);
  const diff = winIfHit - winIfStand;
  const variance = Math.max(0, acc.diffSq / k - diff * diff);
  const se = Math.sqrt(variance / k);
  const confidence = se === 0 ? (diff === 0 ? 0 : 1) : 2 * phi(Math.abs(diff) / se) - 1;
  return {
    bustIfHit: acc.bustIfHit,
    winIfStand,
    winIfHit: canHit ? winIfHit : 0,
    best: canHit && winIfHit > winIfStand ? "hit" : "stand",
    confidence: canHit ? confidence : 1,
    samples: acc.done,
  };
}

/** The whole evaluation at once (bots, tools, tests). */
export function evaluate(view: SeatView, opts: EvaluateOptions): Evaluation {
  const acc = startEvaluation(view, opts);
  runSamples(acc, opts.samples);
  return finishEvaluation(acc);
}

// --- In chunks, cancellable --------------------------------------------------

export interface ChunkedEvaluator {
  /** Evaluates in chunks, yielding between them; null when cancelled. */
  evaluate(view: SeatView, opts: EvaluateOptions, onProgress?: (e: Evaluation) => void): Promise<Evaluation | null>;
  /** Cancels the running evaluation (it resolves null). */
  cancel(): void;
}

/** `yieldNow` lets the UI breathe between chunks (default: a 0 ms timeout). */
export function chunkedEvaluator(
  chunk = 250,
  yieldNow: () => Promise<void> = () => new Promise((r) => setTimeout(r, 0))
): ChunkedEvaluator {
  let epoch = 0;
  return {
    cancel: () => {
      epoch++;
    },
    async evaluate(view, opts, onProgress) {
      const mine = ++epoch;
      const acc = startEvaluation(view, opts);
      while (acc.done < opts.samples) {
        runSamples(acc, Math.min(chunk, opts.samples - acc.done));
        if (acc.done < opts.samples) {
          onProgress?.(finishEvaluation(acc));
          await yieldNow();
          if (mine !== epoch) return null;
        }
      }
      return mine === epoch ? finishEvaluation(acc) : null;
    },
  };
}
