// UTF-8 from a byte stream: TCP may cut a character ("ł", "ó") between two
// chunks, so the bytes of an unfinished character wait for the next chunk.

/** Decodes chunks in order; a character split between chunks comes out whole. */
export class Utf8Stream {
  private rest: number[] = [];

  push(chunk: Uint8Array): string {
    const bytes = this.rest.length ? [...this.rest, ...chunk] : Array.from(chunk);
    const end = completeLength(bytes);
    this.rest = bytes.slice(end);
    return decode(bytes, end);
  }
}

/** How many leading bytes end on a whole character. */
function completeLength(b: number[]): number {
  const n = b.length;
  for (let back = 1; back <= Math.min(3, n); back++) {
    const x = b[n - back];
    if ((x & 0xc0) === 0x80) continue; // a continuation byte: look further back
    const need = x >= 0xf0 ? 4 : x >= 0xe0 ? 3 : x >= 0xc0 ? 2 : 1;
    return need > back ? n - back : n;
  }
  return n;
}

function decode(b: number[], end: number): string {
  let out = "";
  let i = 0;
  while (i < end) {
    const x = b[i];
    let cp: number;
    let len: number;
    if (x < 0x80) [cp, len] = [x, 1];
    else if (x >= 0xf0 && x < 0xf8) [cp, len] = [x & 0x07, 4];
    else if (x >= 0xe0) [cp, len] = [x & 0x0f, 3];
    else if (x >= 0xc0) [cp, len] = [x & 0x1f, 2];
    else [cp, len] = [0xfffd, 1];
    if (len > 1) {
      if (i + len > end || b.slice(i + 1, i + len).some((c) => (c & 0xc0) !== 0x80)) {
        out += "\uFFFD";
        i++;
        continue;
      }
      for (let k = 1; k < len; k++) cp = (cp << 6) | (b[i + k] & 0x3f);
    }
    out += cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff) ? "\uFFFD" : String.fromCodePoint(cp);
    i += len;
  }
  return out;
}
