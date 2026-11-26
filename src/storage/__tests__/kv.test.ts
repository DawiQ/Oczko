import { memoryKV, readJSON, removeKey, writeJSON, type KV } from "../kv";

interface Thing {
  v: 1;
  n: number;
}
const looksLikeThing = (x: unknown): x is Thing =>
  typeof x === "object" && x !== null && (x as Thing).v === 1 && typeof (x as Thing).n === "number";

const KEY = "oczko.thing.v1";

describe("kv", () => {
  it("reads null for a missing key", async () => {
    expect(await readJSON(memoryKV(), KEY, looksLikeThing)).toBeNull();
  });

  it("reads null for corrupt JSON (never throws)", async () => {
    expect(await readJSON(memoryKV({ [KEY]: "{not json" }), KEY, looksLikeThing)).toBeNull();
  });

  it("reads null when the validator rejects the value", async () => {
    expect(await readJSON(memoryKV({ [KEY]: JSON.stringify({ v: 2, n: 1 }) }), KEY, looksLikeThing)).toBeNull();
    expect(await readJSON(memoryKV({ [KEY]: "null" }), KEY, looksLikeThing)).toBeNull();
  });

  it("writes and reads back", async () => {
    const kv = memoryKV();
    await writeJSON(kv, KEY, { v: 1, n: 7 });
    expect(await readJSON(kv, KEY, looksLikeThing)).toEqual({ v: 1, n: 7 });
  });

  it("a read sees every write issued before it, in order", async () => {
    const kv = memoryKV();
    void writeJSON(kv, KEY, { v: 1, n: 1 });
    void writeJSON(kv, KEY, { v: 1, n: 2 });
    void writeJSON(kv, KEY, { v: 1, n: 3 });
    expect(await readJSON(kv, KEY, looksLikeThing)).toEqual({ v: 1, n: 3 });
  });

  it("removes a key", async () => {
    const kv = memoryKV({ [KEY]: JSON.stringify({ v: 1, n: 1 }) });
    await removeKey(kv, KEY);
    expect(await readJSON(kv, KEY, looksLikeThing)).toBeNull();
  });

  it("survives a failing store", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const broken: KV = {
      get: () => Promise.reject(new Error("io")),
      set: () => Promise.reject(new Error("io")),
      remove: () => Promise.reject(new Error("io")),
    };
    await expect(writeJSON(broken, KEY, { v: 1, n: 1 })).resolves.toBeUndefined();
    await expect(removeKey(broken, KEY)).resolves.toBeUndefined();
    expect(await readJSON(broken, KEY, looksLikeThing)).toBeNull();
    // A failed write does not block the next one.
    const kv = memoryKV();
    await writeJSON(kv, KEY, { v: 1, n: 5 });
    expect(await readJSON(kv, KEY, looksLikeThing)).toEqual({ v: 1, n: 5 });
    warn.mockRestore();
  });
});
