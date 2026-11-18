// A guest at a Wi‑Fi table: joins the host's table, waits in the lobby, then
// plays from the views the host sends (its own seat only). Moves go to the
// host, which checks them. A broken link is retried with the seat's token
// until the guest leaves.
import type { GameError, GameSnapshot, TableGame } from "../game/TableGame";
import {
  encode,
  LineReader,
  parseHostMsg,
  PROTOCOL_VERSION,
  type GuestMsg,
  type HostMsg,
  type LanInfo,
  type LobbySlot,
  type ReactionText,
  type RefuseReason,
  type TableInfo,
} from "./protocol";
import type { Conn, Dialer } from "./transport";

export const PING_EVERY_MS = 3_000;
/** No word from the host for this long: the link is dead, reconnect. */
export const HOST_SILENT_MS = 10_000;
export const RETRY_MS = 2_000;

export interface GuestView {
  phase: "connecting" | "lobby" | "playing" | "refused" | "closed";
  table: TableInfo | null;
  slots: LobbySlot[];
  you: number;
  /** The link to the table is down (retrying). */
  offline: boolean;
  refused: RefuseReason | null;
  closed: "host-left" | "removed" | "left" | null;
  /** The last move the host refused. */
  rejected: string | null;
  lan: LanInfo | null;
}

export interface LanGuestOptions {
  dial: Dialer;
  host: string;
  port: number;
  name: string;
  /** A finished round as this guest saw it. */
  onRoundEnd?: (snap: GameSnapshot) => void;
  now?: () => number;
  pingEveryMs?: number;
  retryMs?: number;
}

export class LanGuest {
  private readonly opts: LanGuestOptions & { now: () => number; pingEveryMs: number; retryMs: number };
  private conn: Conn | null = null;
  private token: string | null = null;
  private view: GuestView = { phase: "connecting", table: null, slots: [], you: -1, offline: false, refused: null, closed: null, rejected: null, lan: null };
  private snap: GameSnapshot | null = null;
  private lastHeard = 0;
  private ping: ReturnType<typeof setInterval> | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();
  private stopped = false;

  constructor(opts: LanGuestOptions) {
    this.opts = { now: Date.now, pingEveryMs: PING_EVERY_MS, retryMs: RETRY_MS, ...opts };
  }

  /** First connection; rejects when the table cannot be reached. */
  async connect(): Promise<void> {
    await this.dial();
    this.ping = setInterval(() => this.heartbeat(), this.opts.pingEveryMs);
  }

  get state(): GuestView {
    return this.view;
  }

  /** The table as this guest sees it (null before the deal). */
  get snapshot(): GameSnapshot | null {
    return this.snap;
  }

  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  /** Leave the table for good. */
  leave(): void {
    if (this.stopped) return;
    this.send({ t: "leave" });
    this.stop("left");
  }

  react(text: ReactionText): void {
    this.send({ t: "react", text });
  }

  private move(action: "hit" | "stand"): GameError | null {
    const s = this.snap;
    if (!s || s.phase !== "myTurn") return "not-your-turn";
    if (!s.view.legal.includes(action)) return "illegal-action";
    this.send({ t: "move", action });
    return null;
  }

  /** The table screen's game: moves go to the host; the host deals. */
  readonly game: TableGame = {
    getSnapshot: () => this.snap!,
    subscribe: (fn) => this.subscribe(fn),
    hit: () => this.move("hit"),
    stand: () => this.move("stand"),
    nextRound: () => "not-your-turn",
    skipToEnd: () => "nothing-to-skip",
    rematch: () => "not-your-turn",
    replayRound: () => "not-training",
    abandon: () => this.leave(),
  };

  // ---- internals ------------------------------------------------------------

  private async dial(): Promise<void> {
    const conn = await this.opts.dial(this.opts.host, this.opts.port);
    if (this.stopped) return conn.close();
    this.conn = conn;
    this.lastHeard = this.opts.now();
    const reader = new LineReader();
    conn.onData((chunk) => {
      const lines = reader.push(chunk);
      if (!lines) return conn.close();
      for (const line of lines) {
        const msg = parseHostMsg(line);
        if (msg && this.conn === conn) this.fromHost(msg);
      }
    });
    conn.onClose(() => {
      if (this.conn !== conn) return;
      this.conn = null;
      this.lost();
    });
    this.send({ t: "hello", v: PROTOCOL_VERSION, name: this.opts.name, ...(this.token ? { token: this.token } : {}) });
  }

  private fromHost(msg: HostMsg): void {
    this.lastHeard = this.opts.now();
    switch (msg.t) {
      case "welcome":
        this.token = msg.token;
        return this.update({ table: msg.table, offline: false });
      case "refuse":
        this.stop(null);
        return this.update({ phase: "refused", refused: msg.reason });
      case "lobby":
        return this.update({ phase: "lobby", slots: msg.slots, you: msg.you, table: msg.table, offline: false });
      case "state": {
        const isEnd = (s: GameSnapshot | null) => s?.phase === "roundEnd" || s?.phase === "matchEnd";
        const before = this.snap;
        this.snap = msg.snap;
        // Once per round: on reaching its end (a rematch starts the numbers over;
        // the same end sent again after a reconnect does not count twice).
        if (isEnd(msg.snap) && (!isEnd(before) || before!.roundNo !== msg.snap.roundNo)) this.opts.onRoundEnd?.(msg.snap);
        return this.update({ phase: "playing", offline: false, rejected: null, lan: msg.lan });
      }
      case "reject":
        return this.update({ rejected: msg.code });
      case "closed":
        return this.stop(msg.reason);
      case "pong":
        return;
    }
  }

  private heartbeat(): void {
    if (this.stopped || !this.conn) return;
    if (this.opts.now() - this.lastHeard > HOST_SILENT_MS) {
      this.conn.close(); // dead link: onClose reconnects
      return;
    }
    this.send({ t: "ping" });
  }

  private lost(): void {
    if (this.stopped) return;
    this.update({ offline: true });
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    if (this.retry || this.stopped) return;
    this.retry = setTimeout(() => {
      this.retry = null;
      if (this.stopped || this.conn) return;
      this.dial().catch(() => this.scheduleRetry());
    }, this.opts.retryMs);
  }

  /** Breaks the link without leaving (tests: a dropped Wi‑Fi). */
  dropLink(): void {
    this.conn?.close();
  }

  private stop(closed: GuestView["closed"]): void {
    this.stopped = true;
    if (this.ping) clearInterval(this.ping);
    if (this.retry) clearTimeout(this.retry);
    this.ping = null;
    this.retry = null;
    const c = this.conn;
    this.conn = null;
    c?.close();
    if (closed) this.update({ phase: "closed", closed, offline: false });
  }

  private send(msg: GuestMsg): void {
    try {
      this.conn?.send(encode(msg));
    } catch {
      this.conn?.close();
    }
  }

  private update(patch: Partial<GuestView>): void {
    this.view = { ...this.view, ...patch };
    for (const fn of this.listeners) fn();
  }
}
