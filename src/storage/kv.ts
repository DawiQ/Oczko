// Key-value persistence. AsyncStorage on the device; tests inject a Map.
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export const deviceKV: KV = {
  get: (k) => AsyncStorage.getItem(k),
  set: (k, v) => AsyncStorage.setItem(k, v),
  remove: (k) => AsyncStorage.removeItem(k),
};

export function memoryKV(init: Record<string, string> = {}): KV {
  const m = new Map(Object.entries(init));
  return {
    get: async (k) => m.get(k) ?? null,
    set: async (k, v) => void m.set(k, v),
    remove: async (k) => void m.delete(k),
  };
}

// Writes are queued and reads wait for the queue, so a read always sees every
// write issued before it (e.g. the table saving on unmount, then the start
// screen reloading).
let pending: Promise<void> = Promise.resolve();
function enqueue(op: () => Promise<void>): Promise<void> {
  pending = pending.then(op, op);
  return pending;
}

/** Read JSON; anything missing, corrupt or failing `valid` yields null. */
export async function readJSON<T>(kv: KV, key: string, valid: (x: unknown) => x is T): Promise<T | null> {
  try {
    await pending;
    const raw = await kv.get(key);
    if (raw == null) return null;
    const parsed: unknown = JSON.parse(raw);
    return valid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJSON(kv: KV, key: string, value: unknown): Promise<void> {
  const text = JSON.stringify(value);
  return enqueue(async () => {
    try {
      await kv.set(key, text);
    } catch (e) {
      console.warn(`storage: could not save ${key}`, e);
    }
  });
}

export function removeKey(kv: KV, key: string): Promise<void> {
  return enqueue(async () => {
    try {
      await kv.remove(key);
    } catch (e) {
      console.warn(`storage: could not remove ${key}`, e);
    }
  });
}
