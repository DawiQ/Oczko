// Store screenshots (1080x1920, Google Play phone, 9:16): a real screen of the
// app (store/screenshots/src — captured on a phone, status and navigation
// bars cropped) in a phone frame on the felt, with a headline above it.
//   node tools/render-screenshots.js
// Output: store/screenshots/<lang>/NN-<name>.png. Captions: no words from the
// forbidden lists (PLAN.md §9, §12).
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const FONTS = path.join(ROOT, "node_modules/@expo-google-fonts/fraunces");
const fontData = (dir, file) => "data:font/ttf;base64," + fs.readFileSync(path.join(FONTS, dir, file)).toString("base64");
const HEAD_FONT = fontData("800ExtraBold", "Fraunces_800ExtraBold.ttf");
const SUB_FONT = fontData("500Medium", "Fraunces_500Medium.ttf");

const W = 1080;
const H = 1920;

/** Per language, in store order: the source screen, headline, subline. */
const SHOTS = {
  pl: [
    ["pl-table-persian", "Dobieram czy starczy?", "Dwa asy? Perskie oczko!"],
    ["pl-round-end", "Kto bliżej 21, ten wygrywa", "Punkt za każdą rundę"],
    ["pl-new-game", "Osiem postaci przy stole", "Od Zosi do Hrabiego"],
    ["pl-table-stand", "Rodzinnie albo z bankierem", "Grasz według swoich zasad"],
    ["pl-home", "Polskie Oczko na punkty", "Bez pieniędzy i bez nagród"],
  ],
  en: [
    ["en-table-21", "Draw or stay?", "Closest to 21 wins the round"],
    ["en-round-end", "A point for every round", "Two on 21? Both of them score"],
    ["en-new-game", "Eight characters at the table", "From Zoe to the Count"],
    ["en-wifi", "Play with friends over Wi‑Fi", "No internet, no accounts — just a code"],
    ["en-home", "The Polish game of 21", "For points — no money, no prizes"],
  ],
};

/** Polish typography: a one-letter word (z, w, i, a, o, u) never ends a line. */
const glue = (t) => t.replace(/(^|\s)([zwiaouZWIAOU])\s/g, "$1$2\u00a0");

const page = (img, head, sub) => `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family: Head; src: url("${HEAD_FONT}"); }
  @font-face { font-family: Sub; src: url("${SUB_FONT}"); }
  html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    background:
      radial-gradient(900px 520px at 50% 0%, rgba(232,146,90,0.28), transparent 70%),
      linear-gradient(180deg, #17503F 0%, #123D30 45%, #0B2A20 100%);
    font-family: Sub, serif;
  }
  .text { position: absolute; top: 96px; left: 70px; right: 70px; text-align: center; }
  h1, p { text-wrap: balance; }
  h1 { margin: 0; font-family: Head, serif; font-weight: 800; font-size: 84px; line-height: 1.08; color: #F3EBDD; letter-spacing: -1px; }
  p { margin: 22px 0 0; font-size: 42px; line-height: 1.2; color: #F2B48A; }
  .phone {
    position: absolute; left: 50%; top: 420px; transform: translateX(-50%);
    width: 760px; padding: 16px; border-radius: 72px; background: #06090D;
    box-shadow: 0 40px 90px rgba(0,0,0,0.55), 0 0 0 3px rgba(243,235,221,0.10);
  }
  .phone img { display: block; width: 100%; border-radius: 56px; }
</style></head><body>
  <div class="text"><h1>${glue(head)}</h1><p>${glue(sub)}</p></div>
  <div class="phone"><img src="${img}"></div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const tab = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const [lang, shots] of Object.entries(SHOTS)) {
    const dir = path.join(ROOT, "store/screenshots", lang);
    fs.mkdirSync(dir, { recursive: true });
    for (const [i, [name, head, sub]] of shots.entries()) {
      const src = path.join(ROOT, "store/screenshots/src", `${name}.jpg`);
      const img = "data:image/jpeg;base64," + fs.readFileSync(src).toString("base64");
      await tab.setContent(page(img, head, sub));
      await tab.evaluate(() => document.fonts.ready);
      const out = path.join(dir, `${String(i + 1).padStart(2, "0")}-${name.replace(/^[a-z]{2}-/, "")}.png`);
      await tab.screenshot({ path: out });
      console.log(path.relative(ROOT, out));
    }
  }
  await browser.close();
})();
