// The last matches (oczko.history.v1), newest first.
import { validateRules } from "../engine/rules";
import { looksLikeRecord, type HistoryRecord } from "../history/record";
import { readJSON, writeJSON, type KV } from "./kv";

export const HISTORY_KEY = "oczko.history.v1";
/** Kept on the phone; without Oczko Pro the last `FREE_HISTORY` are shown. */
export const MAX_HISTORY = 50;
export const FREE_HISTORY = 10;

interface Stored {
  v: 1;
  records: unknown[];
}
const looksLikeStored = (x: unknown): x is Stored => typeof x === "object" && x !== null && (x as Stored).v === 1 && Array.isArray((x as Stored).records);

/** Broken records are dropped one by one, never the whole history. */
export async function loadHistory(kv: KV): Promise<HistoryRecord[]> {
  const s = await readJSON(kv, HISTORY_KEY, looksLikeStored);
  // Rules as the engine reads them now (before version 1.1 the two-aces rule was a boolean).
  return s ? s.records.filter(looksLikeRecord).map((r) => ({ ...r, setup: { ...r.setup, rules: validateRules(r.setup.rules) ?? r.setup.rules } })) : [];
}

const save = (kv: KV, records: HistoryRecord[]) => writeJSON(kv, HISTORY_KEY, { v: 1, records: records.slice(0, MAX_HISTORY) });

// Read-modify-write in order.
let chain: Promise<unknown> = Promise.resolve();
function update(kv: KV, f: (r: HistoryRecord[]) => HistoryRecord[]): Promise<HistoryRecord[]> {
  const next = chain.then(async () => {
    const r = f(await loadHistory(kv));
    await save(kv, r);
    return r;
  });
  chain = next.catch(() => {});
  return next;
}

export const addRecord = (kv: KV, rec: HistoryRecord) => update(kv, (r) => [rec, ...r.filter((x) => x.id !== rec.id)]);
export const updateRecord = (kv: KV, rec: HistoryRecord) => update(kv, (r) => r.map((x) => (x.id === rec.id ? rec : x)));
export const clearHistory = (kv: KV) => update(kv, () => []);

/** The history as a JSON file's text (export). */
export const exportHistory = (records: readonly HistoryRecord[]) => JSON.stringify({ app: "oczko", v: 1, records }, null, 1);
