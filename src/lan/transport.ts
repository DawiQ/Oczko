// The connection a Wi-Fi table runs over, behind a small interface: TCP on the
// phones (src/lan/tcp.ts), an in-memory pair in the tests.

/** One open connection (text in, text out — framing is the protocol's). */
export interface Conn {
  send(text: string): void;
  close(): void;
  onData(fn: (chunk: string) => void): void;
  /** Called once, when either side closes or the link breaks. */
  onClose(fn: () => void): void;
}

/** The host's listening side. */
export interface Server {
  /** Starts listening; resolves with the port actually used. */
  listen(port: number): Promise<number>;
  onConnection(fn: (conn: Conn) => void): void;
  close(): void;
}

/** A guest's way to reach a host. */
export type Dialer = (host: string, port: number) => Promise<Conn>;

// ---- in memory (tests) -------------------------------------------------------

class MemoryConn implements Conn {
  peer: MemoryConn | null = null;
  private dataFns: ((c: string) => void)[] = [];
  private closeFns: (() => void)[] = [];
  private closed = false;
  send(text: string): void {
    if (this.closed || !this.peer) return;
    const peer = this.peer;
    // Asynchronous, like a real socket.
    void Promise.resolve().then(() => peer.deliver(text));
  }
  private deliver(text: string): void {
    if (!this.closed) for (const fn of this.dataFns) fn(text);
  }
  close(): void {
    if (this.closed) return;
    this.closed = true;
    const peer = this.peer;
    void Promise.resolve().then(() => {
      for (const fn of this.closeFns) fn();
      peer?.close();
    });
  }
  onData(fn: (c: string) => void): void {
    this.dataFns.push(fn);
  }
  onClose(fn: () => void): void {
    this.closeFns.push(fn);
  }
}

/** A network in memory: one server per port; dialing connects to it. */
export class MemoryNet {
  private servers = new Map<number, (c: Conn) => void>();
  /** Every connection opened, guest side (tests drop links with it). */
  readonly links: Conn[] = [];

  server(): Server {
    let onConn: (c: Conn) => void = () => {};
    let port = -1;
    return {
      listen: async (p: number) => {
        port = p;
        this.servers.set(p, (c) => onConn(c));
        return p;
      },
      onConnection: (fn) => {
        onConn = fn;
      },
      close: () => {
        this.servers.delete(port);
      },
    };
  }

  dialer(): Dialer {
    return async (_host: string, port: number) => {
      const accept = this.servers.get(port);
      if (!accept) throw new Error("connection refused");
      const a = new MemoryConn();
      const b = new MemoryConn();
      a.peer = b;
      b.peer = a;
      this.links.push(a);
      accept(b);
      return a;
    };
  }
}
