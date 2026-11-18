// Store materials for every language of the app: the listing's texts within
// the stores' limits, the iOS permission texts and a feature graphic.
import fs from "fs";
import path from "path";

import { LANGS } from "../i18n/langs";

const ROOT = path.join(__dirname, "../..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

/** The listing's sections in order: name, short description, promo text,
 *  keywords, full description (headings are in the listing's language). */
function sections(md: string): string[] {
  return md
    .split(/^## /m)
    .slice(1)
    .map((s) => s.slice(s.indexOf("\n") + 1).trim());
}

const LIMITS: [string, number][] = [
  ["name", 30],
  ["short description", 80],
  ["promo text", 170],
  ["keywords", 100],
  ["full description", 4000],
];

const appJson = JSON.parse(read("app.json")).expo;

describe.each(LANGS.map((l) => [l]))("store texts: %s", (lang) => {
  const listing = `store/listing-${lang}.md`;

  it("listing within the stores' limits", () => {
    const parts = sections(read(listing));
    expect(parts.length).toBeGreaterThanOrEqual(LIMITS.length);
    const over = LIMITS.flatMap(([what, max], i) => (parts[i].length > max ? [`${what}: ${parts[i].length}/${max}`] : []));
    expect(over).toEqual([]);
    expect(parts[0]).toMatch(/^Oczko/);
    expect(parts[3]).not.toMatch(/,\s/); // keywords: no spaces after commas
  });

  it("iOS permission texts with the same keys as Polish", () => {
    expect(appJson.locales[lang]).toBe(`./locales/${lang}.json`);
    const keys = (l: string) => Object.keys(JSON.parse(read(`locales/${l}.json`)).ios).sort();
    expect(keys(lang)).toEqual(keys("pl"));
  });

  it("a feature graphic", () => {
    const file = lang === "pl" ? "store/feature-graphic.png" : `store/feature-graphic-${lang}.png`;
    expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
  });
});
