// What a player without Oczko Pro may still use today, and what rewarded ads
// added: pure functions over a small saved state (no React, no stores).
//
// Free each day (PLAN.md §10): FREE_HINTS trainer hints, FREE_ANALYSES match
// analysis, FREE_BIG_TABLES table of 7–8. A rewarded ad adds one of the chosen
// kind for the same day, or a look for 24 h. Oczko Pro: no limits (the
// functions take `pro`). Points of the game are never in here — nothing bought
// or watched changes how a game is played between people.

export const FREE_HINTS = 3;
export const FREE_ANALYSES = 1;
export const FREE_BIG_TABLES = 1;
/** What one rewarded ad adds. */
export const AD_BONUS = 1;
export const THEME_TRIAL_MS = 24 * 60 * 60 * 1000;

export type Spendable = "hint" | "analysis" | "bigTable";

/** What a rewarded ad gives. */
export type Reward = { kind: "hints" } | { kind: "analysis" } | { kind: "bigTable" } | { kind: "look"; id: string };

export interface Wallet {
  v: 1;
  /** Local day (YYYY-MM-DD) the daily counters belong to. */
  day: string;
  hintsUsed: number;
  analysesUsed: number;
  bigTablesUsed: number;
  /** From ads today (they end with the day too). */
  bonusHints: number;
  bonusAnalyses: number;
  bonusBigTables: number;
  /** Look id -> end of its trial (ms since epoch). */
  trials: Record<string, number>;
}

export function localDay(now: number): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const emptyWallet = (now: number): Wallet => ({
  v: 1,
  day: localDay(now),
  hintsUsed: 0,
  analysesUsed: 0,
  bigTablesUsed: 0,
  bonusHints: 0,
  bonusAnalyses: 0,
  bonusBigTables: 0,
  trials: {},
});

/** A new day (midnight): the daily counters and today's ad bonuses start over;
 *  finished trials are dropped. */
export function rollover(w: Wallet, now: number): Wallet {
  const trials = Object.fromEntries(Object.entries(w.trials).filter(([, until]) => until > now));
  const day = localDay(now);
  if (w.day === day) return Object.keys(trials).length === Object.keys(w.trials).length ? w : { ...w, trials };
  return { ...w, day, hintsUsed: 0, analysesUsed: 0, bigTablesUsed: 0, bonusHints: 0, bonusAnalyses: 0, bonusBigTables: 0, trials };
}

export const hintsLeft = (w: Wallet, pro: boolean): number => (pro ? Infinity : Math.max(0, FREE_HINTS + w.bonusHints - w.hintsUsed));
export const analysesLeft = (w: Wallet, pro: boolean): number => (pro ? Infinity : Math.max(0, FREE_ANALYSES + w.bonusAnalyses - w.analysesUsed));
export const bigTablesLeft = (w: Wallet, pro: boolean): number => (pro ? Infinity : Math.max(0, FREE_BIG_TABLES + w.bonusBigTables - w.bigTablesUsed));

/** Spend one of a kind; null when none is left. Pro spends nothing. */
export function spend(w: Wallet, kind: Spendable, pro: boolean): Wallet | null {
  if (pro) return w;
  switch (kind) {
    case "hint":
      return hintsLeft(w, false) > 0 ? { ...w, hintsUsed: w.hintsUsed + 1 } : null;
    case "analysis":
      return analysesLeft(w, false) > 0 ? { ...w, analysesUsed: w.analysesUsed + 1 } : null;
    case "bigTable":
      return bigTablesLeft(w, false) > 0 ? { ...w, bigTablesUsed: w.bigTablesUsed + 1 } : null;
  }
}

/** Two states of the same device (the saved one and one used before it was
 *  read): the most used and the most earned of each. */
export function mergeWallets(a: Wallet, b: Wallet): Wallet {
  if (a.day !== b.day) return a.day > b.day ? a : b;
  const trials = { ...a.trials };
  for (const [id, until] of Object.entries(b.trials)) trials[id] = Math.max(trials[id] ?? 0, until);
  return {
    v: 1,
    day: a.day,
    hintsUsed: Math.max(a.hintsUsed, b.hintsUsed),
    analysesUsed: Math.max(a.analysesUsed, b.analysesUsed),
    bigTablesUsed: Math.max(a.bigTablesUsed, b.bigTablesUsed),
    bonusHints: Math.max(a.bonusHints, b.bonusHints),
    bonusAnalyses: Math.max(a.bonusAnalyses, b.bonusAnalyses),
    bonusBigTables: Math.max(a.bonusBigTables, b.bonusBigTables),
    trials,
  };
}

export function grant(w: Wallet, r: Reward, now: number): Wallet {
  switch (r.kind) {
    case "hints":
      return { ...w, bonusHints: w.bonusHints + AD_BONUS };
    case "analysis":
      return { ...w, bonusAnalyses: w.bonusAnalyses + AD_BONUS };
    case "bigTable":
      return { ...w, bonusBigTables: w.bonusBigTables + AD_BONUS };
    case "look":
      return { ...w, trials: { ...w.trials, [r.id]: now + THEME_TRIAL_MS } };
  }
}

export const trialEnds = (w: Wallet, id: string, now: number): number | null => {
  const until = w.trials[id];
  return until && until > now ? until : null;
};

const isCount = (x: unknown) => typeof x === "number" && Number.isInteger(x) && x >= 0;

export function looksLikeWallet(x: unknown): x is Wallet {
  const o = x as Wallet;
  return (
    typeof x === "object" &&
    x !== null &&
    o.v === 1 &&
    typeof o.day === "string" &&
    [o.hintsUsed, o.analysesUsed, o.bigTablesUsed, o.bonusHints, o.bonusAnalyses, o.bonusBigTables].every(isCount) &&
    typeof o.trials === "object" &&
    o.trials !== null &&
    Object.values(o.trials).every((t) => typeof t === "number")
  );
}
