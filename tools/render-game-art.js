// Renders the in-app art (icons, the felt and the wooden rails; portraits later)
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

// --- Table ------------------------------------------------------------------

// Green cloth of a home card table (no lettering, no lines).
const felt = `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%, #1F7358 0%, #154838 55%, #0B2A20 100%)"></div>
<div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.035) 1.3px, transparent 1.5px);background-size:7px 7px"></div>`;

// Wood: a gradient plus stretched turbulence for the grain.
const wood = (w, h, from, to, edge) =>
  svg(w, h, `0 0 ${w} ${h}`, `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.09" numOctaves="3" seed="11"/>
      <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.07  0 0 0 0 0.03  0 0 0 1.4 -0.45"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.55"/>
  ${edge === "bottom"
    ? `<rect y="${h - 4}" width="${w}" height="4" fill="rgba(0,0,0,.35)"/><rect y="${h - 7}" width="${w}" height="3" fill="rgba(255,220,170,.10)"/>`
    : `<rect width="${w}" height="3" fill="rgba(255,220,170,.16)"/><rect y="3" width="${w}" height="3" fill="rgba(0,0,0,.18)"/>`}`);

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
shots.push(
  ["felt.jpg", 780, 1688, felt],
  ["wood-top.jpg", 780, 180, wood(780, 180, "#6B4528", "#4E321D", "bottom")],
  ["wood-bottom.jpg", 780, 240, wood(780, 240, "#5A3A22", "#3E2815", "top")]
);

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
