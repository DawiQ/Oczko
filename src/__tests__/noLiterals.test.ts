// Every text a person reads comes from the dictionaries (src/i18n), never
// from a literal in a component or module. Heuristic scan of the sources:
//  - a string literal with Polish letters or quotes („”), with a space and
//    letters, or a single capitalised word ("Graj"),
//  - JSX text between tags.
// Comments, imports, errors and console output are skipped; a line can opt
// out with `// i18n-ignore` (e.g. a non-text value that looks like a word).
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "../..");
const SKIP_DIRS = ["__tests__", "i18n", "engine"];
/** Files without text for people beyond the skipped directories. */
/** Verbatim legal texts in English (the fonts' licences). */
const SKIP_FILES: string[] = ["src/info/licenses.ts"];

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP_DIRS.includes(e.name) ? [] : files(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

const HUMAN = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ„”…]/;
const WORDS = /\p{L}{2,}\s+\p{L}|\p{L}\s+\p{L}{2,}/u;
const CAPITALISED = /^\p{Lu}\p{Ll}+[!?.…]*$/u;

/** Is this literal's content text for people? */
function isText(s: string): boolean {
  if (!s.trim()) return false;
  if (/^(https?:|oczko[.:/]|\.\/|[a-z]+\/)/.test(s)) return false; // urls, keys, paths
  return HUMAN.test(s) || WORDS.test(s) || CAPITALISED.test(s.trim());
}

export function findLiterals(src: string, jsx = true): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  const lines = src.split("\n");
  let inBlock = false;
  lines.forEach((raw, i) => {
    let line = raw;
    if (inBlock) {
      const end = line.indexOf("*/");
      if (end < 0) return;
      line = line.slice(end + 2);
      inBlock = false;
    }
    line = line.replace(/\/\*.*?\*\//g, "");
    const open = line.indexOf("/*");
    if (open >= 0) {
      inBlock = true;
      line = line.slice(0, open);
    }
    if (/i18n-ignore/.test(raw)) return;
    line = line.replace(/(^|[^:"'`])\/\/.*$/, "$1");
    if (/^\s*(import|export \* from|export \{[^}]*\} from)\b/.test(line)) return;
    if (/new Error\(|console\.\w+\(|throw /.test(line)) return;
    for (const m of line.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) {
      const s = (m[1] ?? m[2] ?? m[3] ?? "").replace(/\$\{[^}]*\}/g, " ");
      if (isText(s)) out.push({ line: i + 1, text: s });
    }
    // JSX text: >Some words< (outside braces and string literals).
    const noStrings = line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
    if (jsx) for (const m of noStrings.matchAll(/(?<![=-])>([^<>{}]*\p{L}{2,}[^<>{}]*)<\/?[A-Za-z]/gu)) {
      if (!/=>|&&|\|\||[()=;]/.test(m[1])) out.push({ line: i + 1, text: m[1].trim() });
    }
  });
  return out;
}

describe("no text literals outside the dictionaries", () => {
  const all = [path.join(ROOT, "App.tsx"), ...files(path.join(ROOT, "src"))].filter((f) => !SKIP_FILES.some((s) => f.endsWith(s)));

  it("finds texts in a sample (the scanner works)", () => {
    const sample = [
      'const a = "Nowa gra";',
      "const b = 'Graj';",
      "<Text>Dobieram</Text>",
      "const c = `Runda ${n}`;",
      'const ok = "myTurn"; // "Komentarz"',
      'const key = "oczko.save.v1";',
      'throw new Error("bad move");',
      'const role = "button";',
    ].join("\n");
    expect(findLiterals(sample).map((x) => x.text)).toEqual(["Nowa gra", "Graj", "Dobieram", "Runda  "]);
  });

  it.each(all.map((f) => [path.relative(ROOT, f), f]))("%s", (_rel, f) => {
    const found = findLiterals(fs.readFileSync(f, "utf8"), f.endsWith(".tsx"));
    expect(found.map((x) => `${x.line}: ${x.text}`)).toEqual([]);
  });
});
