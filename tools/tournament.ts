// Calibration of the bot levels: every persona plays the same deals against
// the same reference opponents (paired comparison), in the family game
// (4 players) and in the bank game 1 on 1 (half the deals as the bank).
//   npm run tournament            (default 6000 deals per mode)
//   npm run tournament -- 2000
// Writes docs/BOTS.md and src/ai/calibration.ts.
import fs from "fs";
import path from "path";

import { PERSONAS, type PersonaId } from "../src/ai/personas";
import { policyOf, threshold, type Policy } from "../src/ai/policies";
import { playRound } from "../src/ai/simulate";
import { splitmix32 } from "../src/engine/rng";
import { withPreset, type PresetId } from "../src/engine/presets";
import { DEFAULT_RULES, PRESETS, type Rules } from "../src/engine/rules";
import { pl } from "../src/i18n/pl";

const N = Number(process.argv[2]) || 6000;
const ROOT = path.join(__dirname, "..");

/** The field: three "average" players (stop at 15, 17 and 19). */
const FIELD: Policy[] = [threshold(15), threshold(17), threshold(19)];
const BANK_REF: Policy = threshold(17);

interface Result {
  id: PersonaId;
  family: Float64Array;
  bank: Float64Array;
  ms: number;
}

function run(id: PersonaId, familyRules: Rules = DEFAULT_RULES, bankRules: Rules = PRESETS.bank, n = N): Result {
  const p = PERSONAS.find((x) => x.id === id)!;
  const me = policyOf(p.policy);
  const family = new Float64Array(n);
  const bank = new Float64Array(n);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const seed = splitmix32(i);
    // Family: the persona at seat 0, the dealer rotating with the deal.
    const f = playRound(familyRules, [me, ...FIELD], seed, i % 4, { state: seed ^ 0x5bd1e995 });
    family[i] = f.match.round.result!.points[0];
    // Bank 1 on 1: the persona is the bank on even deals.
    const asBank = i % 2 === 0;
    const b = playRound(bankRules, [me, BANK_REF], seed, asBank ? 0 : 1, { state: seed ^ 0x27d4eb2f });
    bank[i] = b.match.round.result!.points[0];
  }
  return { id, family, bank, ms: Date.now() - t0 };
}

const mean = (a: Float64Array) => a.reduce((s, x) => s + x, 0) / a.length;
const combined = (r: Result) => Float64Array.from(r.family, (f, i) => (f + r.bank[i]) / 2);

/** Paired z-score of b − a over the same deals. */
function pairedZ(a: Float64Array, b: Float64Array): number {
  const n = a.length;
  let s = 0;
  let s2 = 0;
  for (let i = 0; i < n; i++) {
    const d = b[i] - a[i];
    s += d;
    s2 += d * d;
  }
  const m = s / n;
  const v = s2 / n - m * m;
  return v === 0 ? (m === 0 ? 0 : Infinity) : m / Math.sqrt(v / n);
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

const results = PERSONAS.map((p) => {
  const r = run(p.id);
  console.log(`${pl.personas[p.id].name.padEnd(9)} family ${pct(mean(r.family))}  bank ${pct(mean(r.bank))}  (${(r.ms / 1000).toFixed(1)} s)`);
  return r;
});

const rows = results.map((r, i) => {
  const p = PERSONAS[i];
  const strength = mean(combined(r));
  const z = i === 0 ? null : pairedZ(combined(results[i - 1]), combined(r));
  return { p, r, strength, z };
});
const monotonic = rows.every((x, i) => i === 0 || x.strength > rows[i - 1].strength);
const distinct = rows.every((x) => x.z === null || x.z > 2);

// Rule sets with other cards (PLAN.md §13): do the characters keep their
// order? (Fewer deals; Ajnc has the cards of 17 und 4.)
const SET_IDS: PresetId[] = ["siebzehnUndVier", "okoBere", "ochko", "pontoon"];
const THRESHOLDS = [12, 13, 14, 15, 16, 17, 18, 19, 20];
const SET_N = Math.max(500, Math.round(N / 3));
const sets = SET_IDS.map((id) => {
  const rules = withPreset(DEFAULT_RULES, id);
  const res = PERSONAS.map((p) => run(p.id, { ...rules, mode: "family" }, { ...rules, mode: "bank" }, SET_N));
  const strengths = res.map((r) => mean(combined(r)));
  const mono = strengths.every((x, i) => i === 0 || x > strengths[i - 1]);
  // Strength of a plain threshold 12..20 on the set's cards (how flat the
  // middle levels are).
  const curve = THRESHOLDS.map((t) => {
    const fam = { ...rules, mode: "family" as const };
    const bnk = { ...rules, mode: "bank" as const };
    let s = 0;
    for (let i = 0; i < SET_N; i++) {
      const seed = splitmix32(i);
      s += playRound(fam, [threshold(t), ...FIELD], seed, i % 4, { state: seed ^ 0x5bd1e995 }).match.round.result!.points[0];
      s += playRound(bnk, [threshold(t), BANK_REF], seed, i % 2 === 0 ? 0 : 1, { state: seed ^ 0x27d4eb2f }).match.round.result!.points[0];
    }
    return s / (2 * SET_N);
  });
  console.log(`${id}: ${strengths.map(pct).join(" ")} monotonic: ${mono}`);
  return { id, strengths, mono, curve };
});

const md = `# Boty — kalibracja poziomów

Wygenerowane przez \`npm run tournament\` (${N} rozdań na tryb, te same
rozdania dla każdej postaci — porównanie parami).

- **Rodzinne:** postać + 3 graczy referencyjnych (stają przy 15, 17 i 19),
  rozdający rotuje. Wynik = odsetek rund z punktem dla postaci.
- **Bank 1 na 1:** postać vs gracz referencyjny (staje przy 17), postać jest
  bankiem w co drugim rozdaniu. Wynik = odsetek rund z punktem dla postaci.
- **Siła** = średnia obu wyników. **z** = test parami względem poprzedniego
  poziomu (na tych samych rozdaniach); z > 2 → różnica istotna.

| Poziom | Postać | Polityka | Rodzinne | Bank 1:1 | Siła | z vs poprzedni |
|---|---|---|---|---|---|---|
${rows
  .map(
    (x, i) =>
      `| ${i + 1} | ${pl.personas[x.p.id].name} (${pl.personas[x.p.id].label}) | ${describe(x.p.policy)} | ${pct(mean(x.r.family))} | ${pct(mean(x.r.bank))} | ${pct(x.strength)} | ${x.z === null ? "—" : x.z.toFixed(1)} |`
  )
  .join("\n")}

Poziomy rosną monotonicznie: **${monotonic ? "tak" : "NIE"}**. Sąsiednie
poziomy różnią się istotnie: **${distinct ? "tak" : "NIE"}**.

## Zestawy zasad (PLAN.md §13)

Ten sam turniej na kartach zestawu (${SET_N} rozdań na tryb). Ajnc ma karty
17 und 4.

| Zestaw | ${PERSONAS.map((p) => pl.personas[p.id].name).join(" | ")} | Rosną monotonicznie |
|---|${PERSONAS.map(() => "---|").join("")}---|
${sets.map((x) => `| ${pl.rules.editor.presets[x.id].name} | ${x.strengths.map(pct).join(" | ")} | ${x.mono ? "tak" : "NIE"} |`).join("\n")}

Siła zwykłego progu („staje przy t”) na kartach zestawu:

| Zestaw | ${THRESHOLDS.join(" | ")} |
|---|${THRESHOLDS.map(() => "---|").join("")}
${sets.map((x) => `| ${pl.rules.editor.presets[x.id].name} | ${x.curve.map(pct).join(" | ")} |`).join("\n")}

Na taliach 32 i 36 kart (bez kart 2–6 / 2–5) progi 14–18 dają prawie tę samą siłę —
środkowe poziomy (Kuba, Hela, Ola, Marek) różnią się o ok. 1–2 pkt proc.,
a samymi progami nie da się ich rozsunąć. Witek (ciągnie do 20) jest tu
słabszy niż na 52 kartach (Очко: bank dobiera do 17). Decyzja (PLAN.md §13): postacie bez zmian —
ich styl i opisy („staje przy 14”) zostają prawdziwe; kolejność poziomów
obowiązuje dla domyślnego Oczka.

Dla odniesienia: przy 4 równych graczach udział rund z punktem w trybie
rodzinnym wynosi ok. 25% (+ remisy), a w banku 1:1 ok. 50%.
`;

function describe(s: (typeof PERSONAS)[number]["policy"]): string {
  switch (s.kind) {
    case "threshold":
      return `staje przy ${s.t}`;
    case "noisy":
      return `staje przy ${s.t}, ${Math.round(s.eps * 100)}% losowych decyzji`;
    case "contextual":
      return `staje przy ${s.t}, patrzy na stół`;
    case "evaluator":
      return `ewaluator, ${s.samples} próbek`;
  }
}

fs.writeFileSync(path.join(ROOT, "docs/BOTS.md"), md);
fs.writeFileSync(
  path.join(ROOT, "src/ai/calibration.ts"),
  `// Generated by tools/tournament.ts (${N} deals per mode) — do not edit.
// Measured strength per persona (mean of the family and bank 1:1 point rates).
export const CALIBRATION_DEALS = ${N};
export const STRENGTH: Record<string, number> = {
${rows.map((x) => `  ${x.p.id}: ${x.strength.toFixed(4)},`).join("\n")}
};
`
);
console.log(`monotonic: ${monotonic}, distinct: ${distinct}`);
