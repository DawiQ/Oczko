// Polish plural forms of counted nouns.

/** plural(1, "karta", "karty", "kart") = "karta"; 3 → "karty"; 5, 12, 22… → see rules. */
export function plural(n: number, one: string, few: string, many: string): string {
  const a = Math.abs(n);
  if (a === 1) return one;
  const d = a % 10;
  const h = a % 100;
  return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? few : many;
}

/** "3 karty" */
export const cardsCount = (n: number) => `${n} ${plural(n, "karta", "karty", "kart")}`;
/** "5 punktów" */
export const pointsCount = (n: number) => `${n} ${plural(n, "punkt", "punkty", "punktów")}`;
/** "2 rundy" */
export const roundsCount = (n: number) => `${n} ${plural(n, "runda", "rundy", "rund")}`;
