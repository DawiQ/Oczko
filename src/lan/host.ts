// The host of a Wi‑Fi table: the lobby before the deal (seats for guests and
// bots), then the game itself — a GameController with the guests as remote
// seats. Every guest gets only its own view; every move it sends is checked
// by the controller. A guest has MOVE_MS for a move (then "Starczy"); one who
// drops out keeps the seat for AWAY_MS, then a bot plays it under the guest's
// name until the guest is back (with the seat's token).
import { personaById, seatNames, type PersonaId } from "../ai/personas";
import { splitmix32 } from "../engine/rng";
import { GameController, type ControllerDeps } from "../game/GameController";
import type { GameSetup, SeatSetup } from "../game/setup";
import { freshSeed } from "../game/setup";
import type { GameSnapshot } from "../game/TableGame";
import {
  encode,
  FREE_LAN_SEATS,
  LineReader,
  MAX_LAN_SEATS,
  parseGuestMsg,
  PROTOCOL_VERSION,
  type GuestMsg,
  type HostMsg,
  type LanInfo,
  type LobbySlot,
  type Presence,
  type ReactionText,
  type TableInfo,
} from "./protocol";
import { LAN_PORT } from "./protocol";
import type { Conn, Server } from "./transport";

/** A guest's time for one move. */
export const MOVE_MS = 30_000;
/** How long a dropped guest keeps the seat before a bot takes over. */
export const AWAY_MS = 60_000;
/** A guest silent for this long (no ping) counts as dropped. */
export const SILENT_MS = 12_000;
const CHECK_EVERY_MS = 3_000;
/** The bot that plays for a guest who left. */
export const AWAY_BOT: PersonaId = "marek";

type Slot = { kind: "host" } | { kind: "open" } | { kind: "bot"; persona: PersonaId } | { kind: "guest"; guest: Guest };

interface Guest {
  name: string;
  token: string;
  conn: Conn | null;
  lastSeen: number;
  /** Seat in the game (set at the deal). */
  seat: number;
  /** A bot plays the seat (the guest left or was away too long). */
  botted: boolean;
  /** When a bot takes over, while the guest is away (ms since epoch). */
  deadline: number | null;
  timer: ReturnType<typeof setTimeout> | null;
}

export interface AwaySeat {
  seat: number;
  name: string;
  deadline: number;
}

export interface HostView {
  phase: "lobby" | "playing" | "closed";
  port: number;
  slots: LobbySlot[];
  away: AwaySeat[];
  /** Seats allowed (4, or 8 with the host's Oczko Pro). */
  maxSeats: number;
}

export interface LanHostOptions {
  /** The host's name at the table. */
  name: string;
  table: TableInfo;
  server: Server;
  deps: ControllerDeps;
  /** 8 seats with the host's Oczko Pro, else 4. */
  maxSeats?: number;
  port?: number;
  moveMs?: number;
  awayMs?: number;
  silentMs?: number;
  checkEveryMs?: number;
  now?: () => number;
  token?: () => string;
  seed?: () => number;
}

const randomToken = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, "0")).join("");

export class LanHost {
  private opts: Required<Omit<LanHostOptions, "port">> & { port: number };
  private slots: Slot[] = [{ kind: "host" }, { kind: "open" }];
  private phase: HostView["phase"] = "lobby";
  private port = -1;
  private game: GameController | null = null;
  private reaction: LanInfo["reaction"] = null;
  private reactionSeq = 0;
  private listeners = new Set<() => void>();
  private peers = new Set<Conn>();
  private check: ReturnType<typeof setInterval> | null = null;
  private moveTimer: ReturnType<typeof setTimeout> | null = null;
  /** Re-sends the table every second while a guest's time runs (the countdown). */
  private moveTick: ReturnType<typeof setInterval> | null = null;
  private moveKey = "";
  private moveDeadline: number | null = null;
  private view: HostView;
  private hostLan: LanInfo | null = null;

  constructor(opts: LanHostOptions) {
    this.opts = {
      port: LAN_PORT,
      maxSeats: FREE_LAN_SEATS,
      moveMs: MOVE_MS,
      awayMs: AWAY_MS,
      silentMs: SILENT_MS,
      checkEveryMs: CHECK_EVERY_MS,
      now: Date.now,
      token: randomToken,
      seed: freshSeed,
      ...opts,
    };
    this.view = this.buildView();
  }

  /** Starts listening (on LAN_PORT or one of the next few). */
  async open(): Promise<number> {
    const server = this.opts.server;
    server.onConnection((c) => this.accept(c));
    let lastErr: unknown = null;
    for (let i = 0; i < 10 && this.port < 0; i++) {
      try {
        this.port = await server.listen(this.opts.port + i);
      } catch (e) {
        lastErr = e;
      }
    }
    if (this.port < 0) throw lastErr ?? new Error("no free port");
    this.check = setInterval(() => this.checkSilent(), this.opts.checkEveryMs);
    this.changed();
    return this.port;
  }

  get state(): HostView {
    return this.view;
  }

  get table(): TableInfo {
    return this.opts.table;
  }

  /** The game (host side), null before the deal. */
  get controller(): GameController | null {
    return this.game;
  }

  /** What the host's own table shows besides the game: presence, reactions
   *  (the same object until something changes). */
  get lan(): LanInfo | null {
    return this.hostLan;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Change the rules before the deal (guests see them in the lobby). */
  setTable(table: TableInfo): void {
    if (this.phase !== "lobby") return;
    this.opts.table = table;
    this.lobbyChanged();
  }

  // ---- lobby ----------------------------------------------------------------

  addSeat(): void {
    if (this.phase !== "lobby" || this.slots.length >= Math.min(this.opts.maxSeats, MAX_LAN_SEATS)) return;
    this.slots.push({ kind: "open" });
    this.lobbyChanged();
  }

  setBot(i: number, persona: PersonaId): void {
    const s = this.slots[i];
    if (this.phase !== "lobby" || !s || (s.kind !== "open" && s.kind !== "bot") || !personaById(persona)) return;
    this.slots[i] = { kind: "bot", persona };
    this.lobbyChanged();
  }

  setOpen(i: number): void {
    const s = this.slots[i];
    if (this.phase !== "lobby" || !s || s.kind !== "bot") return;
    this.slots[i] = { kind: "open" };
    this.lobbyChanged();
  }

  removeSeat(i: number): void {
    const s = this.slots[i];
    if (this.phase !== "lobby" || !s || (s.kind !== "open" && s.kind !== "bot")) return;
    this.slots.splice(i, 1);
    this.lobbyChanged();
  }

  /** Send a guest away (the seat stays, free). */
  remove(i: number): void {
    const s = this.slots[i];
    if (this.phase !== "lobby" || !s || s.kind !== "guest") return;
    const conn = s.guest.conn;
    this.slots[i] = { kind: "open" };
    if (conn) {
      this.sendTo(conn, { t: "closed", reason: "removed" });
      conn.close();
    }
    this.lobbyChanged();
  }

  get canStart(): boolean {
    return this.phase === "lobby" && this.slots.some((s) => s.kind === "guest" || s.kind === "bot");
  }

  /** The deal: free seats go away, the game starts. */
  start(): boolean {
    if (!this.canStart) return false;
    this.slots = this.slots.filter((s) => s.kind !== "open");
    const personas = this.slots.flatMap((s) => (s.kind === "bot" ? [s.persona] : []));
    const botNames = seatNames(personas);
    let b = 0;
    const seats: SeatSetup[] = this.slots.map((s, seat) => {
      if (s.kind === "host") return { kind: "human", name: this.opts.name };
      if (s.kind === "bot") return { kind: "bot", persona: s.persona, name: botNames[b++] };
      if (s.kind === "guest") {
        s.guest.seat = seat;
        return { kind: "remote", name: s.guest.name };
      }
      throw new Error("open seat at the deal");
    });
    const t = this.opts.table;
    const seed = this.opts.seed() >>> 0;
    const setup: GameSetup = {
      v: 1,
      rules: t.mode === "single" ? { ...t.rules, target: 1 } : t.rules,
      seats,
      seed,
      mode: t.mode,
      first: splitmix32(seed) % seats.length,
    };
    this.game = new GameController(setup, this.opts.deps);
    this.phase = "playing";
    this.game.subscribe(() => this.gameChanged());
    this.gameChanged();
    return true;
  }

  // ---- the game (host side) ---------------------------------------------------

  /** A quick reaction from the host. */
  react(text: ReactionText): void {
    if (this.game) this.reactFrom(this.game.me, text);
  }

  /** A bot plays an away guest's seat now. */
  botNow(seat: number): void {
    const g = this.guestAt(seat);
    if (g && !g.conn) this.takeOver(g);
  }

  /** Give an away guest another full wait. */
  waitLonger(seat: number): void {
    const g = this.guestAt(seat);
    if (g && !g.conn && !g.botted) this.startAway(g);
  }

  /** Close the table: everyone is told, every link closed. */
  close(): void {
    if (this.phase === "closed") return;
    this.phase = "closed";
    for (const c of this.peers) {
      this.sendTo(c, { t: "closed", reason: "host-left" });
      c.close();
    }
    this.peers.clear();
    for (const g of this.guests()) if (g.timer) clearTimeout(g.timer);
    if (this.check) clearInterval(this.check);
    if (this.moveTimer) clearTimeout(this.moveTimer);
    if (this.moveTick) clearInterval(this.moveTick);
    this.game?.dispose();
    this.opts.server.close();
    this.changed();
  }

  // ---- connections ----------------------------------------------------------

  private accept(conn: Conn): void {
    if (this.phase === "closed") return conn.close();
    this.peers.add(conn);
    const reader = new LineReader();
    let guest: Guest | null = null;
    conn.onData((chunk) => {
      const lines = reader.push(chunk);
      if (!lines) return conn.close(); // garbage: drop the link
      for (const line of lines) {
        const msg = parseGuestMsg(line);
        if (!msg) continue;
        // One seat per link: a second hello on it is ignored.
        if (msg.t === "hello") guest = guest ?? this.hello(conn, msg);
        else if (guest && guest.conn === conn) this.fromGuest(guest, msg);
      }
    });
    conn.onClose(() => {
      this.peers.delete(conn);
      if (guest && guest.conn === conn) this.dropped(guest);
    });
  }

  private hello(conn: Conn, msg: Extract<GuestMsg, { t: "hello" }>): Guest | null {
    if (msg.v !== PROTOCOL_VERSION) {
      this.sendTo(conn, { t: "refuse", reason: "version" });
      conn.close();
      return null;
    }
    // Back at the table (same token): the seat is theirs again.
    const known = msg.token ? this.guests().find((g) => g.token === msg.token) : undefined;
    if (known) {
      const old = known.conn;
      known.conn = conn;
      known.lastSeen = this.opts.now();
      if (old && old !== conn) old.close();
      if (known.timer) clearTimeout(known.timer);
      known.timer = null;
      known.deadline = null;
      this.sendTo(conn, { t: "welcome", v: PROTOCOL_VERSION, token: known.token, table: this.opts.table });
      if (this.phase === "playing" && this.game) {
        if (known.botted) {
          known.botted = false;
          this.game.restoreRemote(known.seat);
        }
        this.gameChanged();
      } else this.lobbyChanged();
      return known;
    }
    if (this.phase !== "lobby") {
      this.sendTo(conn, { t: "refuse", reason: this.phase === "closed" ? "closed" : "started" });
      conn.close();
      return null;
    }
    const free = this.slots.findIndex((s) => s.kind === "open");
    if (free < 0) {
      this.sendTo(conn, { t: "refuse", reason: "full" });
      conn.close();
      return null;
    }
    const guest: Guest = { name: msg.name, token: this.opts.token(), conn, lastSeen: this.opts.now(), seat: -1, botted: false, deadline: null, timer: null };
    this.slots[free] = { kind: "guest", guest };
    this.sendTo(conn, { t: "welcome", v: PROTOCOL_VERSION, token: guest.token, table: this.opts.table });
    this.lobbyChanged();
    return guest;
  }

  private fromGuest(g: Guest, msg: GuestMsg): void {
    g.lastSeen = this.opts.now();
    const conn = g.conn!;
    switch (msg.t) {
      case "ping":
        return this.sendTo(conn, { t: "pong" });
      case "leave":
        g.conn = null;
        conn.close();
        if (this.phase === "lobby") {
          const i = this.slots.findIndex((s) => s.kind === "guest" && s.guest === g);
          if (i >= 0) this.slots[i] = { kind: "open" };
          this.lobbyChanged();
        } else this.takeOver(g);
        return;
      case "react":
        if (this.phase === "playing" && !g.botted) this.reactFrom(g.seat, msg.text);
        return;
      case "move": {
        if (!this.game || g.botted) return;
        const err = this.game.act(g.seat, msg.action);
        if (err) {
          this.sendTo(conn, { t: "reject", code: err });
          this.sendState(g); // back to the true table
        }
        return;
      }
    }
  }

  private dropped(g: Guest): void {
    g.conn = null;
    if (this.phase === "lobby") {
      const i = this.slots.findIndex((s) => s.kind === "guest" && s.guest === g);
      if (i >= 0) this.slots[i] = { kind: "open" };
      this.lobbyChanged();
    } else if (this.phase === "playing" && !g.botted) {
      this.startAway(g);
      this.gameChanged();
    }
  }

  private startAway(g: Guest): void {
    if (g.timer) clearTimeout(g.timer);
    g.deadline = this.opts.now() + this.opts.awayMs;
    g.timer = setTimeout(() => this.takeOver(g), this.opts.awayMs);
    this.changed();
  }

  private takeOver(g: Guest): void {
    if (g.timer) clearTimeout(g.timer);
    g.timer = null;
    g.deadline = null;
    if (g.botted || !this.game) return;
    g.botted = true;
    this.game.replaceWithBot(g.seat, AWAY_BOT);
    this.gameChanged();
  }

  private checkSilent(): void {
    const now = this.opts.now();
    for (const g of this.guests()) if (g.conn && now - g.lastSeen > this.opts.silentMs) g.conn.close();
  }

  private reactFrom(seat: number, text: ReactionText): void {
    if (this.phase !== "playing") return;
    this.reaction = { seq: ++this.reactionSeq, seat, text };
    this.gameChanged();
  }

  /** A guest on the move gets MOVE_MS; then "Starczy" is said for them. */
  private watchMove(snap: GameSnapshot): void {
    const turn = snap.view.turn;
    const g = turn !== null ? this.guestAt(turn) : undefined;
    const active = !!g && !g.botted && (snap.phase === "othersTurn" || snap.phase === "bankTurn");
    const key = active ? `${snap.roundNo}:${turn}:${snap.seats[turn!].cards}` : "";
    if (key === this.moveKey) return;
    this.moveKey = key;
    if (this.moveTimer) clearTimeout(this.moveTimer);
    if (this.moveTick) clearInterval(this.moveTick);
    this.moveTimer = null;
    this.moveTick = null;
    this.moveDeadline = null;
    if (!active) return;
    this.moveDeadline = this.opts.now() + this.opts.moveMs;
    this.moveTick = setInterval(() => this.gameChanged(), 1000);
    this.moveTimer = setTimeout(() => {
      this.moveTimer = null;
      this.game?.act(turn!, "stand");
    }, this.opts.moveMs);
  }

  // ---- views and broadcasts ---------------------------------------------------

  private guests(): Guest[] {
    return this.slots.flatMap((s) => (s.kind === "guest" ? [s.guest] : []));
  }

  private guestAt(seat: number): Guest | undefined {
    return this.guests().find((g) => g.seat === seat);
  }

  private lanInfo(viewer: number): LanInfo {
    const game = this.game!;
    const seats = game.getSetup().seats;
    const presence: Presence[] = seats.map((s, seat) => {
      if (seat === viewer) return "here";
      if (s.kind === "bot") return this.guestAt(seat) ? "away" : "bot";
      if (seat === game.me) return "online";
      return this.guestAt(seat)?.conn ? "online" : "away";
    });
    const left = this.moveDeadline === null ? null : Math.max(0, Math.ceil((this.moveDeadline - this.opts.now()) / 1000));
    return { presence, reaction: this.reaction, moveDeadline: left };
  }

  private sendState(g: Guest): void {
    const game = this.game;
    if (!game || !g.conn || g.botted) return;
    this.sendTo(g.conn, { t: "state", snap: game.snapshotFor(g.seat), lan: this.lanInfo(g.seat) });
  }

  private gameChanged(): void {
    const game = this.game;
    if (!game || this.phase !== "playing") return;
    this.watchMove(game.getSnapshot());
    for (const g of this.guests()) this.sendState(g);
    this.changed();
  }

  private lobbySlots(): LobbySlot[] {
    const personas = this.slots.flatMap((s) => (s.kind === "bot" ? [s.persona] : []));
    const names = seatNames(personas);
    let b = 0;
    return this.slots.map((s): LobbySlot => {
      switch (s.kind) {
        case "host":
          return { kind: "host", name: this.opts.name };
        case "open":
          return { kind: "open" };
        case "bot":
          return { kind: "bot", name: names[b++], persona: s.persona };
        case "guest":
          return { kind: "guest", name: s.guest.name, online: !!s.guest.conn };
      }
    });
  }

  private lobbyChanged(): void {
    if (this.phase !== "lobby") return;
    const slots = this.lobbySlots();
    this.slots.forEach((s, you) => {
      if (s.kind === "guest" && s.guest.conn) this.sendTo(s.guest.conn, { t: "lobby", slots, you, table: this.opts.table });
    });
    this.changed();
  }

  private buildView(): HostView {
    const now = this.opts.now();
    return {
      phase: this.phase,
      port: this.port,
      slots: this.lobbySlots(),
      maxSeats: Math.min(this.opts.maxSeats, MAX_LAN_SEATS),
      away: this.guests().flatMap((g) =>
        !g.conn && !g.botted && g.deadline !== null && g.seat >= 0 ? [{ seat: g.seat, name: g.name, deadline: Math.max(now, g.deadline) }] : []
      ),
    };
  }

  private changed(): void {
    this.view = this.buildView();
    this.hostLan = this.game && this.phase === "playing" ? this.lanInfo(this.game.me) : null;
    for (const fn of this.listeners) fn();
  }

  private sendTo(conn: Conn, msg: HostMsg): void {
    try {
      conn.send(encode(msg));
    } catch {
      conn.close();
    }
  }
}
