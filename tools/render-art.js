// Renders the app icon, Android adaptive icon and splash icon with headless
// Chromium (Playwright):
//   node tools/render-art.js
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const FONT = path.join(__dirname, "../node_modules/@expo-google-fonts/fraunces/800ExtraBold/Fraunces_800ExtraBold.ttf");
const OUT = path.join(__dirname, "..");
const font = "data:font/ttf;base64," + fs.readFileSync(FONT).toString("base64");

const ACCENT = "#E8925A";
const FELT = "#123D30";
const BG = "#0F1720";

// A card: cream face, a corner index (rank over suit) top-left and, turned
// round, bottom-right — like a real deck — and a large suit in the middle.
function card(x, y, rot, rank, suit, red, s = 1) {
  const w = 300 * s, h = 430 * s, r = 34 * s;
  const col = red ? "#C8352C" : "#1B232C";
  const index =
    `<text x="${-w / 2 + 26 * s}" y="${-h / 2 + 90 * s}" font-family="Fraunces" font-size="${84 * s}" fill="${col}">${rank}</text>` +
    `<text x="${-w / 2 + 30 * s}" y="${-h / 2 + 148 * s}" font-family="DejaVu Sans, sans-serif" font-size="${52 * s}" fill="${col}">${suit}</text>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="${-w / 2 + 4 * s}" y="${-h / 2 + 12 * s}" width="${w}" height="${h}" rx="${r}" fill="rgba(0,0,0,0.28)"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${r}" fill="#FBF7EE" stroke="#E4DCCB" stroke-width="${3 * s}"/>
    ${index}
    <g transform="rotate(180)">${index}</g>
    <text x="0" y="${52 * s}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="${150 * s}" fill="${col}">${suit}</text>
  </g>`;
}

// Two aces (perskie oczko) and a "21" label (a rectangular sticker — never a
// round token).
const logo = (cx, cy, s) =>
  card(cx - 95 * s, cy + 10 * s, -13, "A", "♥", true, s) +
  card(cx + 95 * s, cy + 10 * s, 13, "A", "♠", false, s) +
  `<g transform="translate(${cx + 190 * s} ${cy + 225 * s}) rotate(-8)">
     <rect x="${-104 * s}" y="${-62 * s}" width="${208 * s}" height="${132 * s}" rx="${26 * s}" fill="#A85E2E"/>
     <rect x="${-104 * s}" y="${-70 * s}" width="${208 * s}" height="${132 * s}" rx="${26 * s}" fill="${ACCENT}"/>
     <text y="${30 * s}" text-anchor="middle" font-family="Fraunces" font-size="${104 * s}" fill="#1E0F06">21</text>
   </g>`;

// `vw`/`vh`: the drawing's own coordinate space (defaults to the output size).
const page = (w, h, body, vw = w, vh = h) => `<!doctype html><html><head><style>
  @font-face { font-family: Fraunces; src: url("${font}"); }
  html, body { margin: 0; background: transparent; }
</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}">${body}</svg></body></html>`;

// Same green as the Android adaptive icon background (app.json).
const iconBody = `<rect width="1024" height="1024" fill="${FELT}"/>${logo(500, 440, 1.0)}`;

const shots = [
  // App icon: opaque square (iOS applies its own mask).
  ["assets/icon.png", 1024, 1024, false, iconBody],
  // Android adaptive icon foreground: transparent, artwork inside the central safe zone (~66%).
  ["assets/adaptive-icon.png", 1024, 1024, true, logo(500, 460, 0.66)],
  // Splash icon (shown 200 dp wide on the background colour): logo + wordmark
  // with a margin, so Android 12+'s round icon mask does not cut it.
  ["assets/splash-icon.png", 1024, 1024, false,
    `<rect width="1126" height="1126" fill="${BG}"/>${logo(555, 420, 0.6)}
     <text x="563" y="840" text-anchor="middle" font-family="Fraunces" font-size="190" fill="#EEF2F6">Oczko</text>`,
    1126, 1126],
];

(async () => {
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
  const browser = await chromium.launch();
  for (const [name, w, h, transparent, body, vw, vh] of shots) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(page(w, h, body, vw, vh));
    await p.evaluate(() => document.fonts.ready);
    const ok = await p.evaluate(() => document.fonts.check("84px Fraunces"));
    if (!ok) throw new Error("Fraunces not loaded");
    await p.screenshot({ path: path.join(OUT, name), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
  }
  await browser.close();
})();
