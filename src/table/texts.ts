// Words of the table: statuses, the live caption (screen readers), the
// round's headline. Pure; the texts come from the dictionary (`s`).
import type { RoundEvent } from "../engine/round";
import type { GameSnapshot, SeatInfo } from "../game/TableGame";
import { pl, type Strings } from "../i18n/pl";
import { rankSpoken } from "../ui/cards";

/** The short label under a seat ("Starczy", "Fura!"…), or null. */
export function statusLabel(seat: SeatInfo, s: Strings = pl): string | null {
  const t = s.table.status;
  if (seat.thinking) return t.thinking;
  if (seat.persian) return t.persian;
  switch (seat.status) {
    case "stood":
      return t.stood;
    case "bust":
      return t.bust;
    case "maxed":
      return t.maxed;
    case "playing":
      return t.playing;
    default:
      return null;
  }
}

const nameOf = (snap: GameSnapshot, seat: number) => snap.seats[seat]?.name ?? "";

function handIn(words: Strings["table"]["hand"], seat: SeatInfo): string {
  if (!seat.value) return words.cards(seat.name, seat.cards);
  if (seat.value.persian) return words.persian(seat.name);
  if (seat.value.bust) return words.bust(seat.name, seat.value.total);
  return words.total(seat.name, seat.value.total);
}

/** "Ola: 19", "Hela: fura (24)", "Kuba: perskie oczko". */
export const handText = (seat: SeatInfo, s: Strings = pl): string => handIn(s.table.hand, seat);

/** One event in words, from the person's point of view. */
export function eventText(e: RoundEvent, snap: GameSnapshot, s: Strings = pl): string | null {
  const me = snap.me;
  const total = snap.view.myValue.total;
  const t = s.table.event;
  switch (e.t) {
    case "deal":
      return null;
    case "hit":
      if (e.seat === me && e.card !== undefined) return t.myHit(rankSpoken(e.card, s), total);
      return t.hit(nameOf(snap, e.seat));
    case "stand":
      return e.seat === me ? t.myStand(total) : t.stand(nameOf(snap, e.seat));
    case "bust":
      return e.seat === me ? t.myBust(total) : t.bust(nameOf(snap, e.seat));
    case "persian":
      return e.seat === me ? t.myPersian : t.persian(nameOf(snap, e.seat));
    case "maxed":
      return e.seat === me ? t.myMaxed : t.maxed(nameOf(snap, e.seat));
    case "reveal": {
      const seat = snap.seats[e.seat];
      return seat ? handIn(s.table.reveal, seat) : null;
    }
    case "result":
      return headline(snap, s).title;
  }
}

/** The live caption under the table (also read by screen readers). */
export function caption(snap: GameSnapshot, s: Strings = pl): string {
  const t = s.table.caption;
  if (snap.phase === "roundEnd" || snap.phase === "matchEnd") return headline(snap, s).title;
  if (snap.phase === "dealing") return snap.rules.mode === "bank" ? t.dealingBank(nameOf(snap, snap.view.bank!)) : t.dealing;
  const thinking = snap.seats.find((x) => x.thinking);
  const lastEvent = snap.lastEvents.length ? snap.lastEvents[snap.lastEvents.length - 1].event : null;
  const last = lastEvent ? eventText(lastEvent, snap, s) : null;
  if (snap.phase === "myTurn") {
    const turn = snap.view.myValue.total === 21 ? t.at21 : t.myTurn(snap.view.myValue.total);
    // My own new card already tells my total: no turn line after it.
    const myCard = lastEvent?.t === "hit" && lastEvent.seat === snap.me && lastEvent.card !== undefined;
    return last && !myCard ? t.then(last, turn) : last ?? turn;
  }
  if (thinking) return t.thinking(thinking.name);
  return last ?? (snap.phase === "showdown" ? t.showdown : "");
}

/** The round's (or match's) outcome: a title and a line under it. */
export function headline(snap: GameSnapshot, s: Strings = pl): { title: string; sub: string } {
  const t = s.table.headline;
  const r = snap.result;
  if (!r) return { title: "", sub: "" };
  const me = snap.me;
  if (snap.phase === "matchEnd" && snap.winner !== null) {
    const title = snap.winner === me ? t.matchMine : t.matchWon(nameOf(snap, snap.winner));
    return { title, sub: t.matchSub(snap.scores[snap.winner], snap.roundNo) };
  }
  if (r.duels) {
    const bank = snap.view.bank!;
    const won = r.duels.filter((d) => d.winner === "bank").length;
    const bankLine = t.bankLine(won, r.duels.length);
    if (me === bank) return { title: r.points[me] > 0 ? t.bankPoint(r.points[me]) : t.bankNoPoint, sub: bankLine };
    const mine = r.duels.find((d) => d.seat === me)!;
    const title = mine.winner === "player" ? t.duelWon : mine.winner === "bank" ? t.duelLost : t.duelDraw;
    return { title, sub: bankLine };
  }
  const winners = r.points.flatMap((p, i) => (p > 0 ? [i] : []));
  const values = r.values;
  if (winners.length === 0) {
    const allBust = values.every((v) => v.bust);
    return { title: t.nobody, sub: allBust ? t.allBust : t.draw };
  }
  const best = values[winners[0]];
  const how = best.persian ? t.persian : `${best.total}`;
  if (winners.length === 1 && winners[0] === me) return { title: t.mine, sub: t.mineSub(how) };
  const names = winners.map((w) => (w === me ? s.common.you : nameOf(snap, w)));
  return winners.length === 1 ? { title: t.one(names[0]), sub: t.oneSub(names[0], how) } : { title: t.many(names), sub: t.tieSub(how) };
}
