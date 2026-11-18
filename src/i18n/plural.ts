// Plural forms after a number (CLDR cardinal rules for integers), for the
// languages of PLAN.md §12. Pure; no Intl (not needed for whole numbers).

export type PluralForm = "one" | "few" | "many";

/** Polish: 1 → one; 2–4, 22–24… (not 12–14) → few; the rest → many. */
export function polishForm(n: number): PluralForm {
  const a = Math.abs(n);
  if (a === 1) return "one";
  const d = a % 10;
  const h = a % 100;
  return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? "few" : "many";
}

/** Czech, Slovak: 1 → one; 2–4 → few; the rest (0, 5+) → many. */
export function czechForm(n: number): PluralForm {
  const a = Math.abs(n);
  return a === 1 ? "one" : a >= 2 && a <= 4 ? "few" : "many";
}

/** Ukrainian, Russian, Serbo-Croatian: 1, 21, 31… (not 11) → one; 2–4,
 *  22–24… (not 12–14) → few; the rest → many. */
export function eastSlavicForm(n: number): PluralForm {
  const a = Math.abs(n);
  const d = a % 10;
  const h = a % 100;
  if (d === 1 && h !== 11) return "one";
  return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? "few" : "many";
}

/** English, German: 1 → one; the rest → many. Hungarian has no plural after
 *  a number: always one. */
export const germanicForm = (n: number): PluralForm => (Math.abs(n) === 1 ? "one" : "many");
export const hungarianForm = (_n: number): PluralForm => "one";

/** plural(1, "karta", "karty", "kart") = "karta" (Polish rules). */
export function plural(n: number, one: string, few: string, many: string): string {
  const f = polishForm(n);
  return f === "one" ? one : f === "few" ? few : many;
}
