// Renders the in-app art (icons; later the table, card back and portraits)
// with headless Chromium into assets/game:
//   node tools/render-game-art.js
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "../assets/game");

const html = (w, h, body) => `<!doctype html><html><head><style>
  html, body { margin: 0; background: transparent; }
  .box { width: ${w}px; height: ${h}px; position: relative; overflow: hidden; }
</style></head><body><div class="box">${body}</div></body></html>`;

const svg = (w, h, vb, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${body}</svg>`;

// Line icons drawn at 4x, white: tinted in the app (tintColor).
const icon = (body, sw = 2) =>
  svg(96, 96, "0 0 24 24", `<g fill="none" stroke="#FFFFFF" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`);

const shots = [
  ["icon-menu.png", icon(`<path d="M4 7h16M4 12h16M4 17h16"/>`, 2.4)],
  ["icon-cards.png", icon(`<rect x="4" y="3" width="12" height="17" rx="2"/><path d="M9 7h7M20 7v12a2 2 0 0 1-2 2H9"/>`)],
  ["icon-person.png", icon(`<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>`)],
  ["icon-book.png", icon(`<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M8 9h8M8 13h6"/>`)],
  ["icon-gear.png", icon(`<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>`)],
  ["icon-wifi.png", icon(`<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1" fill="#FFFFFF"/>`)],
  ["icon-target.png", icon(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="#FFFFFF"/>`)],
  ["icon-history.png", icon(`<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 7v5l3 2"/>`)],
  ["icon-chevron.png", icon(`<path d="M9 5l7 7-7 7"/>`, 2.4)],
].map(([name, body]) => [name, 96, 96, body]);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, w, h, body] of shots) {
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(html(w, h, body));
    const jpg = name.endsWith(".jpg");
    await p.screenshot({
      path: path.join(OUT, name),
      clip: { x: 0, y: 0, width: w, height: h },
      ...(jpg ? { type: "jpeg", quality: 86 } : { omitBackground: true }),
    });
    await p.close();
  }
  await browser.close();
})();
