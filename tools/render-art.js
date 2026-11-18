// Renders the app icon, Android adaptive icon (foreground + background),
// splash icon and the store graphics (icon 512, feature graphic) with
// headless Chromium (Playwright):
//   node tools/render-art.js
//
// The icon: two aces fanned on copper, a green "21" label under them (a
// rectangular sticker — never a round token). Dark card edges and a strong
// shadow keep the cards apart from the copper at small sizes and in
// grayscale (store search results, settings).
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const FONT = path.join(__dirname, "../node_modules/@expo-google-fonts/fraunces/800ExtraBold/Fraunces_800ExtraBold.ttf");
const OUT = path.join(__dirname, "..");
const font = "data:font/ttf;base64," + fs.readFileSync(FONT).toString("base64");

const ACCENT = "#E8925A";
const ACCENT_DARK = "#A85E2E";
const FELT = "#123D30";
const FELT_DARK = "#0B2A20";
const CREAM = "#F3EBDD";
const BG = "#0F1720";

/** Card edges: on copper (the icon) and on the dark splash. */
const ON_COPPER = { edge: "#8A4A22", shadow: "rgba(70,25,0,0.55)", width: 7 };
const ON_DARK = { edge: "#E4DCCB", shadow: "rgba(0,0,0,0.30)", width: 3 };

// A card: cream face, the corner index (rank over suit) top-left and a large
// suit in the middle.
function card(x, y, rot, rank, suit, red, s, look) {
  const w = 300 * s, h = 430 * s, r = 34 * s;
  const col = red ? "#C8352C" : "#1B232C";
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="${-w / 2 + 6 * s}" y="${-h / 2 + 14 * s}" width="${w}" height="${h}" rx="${r}" fill="${look.shadow}"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${r}" fill="#FBF7EE" stroke="${look.edge}" stroke-width="${look.width * s}"/>
    <text x="${-w / 2 + 26 * s}" y="${-h / 2 + 90 * s}" font-family="Fraunces" font-size="${84 * s}" fill="${col}">${rank}</text>
    <text x="${-w / 2 + 30 * s}" y="${-h / 2 + 148 * s}" font-family="DejaVu Sans, sans-serif" font-size="${52 * s}" fill="${col}">${suit}</text>
    <text x="0" y="${58 * s}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="${170 * s}" fill="${col}">${suit}</text>
  </g>`;
}

const sticker = (x, y, s, fill, edge, ink) => `<g transform="translate(${x} ${y}) rotate(-4)">
   <rect x="${-110 * s}" y="${-62 * s}" width="${220 * s}" height="${136 * s}" rx="${28 * s}" fill="${edge}"/>
   <rect x="${-110 * s}" y="${-72 * s}" width="${220 * s}" height="${136 * s}" rx="${28 * s}" fill="${fill}"/>
   <text y="${32 * s}" text-anchor="middle" font-family="Fraunces" font-size="${112 * s}" fill="${ink}">21</text>
 </g>`;

/** Two aces (perskie oczko) fanned around (cx, cy) and the "21" under them. */
const logo = (cx, cy, s, onCopper) =>
  card(cx - 128 * s, cy, -15, "A", "♥", true, 1.02 * s, onCopper ? ON_COPPER : ON_DARK) +
  card(cx + 128 * s, cy + 6 * s, 14, "A", "♠", false, 1.02 * s, onCopper ? ON_COPPER : ON_DARK) +
  (onCopper ? sticker(cx, cy + 262 * s, 1.12 * s, FELT, FELT_DARK, CREAM) : sticker(cx, cy + 262 * s, 1.12 * s, ACCENT, ACCENT_DARK, "#1E0F06"));

/** Copper with a soft light from above. */
const copper = (w, h) =>
  `<defs><radialGradient id="cu" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#F2A272"/><stop offset="1" stop-color="#DD8250"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#cu)"/>`;

// `vw`/`vh`: the drawing's own coordinate space (defaults to the output size).
const page = (w, h, body, vw = w, vh = h) => `<!doctype html><html><head><style>
  @font-face { font-family: Fraunces; src: url("${font}"); }
  html, body { margin: 0; background: transparent; }
</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}">${body}</svg></body></html>`;

const iconBody = `${copper(1024, 1024)}${logo(512, 425, 1.17, true)}`;

const shots = [
  // App icon: opaque square (iOS applies its own mask).
  ["assets/icon.png", 1024, 1024, false, iconBody],
  // Google Play listing icon (512x512, same artwork; Play rounds the corners).
  ["store/icon-512.png", 512, 512, false, iconBody, 1024, 1024],
  // Google Play feature graphic (1024x500): no lettering beyond the name.
  ["store/feature-graphic.png", 1024, 500, false,
    `${copper(1024, 500)}${logo(255, 205, 0.62, true)}
     <text x="520" y="250" font-family="Fraunces" font-size="150" fill="#1E0F06">Oczko</text>
     <text x="526" y="312" font-family="DejaVu Sans, sans-serif" font-size="30" fill="#4A2410">polska gra w karty do 21</text>`],
  // Android adaptive icon: the foreground inside the central safe zone (~66%),
  // the background the same copper.
  ["assets/adaptive-icon.png", 1024, 1024, true, logo(512, 470, 0.62, true)],
  ["assets/adaptive-icon-bg.png", 1024, 1024, false, copper(1024, 1024)],
  // Splash icon (200 dp on the dark background; Android 12+ shows a circle of
  // 192 dp of it): the logo and the wordmark, inside that circle.
  ["assets/splash-icon.png", 1024, 1024, false,
    `<rect width="1126" height="1126" fill="${BG}"/>${logo(563, 390, 0.6, false)}
     <text x="563" y="850" text-anchor="middle" font-family="Fraunces" font-size="190" fill="#EEF2F6">Oczko</text>`,
    1126, 1126],
];

(async () => {
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "store"), { recursive: true });
  const browser = await chromium.launch();
  for (const [name, w, h, transparent, body, vw, vh] of shots) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(page(w, h, body, vw, vh));
    await p.evaluate(() => document.fonts.ready);
    const ok = await p.evaluate(() => document.fonts.check("84px Fraunces"));
    if (!ok && body.includes("Fraunces")) throw new Error("Fraunces not loaded");
    await p.screenshot({ path: path.join(OUT, name), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
  }
  await browser.close();
})();
