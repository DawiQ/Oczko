// Words of the table: statuses, the live caption (screen readers), the
// round's headline. Pure; gender-neutral (no "dobrałeś/dobrałaś").
import type { RoundEvent } from "../engine/round";
import type { GameSnapshot, SeatInfo } from "../game/TableGame";
import { rankSpoken } from "../ui/cards";
import { plural } from "../ui/plural";

/** The short label under a seat ("Starczy", "Fura!"…), or null. */
export function statusLabel(seat: SeatInfo): string | null {
  if (seat.thinking) return "myśli…";
  if (seat.persian) return "Perskie oczko!";
  switch (seat.status) {
    case "stood":
      return "Starczy";
    case "bust":
      return "Fura!";
    case "maxed":
      return "Komplet kart";
    case "playing":
      return "na ruchu";
    default:
      return null;
  }
}

const nameOf = (s: GameSnapshot, seat: number) => s.seats[seat]?.name ?? "";

/** "Ola: 19", "Hela: fura (24)", "Kuba: perskie oczko". */
export function handText(seat: SeatInfo): string {
  if (!seat.value) return `${seat.name}: ${seat.cards} ${plural(seat.cards, "karta", "karty", "kart")}`;
  if (seat.value.persian) return `${seat.name}: perskie oczko`;
  if (seat.value.bust) return `${seat.name}: fura (${seat.value.total})`;
  return `${seat.name}: ${seat.value.total}`;
}

/** One event in words, from the person's point of view. */
export function eventText(e: RoundEvent, s: GameSnapshot): string | null {
  const me = s.me;
  const total = s.view.myValue.total;
  switch (e.t) {
    case "deal":
      return null;
    case "hit":
      if (e.seat === me && e.card !== undefined) return `Dobrana karta: ${rankSpoken(e.card)}. Masz ${total}`;
      return `${nameOf(s, e.seat)} dobiera kartę`;
    case "stand":
      return e.seat === me ? `Starczy przy ${total}` : `${nameOf(s, e.seat)}: Starczy`;
    case "bust":
      return e.seat === me ? `Fura! Masz ${total}` : `${nameOf(s, e.seat)}: Fura!`;
    case "persian":
      return e.seat === me ? "Perskie oczko!" : `${nameOf(s, e.seat)}: Perskie oczko!`;
    case "maxed":
      return e.seat === me ? "Komplet kart — koniec dobierania" : `${nameOf(s, e.seat)}: komplet kart`;
    case "reveal": {
      const seat = s.seats[e.seat];
      return seat ? handText(seat).replace(":", " ma").replace(" ma fura", " ma furę") : null;
    }
    case "result":
      return headline(s).title;
  }
}

/** The live caption under the table (also read by screen readers). */
export function caption(s: GameSnapshot): string {
  if (s.phase === "roundEnd" || s.phase === "matchEnd") return headline(s).title;
  if (s.phase === "dealing") return s.rules.mode === "bank" ? `Rozdanie · bank: ${nameOf(s, s.view.bank!)}` : "Rozdanie";
  const thinking = s.seats.find((x) => x.thinking);
  const last = s.lastEvents.length ? eventText(s.lastEvents[s.lastEvents.length - 1].event, s) : null;
  if (s.phase === "myTurn") {
    const turn = s.view.myValue.total === 21 ? "Masz 21 — Starczy?" : `Twój ruch · masz ${s.view.myValue.total}`;
    return last && !last.startsWith("Dobrana") ? `${last} · ${turn}` : last ?? turn;
  }
  if (thinking) return `${thinking.name} myśli…`;
  return last ?? (s.phase === "showdown" ? "Odsłanianie kart" : "");
}

const list = (names: string[]) => names.join(", ");

/** The round's (or match's) outcome: a title and a line under it. */
export function headline(s: GameSnapshot): { title: string; sub: string } {
  const r = s.result;
  if (!r) return { title: "", sub: "" };
  const me = s.me;
  if (s.phase === "matchEnd" && s.winner !== null) {
    const title = s.winner === me ? "Partia dla Ciebie!" : `Partię wygrywa ${nameOf(s, s.winner)}`;
    return { title, sub: `${s.scores[s.winner]} ${plural(s.scores[s.winner], "punkt", "punkty", "punktów")} · ${s.roundNo} ${plural(s.roundNo, "runda", "rundy", "rund")}` };
  }
  if (r.duels) {
    const bank = s.view.bank!;
    const won = r.duels.filter((d) => d.winner === "bank").length;
    const n = r.duels.length;
    const bankLine = `Bank wygrywa ${won} z ${n} ${plural(n, "pojedynku", "pojedynków", "pojedynków")}`;
    if (me === bank) return { title: r.points[me] > 0 ? `Punkt dla banku (+${r.points[me]})` : "Bank bez punktu", sub: bankLine };
    const mine = r.duels.find((d) => d.seat === me)!;
    const title = mine.winner === "player" ? "Wygrany pojedynek z bankiem" : mine.winner === "bank" ? "Pojedynek dla banku" : "Pojedynek bez rozstrzygnięcia";
    return { title, sub: bankLine };
  }
  const winners = r.points.flatMap((p, i) => (p > 0 ? [i] : []));
  const values = r.values;
  if (winners.length === 0) {
    const allBust = values.every((v) => v.bust);
    return { title: "Nikt nie punktuje", sub: allBust ? "Wszyscy mają furę" : "Remis — bez punktów" };
  }
  const best = values[winners[0]];
  const how = best.persian ? "perskie oczko" : `${best.total}`;
  if (winners.length === 1 && winners[0] === me) return { title: "Punkt dla Ciebie", sub: `Najbliżej 21: Ty z ${how}` };
  const names = winners.map((w) => (w === me ? "Ty" : nameOf(s, w)));
  return winners.length === 1
    ? { title: `Punkt dla: ${names[0]}`, sub: `Najbliżej 21: ${names[0]} z ${how}` }
    : { title: `Punkty dla: ${list(names)}`, sub: `Remis przy ${how}` };
}
