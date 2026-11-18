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
/** A word ends here. */
const E = "(?!\\p{L})";
export const FORBIDDEN: { name: string; re: RegExp; /** Only texts for people (dictionaries, store listings), not code. */ textsOnly?: boolean }[] = [
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
  // Other languages of the app (PLAN.md §12): their dictionaries and store
  // texts are scanned with every list.
  { name: "bet (EN)", re: new RegExp(`${W}bet(?:s|ting|tor)?${E}`, "iu"), textsOnly: true },
  { name: "stake (EN)", re: new RegExp(`${W}stakes?${E}`, "iu"), textsOnly: true },
  { name: "chips (EN)", re: new RegExp(`${W}chips?${E}`, "iu"), textsOnly: true },
  { name: "gamble (EN)", re: new RegExp(`${W}gambl`, "iu"), textsOnly: true },
  { name: "croupier", re: new RegExp(`${W}croupier`, "iu"), textsOnly: true },
  { name: "card counting (EN)", re: new RegExp(`${W}(?:card\\s+counting|count\\p{L}*\\s+cards)`, "iu"), textsOnly: true },
  { name: "Kasino (DE/CS/SK)", re: new RegExp(`${W}(?:kasin|kazin|kaszin)`, "iu"), textsOnly: true },
  { name: "Jeton (DE)", re: new RegExp(`${W}(?:jeton|žeton|zseton)`, "iu"), textsOnly: true },
  { name: "Einsatz (DE)", re: new RegExp(`${W}einsatz`, "iu"), textsOnly: true },
  { name: "Wette (DE)", re: new RegExp(`${W}(?:wette|wetten|wettet)${E}`, "iu"), textsOnly: true },
  { name: "Glücksspiel (DE)", re: new RegExp(`${W}glücksspiel`, "iu"), textsOnly: true },
  { name: "sázka (CS/SK)", re: new RegExp(`${W}(?:sáz|stávk|vsad)`, "iu"), textsOnly: true },
  { name: "krupiér (CS/SK/HU/BCMS)", re: new RegExp(`${W}(?:krupiér|krupié|krupije)`, "iu"), textsOnly: true },
  { name: "tét (HU)", re: new RegExp(`${W}tét${E}`, "iu"), textsOnly: true },
  { name: "fogadás (HU)", re: new RegExp(`${W}fogadás`, "iu"), textsOnly: true },
  { name: "ulog (BCMS)", re: new RegExp(`${W}ulog${E}`, "iu"), textsOnly: true },
  { name: "opklada (BCMS)", re: new RegExp(`${W}o(?:p)?klad`, "iu"), textsOnly: true },
  { name: "казино (UK/RU)", re: new RegExp(`${W}казин`, "iu"), textsOnly: true },
  { name: "ставка (UK/RU)", re: new RegExp(`${W}став(?:к|ок)`, "iu"), textsOnly: true },
  { name: "фишки (UK/RU)", re: new RegExp(`${W}(?:фіш|фиш)(?:к|ок|ек)`, "iu"), textsOnly: true },
  { name: "крупье (UK/RU)", re: new RegExp(`${W}крупь?[єеʼ']`, "iu"), textsOnly: true },
  { name: "джекпот (UK/RU)", re: new RegExp(`${W}джекпот`, "iu"), textsOnly: true },
];

/** Phrases allowed despite a match (removed before checking). */
const ALLOWED = [
  "Gambling & Betting", // AdMob category to block (store/RELEASE.md)
  "Social Casino", // AdMob category to block
  "Simulated Gambling", // rating questionnaires
];

/** Texts for people: the dictionaries, store listings and policy, app.json. */
const TEXTS = /^(src\/i18n\/|store\/(listing|privacy)|app\.json)/;

export function findForbidden(text: string, texts = true): string[] {
  let t = text;
  for (const a of ALLOWED) t = t.split(a).join("");
  return FORBIDDEN.filter((f) => (texts || !f.textsOnly) && f.re.test(t)).map((f) => f.name);
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
    ["Place your bets", ["bet (EN)"]],
    ["Between the cards, the best hand", []],
    ["No chips, no stakes", ["stake (EN)", "chips (EN)"]],
    ["Kein Einsatz, keine Wette", ["Einsatz (DE)", "Wette (DE)"]],
    ["Das Wetter ist schön", []],
    ["Bez sázek, žádné kasino", ["Kasino (DE/CS/SK)", "sázka (CS/SK)"]],
    ["Nincs tét, nincs kaszinó", ["Kasino (DE/CS/SK)", "tét (HU)"]],
    ["A tétel listája", []],
    ["Nema ulog, nema opklade", ["ulog (BCMS)", "opklada (BCMS)"]],
    ["Uloga bankara", []],
    ["Без ставок і фішок", ["ставка (UK/RU)", "фишки (UK/RU)"]],
    ["Казино и крупье", ["казино (UK/RU)", "крупье (UK/RU)"]],
  ])("%s → %j", (text, found) => {
    expect(findForbidden(text)).toEqual(found);
  });

  it("finds none in the app, its config and the store texts", () => {
    const hits = SCANNED.flatMap(files)
      .filter((f) => EXTENSIONS.test(f) && f !== SELF)
      .flatMap((f) => {
        const lines = fs.readFileSync(path.join(ROOT, f), "utf8").split("\n");
        return lines.flatMap((line, i) => findForbidden(line, TEXTS.test(f)).map((w) => `${f}:${i + 1} „${w}”`));
      });
    expect(hits).toEqual([]);
  });
});
