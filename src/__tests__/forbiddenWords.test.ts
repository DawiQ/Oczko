// Zero gambling (PLAN.md §9): no gambling vocabulary in the app's sources,
// its config or the store texts. Word stems with a word start, so "zakładka"
// (a tab), "wstawka" or "podstawka" are fine.
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "../..");
const SCANNED = ["src", "store", "app.json", "App.tsx"];
const EXTENSIONS = /\.(ts|tsx|js|json|md|txt)$/;
/** This file lists the words, so it is not scanned. */
const SELF = path.relative(ROOT, __filename);

/** A word starts here (\b does not work with Polish letters). */
const W = "(?<!\\p{L})";
export const FORBIDDEN: { name: string; re: RegExp }[] = [
  { name: "kasyno", re: new RegExp(`${W}kasyn`, "iu") },
  { name: "casino", re: new RegExp(`${W}casino`, "iu") },
  { name: "żetony", re: new RegExp(`${W}żeton`, "iu") },
  { name: "zakład", re: new RegExp(`${W}zakład(?!k)`, "iu") },
  { name: "obstawiać", re: new RegExp(`${W}obstaw`, "iu") },
  { name: "stawka", re: new RegExp(`${W}stawk`, "iu") },
  { name: "krupier", re: new RegExp(`${W}krupier`, "iu") },
  { name: "jackpot", re: new RegExp(`${W}jackpot`, "iu") },
  { name: "szuler", re: new RegExp(`${W}szuler`, "iu") },
  { name: "blackjack", re: new RegExp(`${W}black\\s*jack`, "iu") },
  { name: "liczenie kart", re: new RegExp(`${W}liczeni\\p{L}*\\s+kart`, "iu") },
  { name: "wygraj pieniądze", re: new RegExp(`${W}wygr\\p{L}*\\s+pieni`, "iu") },
  { name: "wager", re: new RegExp(`${W}wager`, "iu") },
];

/** Phrases allowed despite a match (removed before checking). */
const ALLOWED = [
  "Gambling & Betting", // AdMob category to block (store/RELEASE.md)
  "Social Casino", // AdMob category to block
  "Simulated Gambling", // rating questionnaires
];

export function findForbidden(text: string): string[] {
  let t = text;
  for (const a of ALLOWED) t = t.split(a).join("");
  return FORBIDDEN.filter((f) => f.re.test(t)).map((f) => f.name);
}

function files(p: string): string[] {
  const full = path.join(ROOT, p);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [p];
  return fs.readdirSync(full).flatMap((n) => files(path.join(p, n)));
}

describe("forbidden words", () => {
  it.each([
    ["Stawka większa niż życie", ["stawka"]],
    ["Postaw żetony!", ["żetony"]],
    ["Obstaw wynik", ["obstawiać"]],
    ["Wielkie KASYNO", ["kasyno"]],
    ["Bez zakładów", ["zakład"]],
    ["Liczenie kart jest zabronione", ["liczenie kart"]],
    ["Krupier rozdaje", ["krupier"]],
    ["Szuler przy stole", ["szuler"]],
    ["Black Jack", ["blackjack"]],
    ["Zakładki: Graj · Profil · Zasady", []],
    ["Wstawka i podstawka", []],
    ["Oczko — polska gra w 21", []],
    ["Oczko, czyli blackjack po polsku", ["blackjack"]],
    ["Wygrywasz pieniądze", ["wygraj pieniądze"]],
    ["Social Casino i Gambling & Betting zablokowane", []],
    ["Bank wygrywa remis", []],
    ["Liczy szanse przed każdym ruchem", []],
  ])("%s → %j", (text, found) => {
    expect(findForbidden(text)).toEqual(found);
  });

  it("finds none in the app, its config and the store texts", () => {
    const hits = SCANNED.flatMap(files)
      .filter((f) => EXTENSIONS.test(f) && f !== SELF)
      .flatMap((f) => {
        const lines = fs.readFileSync(path.join(ROOT, f), "utf8").split("\n");
        return lines.flatMap((line, i) => findForbidden(line).map((w) => `${f}:${i + 1} „${w}”`));
      });
    expect(hits).toEqual([]);
  });
});
