// Finding tables on the Wi‑Fi network (mDNS / Bonjour, react-native-zeroconf):
// the host advertises "_oczko._tcp" with a few facts in the TXT record, guests
// list what they see. Networks that block multicast fall back to the code or
// the QR code (src/lan/code.ts).
import Zeroconf, { useZeroconf, type Service } from "react-native-zeroconf";

import { PROTOCOL_VERSION } from "./protocol";

export const SERVICE_TYPE = "oczko";

/** What a guest sees of a table before joining. */
export interface TableAd {
  open: number;
  seats: number;
  playing: boolean;
  mode: "family" | "bank";
  /** Points to win (1: one round). */
  target: number;
}

export interface FoundTable {
  key: string;
  name: string;
  host: string;
  port: number;
  /** null: another version of the app (cannot join). */
  ad: TableAd | null;
}

export function adToTxt(ad: TableAd): Record<string, string> {
  return { v: String(PROTOCOL_VERSION), o: String(ad.open), n: String(ad.seats), g: ad.playing ? "1" : "0", m: ad.mode === "bank" ? "b" : "f", t: String(ad.target) };
}

export function txtToAd(txt: Record<string, string> | undefined): TableAd | null {
  if (!txt || txt.v !== String(PROTOCOL_VERSION)) return null;
  const num = (x: string | undefined) => {
    const n = Number(x);
    return Number.isInteger(n) && n >= 0 && n <= 99 ? n : 0;
  };
  return { open: num(txt.o), seats: num(txt.n), playing: txt.g === "1", mode: txt.m === "b" ? "bank" : "family", target: num(txt.t) };
}

export function serviceToTable(s: Service): FoundTable | null {
  const host = s.ipv4?.[0] ?? s.addresses?.find((a) => /^\d+\.\d+\.\d+\.\d+$/.test(a));
  if (!host || !s.port) return null;
  return { key: `${s.name}@${host}:${s.port}`, name: s.name, host, port: s.port, ad: txtToAd(s.txt) };
}

/** Tables on the network, while `enabled`. */
export function useTables(enabled: boolean): { tables: FoundTable[]; error: boolean } {
  const { services, error } = useZeroconf({ type: SERVICE_TYPE, protocol: "tcp", enabled });
  const tables = services.flatMap((s) => {
    const t = serviceToTable(s);
    return t ? [t] : [];
  });
  return { tables, error: !!error };
}

/** Advertise a table; failures are quiet (guests can join by code or QR). */
export function advertise(name: string, port: number, ad: TableAd): { update: (ad: TableAd) => void; stop: () => void } {
  const zc = new Zeroconf();
  let published: string | null = null;
  let stopped = false;
  zc.publishService({ type: SERVICE_TYPE, protocol: "tcp", name, port, txt: adToTxt(ad) })
    .then((s) => {
      published = s.name;
      if (stopped) void zc.unpublishService(s.name).catch(() => {});
    })
    .catch(() => {});
  return {
    update: (next) => {
      if (published && !stopped) void zc.updateService(published, { txt: adToTxt(next) }).catch(() => {});
    },
    stop: () => {
      stopped = true;
      if (published) void zc.unpublishService(published).catch(() => {});
      zc.removeDeviceListeners();
    },
  };
}
