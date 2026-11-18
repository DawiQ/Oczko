// Statistics of the rules from bot simulations → docs/STATS.md:
//   npm run stats
// - draws per hand, share of furas, bank advantage (per preset),
// - fairness of the bank game: match wins per seat with equal bots,
// - running out of cards (P(empty stock)) per deck and number of seats,
// - match length to 10 points in minutes at the normal pace,
// - the evaluator's speed (Node).
import fs from "fs";
import path from "path";

import { evaluate } from "../src/ai/evaluate";
import { threshold, type Policy } from "../src/ai/policies";
import { playMatch, playRound } from "../src/ai/simulate";
import { matchApply, newMatch } from "../src/engine/match";
import { makeDeck, type Card } from "../src/engine/cards";
import { shuffle, splitmix32 } from "../src/engine/rng";
import { handValue } from "../src/engine/score";
import { withPreset } from "../src/engine/presets";
import { DEFAULT_RULES, MAX_SEATS, PRESETS, type Rules } from "../src/engine/rules";
import { viewFor } from "../src/engine/view";

const ROOT = path.join(__dirname, "..");
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const num = (x: number, d = 2) => x.toFixed(d).replace(".", ",");
const t17 = threshold(17);
const mixed = (seats: number): Policy[] => Array.from({ length: seats }, (_, i) => threshold([15, 17, 19, 16, 18][i % 5]));

// --- 1. Rounds per preset ------------------------------------------------------

function roundStats(rules: Rules, seats: number, policies: Policy[], N: number) {
  let draws = 0;
  let hands = 0;
  let busts = 0;
  let bankDuelsWon = 0;
  let duels = 0;
  let bankPoints = 0;
  let decisions = 0;
  for (let i = 0; i < N; i++) {
    const seed = splitmix32(i + 1_000_000);
    const r = playRound(rules, policies, seed, i % seats, { state: seed });
    const round = r.match.round;
    decisions += r.decisions;
    round.hands.forEach((h) => {
      draws += h.length - rules.startCards;
      hands++;
    });
    busts += round.result!.values.filter((v) => v.bust).length;
    if (round.result!.duels) {
      duels += round.result!.duels.length;
      bankDuelsWon += round.result!.duels.filter((d) => d.winner === "bank").length;
      bankPoints += round.result!.points[round.bank!];
    }
  }
  return {
    draws: draws / hands,
    bust: busts / hands,
    bankDuel: duels ? bankDuelsWon / duels : null,
    bankPoint: duels ? bankPoints / N : null,
    decisions: decisions / N,
  };
}

const presetRows: string[] = [];
for (const [name, rules, seats] of [
  ["Rodzinne (52)", PRESETS.family, 4],
  ["Rodzinne (52)", PRESETS.family, 6],
  ["Z bankierem (52)", PRESETS.bank, 4],
  ["Z bankierem (52)", PRESETS.bank, 2],
  ["Rodzinne (24 karty)", PRESETS.small24, 4],
  ["Rodzinne, 2 karty na start", { ...PRESETS.family, startCards: 2 } as Rules, 4],
  // Regional rule sets (PLAN.md §13); Ajnc has the cards of 17 und 4.
  ["17 und 4 / Ajnc (32, z bankierem)", withPreset(DEFAULT_RULES, "siebzehnUndVier"), 4],
  ["Oko bere (32, 1 · 1 · 2, dwa asy = 21)", withPreset(DEFAULT_RULES, "okoBere"), 4],
] as const) {
  const s = roundStats(rules, seats, mixed(seats), 20000);
  presetRows.push(
    `| ${name} | ${seats} | ${num(s.draws)} | ${pct(s.bust)} | ${s.bankDuel === null ? "—" : pct(s.bankDuel)} | ${s.bankPoint === null ? "—" : pct(s.bankPoint)} |`
  );
  console.log("preset", name, seats);
}

// --- 2. Fairness of the bank game ---------------------------------------------

function seatShares(rules: Rules, seats: number, M: number): number[] {
  const wins = new Array(seats).fill(0);
  for (let i = 0; i < M; i++) {
    const seed = splitmix32(i + 2_000_000);
    const r = playMatch(rules, new Array(seats).fill(t17), seed, i % seats, { state: seed });
    wins[r.match.winner!]++;
  }
  return wins.map((w) => w / M);
}

const fairRows: string[] = [];
let fairOk = true;
for (const scoring of ["majority", "perDuel"] as const)
  for (const seats of [2, 3, 4, 6]) {
    const shares = seatShares({ ...PRESETS.bank, bankScoring: scoring }, seats, 3000);
    const dev = Math.max(...shares.map((s) => Math.abs(s - 1 / seats)));
    if (scoring === "majority" && dev > 0.03) fairOk = false;
    fairRows.push(`| ${scoring} | ${seats} | ${shares.map((s) => pct(s)).join(" / ")} | ${pct(1 / seats)} | ${(dev * 100).toFixed(1)} pp |`);
    console.log("fair", scoring, seats);
  }

// Who wins a bank-mode duel round, and how fast a match goes, per scoring.
function bankRoundsToWin(scoring: Rules["bankScoring"], seats: number): number {
  let rounds = 0;
  const M = 1500;
  for (let i = 0; i < M; i++) {
    const seed = splitmix32(i + 3_000_000);
    rounds += playMatch({ ...PRESETS.bank, bankScoring: scoring }, new Array(seats).fill(t17), seed, 0, { state: seed }).rounds;
  }
  return rounds / M;
}

// --- 3. Running out of cards ----------------------------------------------------

/** Plain simulation (no seat limit): everyone draws to `stopAt` in turn. */
function emptyStock(rules: Rules, seats: number, stopAt: number, N: number): number {
  let empty = 0;
  for (let i = 0; i < N; i++) {
    const stock = shuffle(makeDeck(rules.deck), splitmix32(i + 4_000_000));
    const hands: Card[][] = Array.from({ length: seats }, () => []);
    for (let k = 0; k < rules.startCards; k++) for (const h of hands) h.push(stock.shift()!);
    let out = false;
    for (const h of hands) {
      for (;;) {
        const v = handValue(h, rules);
        if (v.persian || v.bust || v.total >= stopAt) break;
        const c = stock.shift();
        if (c === undefined) {
          out = true;
          break;
        }
        h.push(c);
      }
    }
    if (out || stock.length === 0) empty++;
  }
  return empty / N;
}

const stockRows: string[] = [];
for (const deck of [24, 32, 52] as const) {
  const rules: Rules = { ...DEFAULT_RULES, deck, startCards: 2 };
  const cells: string[] = [];
  for (let seats = 2; seats <= 8; seats++) {
    const p = emptyStock(rules, seats, 20, 20000);
    cells.push(`${seats}: ${pct(p, 2)}${seats > MAX_SEATS[deck] ? " (ponad limit)" : ""}`);
  }
  stockRows.push(`| ${deck} | ${MAX_SEATS[deck]} | ${cells.join(", ")} |`);
  console.log("stock", deck);
}

// --- 4. Match length ------------------------------------------------------------

// Normal pace (PLAN.md §6): a bot decides in 0.8 s; a person in about 2 s;
// dealing ~2 s, showing the hands 0.4 s per seat, the round-end screen ~3 s.
const PACE = { deal: 2, bot: 0.8, human: 2, revealPerSeat: 0.4, result: 3 };

function matchLength(rules: Rules, seats: number) {
  const M = 1500;
  let rounds = 0;
  let seconds = 0;
  for (let i = 0; i < M; i++) {
    const seed = splitmix32(i + 5_000_000);
    const r = playMatch(rules, mixed(seats), seed, i % seats, { state: seed });
    rounds += r.rounds;
    // seat 0 stands for the person: their share of the decisions
    const perSeat = r.decisions / seats;
    seconds +=
      r.rounds * (PACE.deal + PACE.result + PACE.revealPerSeat * seats) + perSeat * PACE.human + (r.decisions - perSeat) * PACE.bot;
  }
  return { rounds: rounds / M, minutes: seconds / M / 60 };
}

const lengthRows: string[] = [];
for (const [name, rules, seats] of [
  ["Rodzinne", PRESETS.family, 2],
  ["Rodzinne", PRESETS.family, 4],
  ["Rodzinne", PRESETS.family, 6],
  ["Z bankierem", PRESETS.bank, 2],
  ["Z bankierem", PRESETS.bank, 4],
  ["Z bankierem", PRESETS.bank, 6],
] as const) {
  const l = matchLength(rules, seats);
  lengthRows.push(`| ${name} | ${seats} | ${num(l.rounds, 1)} | ${num(l.minutes, 1)} min |`);
  console.log("length", name, seats);
}

// --- 5. Evaluator speed -----------------------------------------------------------

function evalMs(rules: Rules, seats: number): number {
  let total = 0;
  let n = 0;
  for (let g = 0; n < 150; g++) {
    let m = newMatch(rules, seats, g);
    while (m.round.turn !== null && m.round.turn !== 0) {
      const r = matchApply(m, m.round.turn, g % 2 ? "stand" : "hit");
      if ("error" in r) break;
      m = r.state;
    }
    if (m.round.turn !== 0) continue;
    const v = viewFor(m, 0);
    const t0 = performance.now();
    evaluate(v, { samples: 1500, rng: { state: g }, opponentModel: { standAt: 17 } });
    total += performance.now() - t0;
    n++;
  }
  return total / n;
}
const speedRows = (
  [
    ["Rodzinne", PRESETS.family, 4],
    ["Rodzinne", PRESETS.family, 8],
    ["Z bankierem", PRESETS.bank, 4],
  ] as const
).map(([name, rules, seats]) => `| ${name} | ${seats} | ${num(evalMs(rules, seats), 1)} ms |`);

const majority4 = bankRoundsToWin("majority", 4);
const perDuel4 = bankRoundsToWin("perDuel", 4);

const md = `# Statystyki reguł

Wygenerowane przez \`npm run stats\` z symulacji botów (deterministyczne
ziarna). Boty: progi 15–19 (mieszany stół), w testach sprawiedliwości —
wszyscy jednakowi (próg 17).

## Rundy

20 000 rund na wiersz.

| Wariant | Graczy | Dobrań na rękę | Fura (% rąk) | Bank wygrywa pojedynek | Bank punktuje (% rund) |
|---|---|---|---|---|---|
${presetRows.join("\n")}

## Sprawiedliwość trybu z bankierem

Udział wygranych partii (do 10 pkt) per miejsce przy jednakowych botach,
bank co rundę na kolejnym miejscu, 3000 partii na wiersz. Cel: każde miejsce
≈ 1/n ± 3 pp dla domyślnego \`majority\`.

| Punktacja banku | Graczy | Udział per miejsce | Oczekiwany | Maks. odchylenie |
|---|---|---|---|---|
${fairRows.join("\n")}

Domyślna punktacja (\`majority\`) zbalansowana: **${fairOk ? "tak" : "NIE"}**.
Średnia liczba rund do 10 pkt przy 4 graczach: \`majority\` ${num(majority4, 1)},
\`perDuel\` ${num(perDuel4, 1)} (przy \`perDuel\` bank zbiera do n−1 punktów
w rundzie, więc partia kończy się szybciej i zależy od tego, kto ma bank
w końcówce).

## Brak kart w talii

Odsetek rund, w których skończyła się talia (2 karty na start, wszyscy
dobierają do 20 — najgorszy przypadek), 20 000 rund na liczbę graczy.
Przy pustej talii można już tylko powiedzieć „Starczy”.

| Talia | Limit graczy (\`MAX_SEATS\`) | P(pusta talia) wg liczby graczy |
|---|---|---|
${stockRows.join("\n")}

## Długość partii do 10 punktów

Tempo normalne: bot 0,8 s na decyzję, człowiek ok. 2 s, rozdanie ok. 2 s,
odsłanianie 0,4 s na rękę, ekran końca rundy ok. 3 s. 1500 partii na wiersz.

| Tryb | Graczy | Rund | Czas |
|---|---|---|---|
${lengthRows.join("\n")}

## Szybkość ewaluatora

1500 próbek Monte Carlo na decyzję, Node (JIT), średnia ze 150 pozycji.
Na telefonie (Hermes, bez JIT) liczone w kawałkach po 250 próbek, bez
blokowania UI.

| Tryb | Graczy | Czas |
|---|---|---|
${speedRows.join("\n")}
`;

fs.writeFileSync(path.join(ROOT, "docs/STATS.md"), md);
console.log("docs/STATS.md written");
