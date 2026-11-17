// The Wi‑Fi table on an in-memory network: a host and three guests play a
// whole match; nobody ever gets another seat's face-down cards; a guest drops
// out (a bot plays for them) and comes back; the result equals a local replay
// of the same decisions.
import { threshold } from "../../ai/policies";
import { DEFAULT_RULES, PRESETS, type Rules } from "../../engine/rules";
import { ENGINE_VERSION } from "../../engine/version";
import { INSTANT } from "../../game/pace";
import type { GameSnapshot } from "../../game/TableGame";
import { replayMatches, type HistoryRecord } from "../../history/record";
import { parseJoinLink, parseTableCode, joinLink, tableCode } from "../code";
import { adToTxt, txtToAd } from "../discovery";
import { LanGuest } from "../guest";
import { LanHost } from "../host";
import { cleanName, encode, LineReader, parseGuestMsg, parseHostMsg, PROTOCOL_VERSION } from "../protocol";
import { MemoryNet } from "../transport";

jest.setTimeout(60000);

const flush = async (n = 20) => {
  for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0));
};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function makeHost(net: MemoryNet, rules: Rules, extra: Partial<ConstructorParameters<typeof LanHost>[0]> = {}) {
  return new LanHost({
    name: "Ola",
    table: { name: "Stół Oli", rules, mode: "match" },
    server: net.server(),
    deps: { sleep: () => Promise.resolve(), pace: INSTANT, decide: async (_s, v, r) => threshold(17)(v, r) },
    checkEveryMs: 1_000_000,
    moveMs: 1_000_000,
    awayMs: 40,
    seed: () => 4242,
    maxSeats: 8,
    ...extra,
  });
}

function makeGuest(net: MemoryNet, port: number, name: string, retryMs = 5) {
  return new LanGuest({ dial: net.dialer(), host: "192.168.1.2", port, name, retryMs, pingEveryMs: 1_000_000 });
}

/** Nothing in a guest's snapshot reveals another seat's face-down cards. */
function checkHidden(s: GameSnapshot): void {
  const open = s.phase === "showdown" || s.phase === "roundEnd" || s.phase === "matchEnd";
  for (const seat of s.seats) {
    if (seat.seat === s.me || !seat.hand) continue;
    // Shown before the end only as an announced fura (bustRevealed).
    expect(open || seat.status === "bust").toBe(true);
  }
  for (const { event } of s.lastEvents) if (event.t === "hit" && event.seat !== s.me) expect(event.card).toBeUndefined();
  for (const o of s.view.others) if (o.hand) expect(s.seats[o.seat].hand).toEqual(o.hand);
  expect(JSON.stringify(s)).not.toMatch(/"(stock|seed|seedBase|hands)"/);
}

describe("Wi‑Fi table", () => {
  it.each([
    ["family", { ...DEFAULT_RULES, target: 4 }],
    ["bank", { ...PRESETS.bank, target: 3 }],
  ] as const)("host + 3 guests play a %s match; drop-out and return; same as a local replay", async (_n, rules) => {
    const net = new MemoryNet();
    const host = makeHost(net, rules);
    const port = await host.open();
    host.addSeat();
    host.addSeat();
    const guests = [makeGuest(net, port, "Kuba"), makeGuest(net, port, "Hela", 200), makeGuest(net, port, "Witek")];
    const seen: GameSnapshot[] = [];
    for (const g of guests) {
      g.subscribe(() => g.snapshot && seen.push(g.snapshot));
      await g.connect();
    }
    await flush();
    expect(host.state.slots.map((s) => s.kind)).toEqual(["host", "guest", "guest", "guest"]);
    expect(guests[0].state.phase).toBe("lobby");
    expect(host.start()).toBe(true);
    await flush();
    expect(guests.every((g) => g.state.phase === "playing")).toBe(true);

    const ctrl = host.controller!;
    let dropped = false;
    let back = false;
    for (let step = 0; step < 5000; step++) {
      await ctrl.idle();
      await flush(3);
      const hs = ctrl.getSnapshot();
      if (hs.phase === "matchEnd") break;
      if (hs.phase === "roundEnd") {
        // After the first round: Hela's Wi‑Fi drops; a bot takes over; she comes back.
        if (!dropped) {
          dropped = true;
          guests[1].dropLink();
          await flush();
          expect(host.state.away.map((a) => a.name)).toEqual(["Hela"]);
          await wait(80); // longer than awayMs, shorter than her retry
          expect(ctrl.getSetup().seats[2].kind).toBe("bot");
          expect(host.lan!.presence[2]).toBe("away");
        } else if (!back) {
          await wait(250); // her retry reconnects with the token
          await flush();
          back = true;
          expect(ctrl.getSetup().seats[2].kind).toBe("remote");
          expect(guests[1].state.offline).toBe(false);
        }
        expect(ctrl.nextRound()).toBeNull();
        continue;
      }
      if (hs.phase === "myTurn") {
        expect((hs.view.myValue.total < 16 ? ctrl.hit : ctrl.stand)()).toBeNull();
        continue;
      }
      let moved = false;
      for (const g of guests) {
        const s = g.snapshot;
        if (s?.phase === "myTurn" && s.view.turn === s.me) {
          expect(s.view.myValue.total < 17 ? g.game.hit() : g.game.stand()).toBeNull();
          moved = true;
          break;
        }
      }
      if (!moved) await flush(5);
    }
    const end = ctrl.getSnapshot();
    expect(end.phase).toBe("matchEnd");
    expect(back).toBe(true);
    await flush();
    // Every guest ends on the same scores as the host.
    for (const g of guests) expect(g.snapshot!.scores).toEqual(end.scores);
    // Nobody saw a face-down card of someone else.
    expect(seen.length).toBeGreaterThan(30);
    for (const s of seen) checkHidden(s);
    // The same decisions replayed locally give the same match.
    const saved = ctrl.saved();
    const rec: HistoryRecord = {
      v: 1,
      engineVersion: ENGINE_VERSION,
      id: "lan",
      date: 0,
      setup: saved.setup,
      me: 0,
      decisions: saved.decisions,
      scores: saved.match.scores,
      winner: saved.match.winner,
      rounds: saved.match.roundNo,
    };
    expect(replayMatches(rec)).toBe(true);
    host.close();
    await flush();
    expect(guests[0].state.phase).toBe("closed");
  });

  it("refuses a guest when the table is full, started, or another version", async () => {
    const net = new MemoryNet();
    const host = makeHost(net, DEFAULT_RULES);
    const port = await host.open();
    const a = makeGuest(net, port, "Kuba");
    await a.connect();
    const b = makeGuest(net, port, "Hela");
    await b.connect();
    await flush();
    expect(b.state.refused).toBe("full");
    host.addSeat();
    host.setBot(2, "hrabia");
    host.start();
    const c = makeGuest(net, port, "Witek");
    await c.connect();
    await flush();
    expect(c.state.refused).toBe("started");
    // A wrong version is refused before anything else.
    const conn = await net.dialer()("x", port);
    const got: string[] = [];
    conn.onData((d) => got.push(d));
    conn.send(encode({ t: "hello", v: PROTOCOL_VERSION + 1, name: "X" }));
    await flush();
    expect(got.join("")).toContain('"reason":"version"');
    host.close();
  });

  it("says 'Starczy' for a guest who does not move in time", async () => {
    const net = new MemoryNet();
    const host = makeHost(net, { ...DEFAULT_RULES, target: 9 }, { moveMs: 30, seed: () => 7 });
    const port = await host.open();
    const g = makeGuest(net, port, "Kuba");
    await g.connect();
    await flush();
    host.start();
    const ctrl = host.controller!;
    for (let i = 0; i < 50; i++) {
      await ctrl.idle();
      await flush(3);
      const s = ctrl.getSnapshot();
      if (s.phase === "myTurn") ctrl.stand();
      else if (s.phase === "roundEnd" || s.phase === "matchEnd") break;
      else await wait(40); // the guest never moves
    }
    expect(["roundEnd", "matchEnd"]).toContain(ctrl.getSnapshot().phase);
    const guestSeat = ctrl.getSetup().seats.findIndex((s) => s.kind === "remote");
    expect(ctrl.saved().decisions.some((d) => d.seat === guestSeat && d.action === "stand")).toBe(true);
    host.close();
  });
});

describe("protocol parsing", () => {
  it("cleans names and drops malformed messages", () => {
    expect(cleanName("  Ola​\u0007 ")).toBe("Ola");
    expect(cleanName("x".repeat(40))).toHaveLength(16);
    expect(cleanName(42)).toBe("Gość");
    expect(parseGuestMsg('{"t":"move","action":"hit"}')).toEqual({ t: "move", action: "hit" });
    expect(parseGuestMsg('{"t":"move","action":"double"}')).toBeNull();
    expect(parseGuestMsg('{"t":"react","text":"Gratulacje!!!"}')).toBeNull();
    expect(parseGuestMsg("not json")).toBeNull();
    expect(parseHostMsg('{"t":"state","snap":{"phase":"myTurn"},"lan":{}}')).toBeNull();
    expect(parseHostMsg('{"t":"closed","reason":"bye"}')).toBeNull();
  });

  it("splits a stream into lines and refuses huge ones", () => {
    const r = new LineReader();
    expect(r.push('{"t":"pi')).toEqual([]);
    expect(r.push('ng"}\n{"t":"ping"}\n')).toEqual(['{"t":"ping"}', '{"t":"ping"}']);
    expect(new LineReader().push("x".repeat(200_000))).toBeNull();
  });

  it("table code, QR link and the mDNS record round-trip", () => {
    const code = tableCode("192.168.7.33", 47677)!;
    expect(code).toMatch(/^[0-9A-Z]{2} [0-9A-Z]{2}$/);
    expect(parseTableCode(code, "192.168.7.90")).toEqual({ host: "192.168.7.33", port: 47677 });
    expect(parseJoinLink(joinLink("10.0.0.5", 47676))).toMatchObject({ host: "10.0.0.5", port: 47676 });
    expect(parseJoinLink("pan://stol?h=1.2.3.4&p=1")).toBeNull();
    const ad = { open: 2, seats: 4, playing: false, mode: "bank" as const, target: 10 };
    expect(txtToAd(adToTxt(ad))).toEqual(ad);
    expect(txtToAd({ ...adToTxt(ad), v: "99" })).toBeNull();
  });
});
