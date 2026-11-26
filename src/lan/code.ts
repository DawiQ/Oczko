// How a guest finds the table without discovery: a short code to type, or a
// QR code to scan.
//
// The code holds the last two numbers of the host's address and the port: a
// guest in the same network shares the first two (192.168.x.y, 10.0.x.y,
// 172.20.10.y on a phone's hotspot), so 4 characters are enough ("K7 4Q").
// The QR code carries the whole address.
import { LAN_PORT } from "./protocol";

// Crockford's base 32: no I, L, O or U (read as 1, 1, 0 — U never appears).
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const PORT_SPAN = 16;

export function parseIPv4(ip: string): [number, number, number, number] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip.trim());
  if (!m) return null;
  const parts = m.slice(1).map(Number) as [number, number, number, number];
  return parts.every((n) => n <= 255) ? parts : null;
}

/** "K7 4Q" for the host at `ip`:`port` (null: not an IPv4 address, or a port
 *  outside the table's range). */
export function tableCode(ip: string, port: number): string | null {
  const a = parseIPv4(ip);
  const off = port - LAN_PORT;
  if (!a || off < 0 || off >= PORT_SPAN) return null;
  let v = (a[2] << 12) | (a[3] << 4) | off; // 20 bits
  let s = "";
  for (let i = 0; i < 4; i++) {
    s = ALPHABET[v & 31] + s;
    v >>= 5;
  }
  return `${s.slice(0, 2)} ${s.slice(2)}`;
}

/** The host a typed code points to, for a guest whose own address is
 *  `myIp` (null: not a code, or no address of our own). */
export function parseTableCode(code: string, myIp: string | null): { host: string; port: number } | null {
  const mine = myIp ? parseIPv4(myIp) : null;
  if (!mine) return null;
  const clean = code
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
  if (clean.length !== 4) return null;
  let v = 0;
  for (const ch of clean) {
    const d = ALPHABET.indexOf(ch);
    if (d < 0) return null;
    v = (v << 5) | d;
  }
  const c = (v >> 12) & 255;
  const d = (v >> 4) & 255;
  return { host: `${mine[0]}.${mine[1]}.${c}.${d}`, port: LAN_PORT + (v & 15) };
}

const QR_PREFIX = "oczko://stol?";

/** The QR code's text: the whole address (short — a small QR code with big
 *  modules scans easily; the table's name comes with the welcome). */
export function joinLink(ip: string, port: number): string {
  return `${QR_PREFIX}h=${ip}&p=${port}`;
}

/** A scanned QR code (null: not an Oczko table). */
export function parseJoinLink(text: string): { host: string; port: number; name: string } | null {
  if (!text.startsWith(QR_PREFIX)) return null;
  const params = new Map<string, string>();
  for (const kv of text.slice(QR_PREFIX.length).split("&")) {
    const i = kv.indexOf("=");
    if (i <= 0) continue;
    try {
      params.set(kv.slice(0, i), decodeURIComponent(kv.slice(i + 1)));
    } catch {
      return null;
    }
  }
  const host = params.get("h") ?? "";
  const port = Number(params.get("p"));
  if (!parseIPv4(host) || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  return { host, port, name: (params.get("n") ?? "").slice(0, 40) };
}
