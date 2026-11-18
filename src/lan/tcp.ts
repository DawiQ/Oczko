// TCP for the Wi-Fi table (react-native-tcp-socket): the host listens, guests
// connect. Text in UTF-8; the protocol frames it in lines.
import TcpSocket from "react-native-tcp-socket";

import type { Conn, Dialer, Server } from "./transport";
import { Utf8Stream } from "./utf8";

type Socket = ReturnType<typeof TcpSocket.createConnection>;

const CONNECT_TIMEOUT_MS = 5_000;

/** How long a closing link waits for its last messages to go out. */
const FLUSH_MS = 1_000;

function wrap(socket: Socket): Conn {
  let closed = false;
  let pending = 0;
  let flushed: (() => void) | null = null;
  const closeFns: (() => void)[] = [];
  const closeOnce = () => {
    if (closed) return;
    closed = true;
    for (const fn of closeFns) fn();
  };
  const utf8 = new Utf8Stream();
  socket.setNoDelay(true);
  socket.setKeepAlive(true, 5_000);
  socket.on("close", closeOnce);
  socket.on("error", () => {
    socket.destroy();
    closeOnce();
  });
  return {
    send: (text) => {
      if (closed) return;
      pending++;
      socket.write(text, "utf8", () => {
        pending--;
        if (pending === 0) flushed?.();
      });
    },
    // The last messages (a refusal, "closed", "leave") go out before the link ends.
    close: () => {
      if (closed) return;
      let ended = false;
      const end = () => {
        if (ended) return;
        ended = true;
        socket.destroy();
      };
      if (pending === 0) end();
      else {
        flushed = end;
        setTimeout(end, FLUSH_MS);
      }
      closeOnce();
    },
    onData: (fn) => {
      socket.on("data", (d) => fn(typeof d === "string" ? d : utf8.push(d)));
    },
    onClose: (fn) => {
      closeFns.push(fn);
    },
  };
}

export function tcpServer(): Server {
  let onConn: (c: Conn) => void = () => {};
  const server = TcpSocket.createServer((socket) => onConn(wrap(socket)));
  // An error once listening (the network went away) must not crash the app;
  // the guests notice and reconnect.
  server.on("error", () => {});
  return {
    listen: (port) =>
      new Promise<number>((resolve, reject) => {
        const fail = (e: Error) => reject(e);
        server.once("error", fail);
        server.listen({ port, host: "0.0.0.0", reuseAddress: true }, () => {
          server.off("error", fail);
          const a = server.address();
          resolve(a && "port" in a ? a.port : port);
        });
      }),
    onConnection: (fn) => {
      onConn = fn;
    },
    close: () => {
      server.close();
    },
  };
}

export const tcpDial: Dialer = (host, port) =>
  new Promise<Conn>((resolve, reject) => {
    let done = false;
    const socket = TcpSocket.createConnection(
      { host, port, connectTimeout: CONNECT_TIMEOUT_MS },
      () => {
        if (done) return;
        done = true;
        socket.off("error", fail);
        resolve(wrap(socket));
      }
    );
    const fail = (e: Error) => {
      if (done) return;
      done = true;
      socket.destroy();
      reject(e);
    };
    socket.once("error", fail);
  });
