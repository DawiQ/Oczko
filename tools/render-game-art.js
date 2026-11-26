// Renders the in-app art (icons, the felt, the wooden rails, the portraits)
// with headless Chromium into assets/game:
//   node tools/render-game-art.js
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "../assets/game");
const FONT = path.join(__dirname, "../node_modules/@expo-google-fonts/fraunces/800ExtraBold/Fraunces_800ExtraBold.ttf");
const font = "data:font/ttf;base64," + fs.readFileSync(FONT).toString("base64");

const html = (w, h, body) => `<!doctype html><html><head><style>
  @font-face { font-family: Fraunces; src: url("${font}"); }
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

// --- Portraits (same drawings as the design mockups) -------------------------

const PEOPLE = {
  zosia: { bg: "#7FD3E6", shirt: "#E05A7A" },
  kuba: { bg: "#6FCF97", shirt: "#2F6E4E" },
  hela: { bg: "#B9D86A", shirt: "#8A5A9E" },
  witek: { bg: "#FF8FA3", shirt: "#2E3F5C" },
  profesor: { bg: "#7FA8FF", shirt: "#4A3B2E" },
  ola: { bg: "#F0B44C", shirt: "#3B5B8A" },
  marek: { bg: "#F2785C", shirt: "#5B4636" },
  hrabia: { bg: "#B39DFF", shirt: "#2A2140" },
};

function face(who) {
  const p = PEOPLE[who];
  const base = `
    ${who === "ola" ? `<path d="M27 50 Q26 22 50 20 Q74 22 73 50 L76 84 Q50 92 24 84 Z" fill="#9A4A2B"/>` : ""}
    ${who === "zosia" ? `<circle cx="24" cy="44" r="9" fill="#C9772E"/><circle cx="76" cy="44" r="9" fill="#C9772E"/>
      <path d="M17 36 L24 41 L17 46 Z M31 36 L24 41 L31 46 Z" fill="#E05A7A"/><path d="M69 36 L76 41 L69 46 Z M83 36 L76 41 L83 46 Z" fill="#E05A7A"/>` : ""}
    ${who === "hela" ? `<circle cx="50" cy="20" r="10" fill="#D9D9DE"/>` : ""}
    <path d="M12 100 Q15 73 50 71 Q85 73 88 100 Z" fill="${p.shirt}"/>
    <rect x="43" y="58" width="14" height="16" rx="5" fill="#E7B48C"/>
    <ellipse cx="50" cy="45" rx="19" ry="22" fill="#F2C9A0"/>
    <circle cx="43" cy="45" r="2.3" fill="#1B232C"/>
    <circle cx="57" cy="45" r="2.3" fill="#1B232C"/>
    <path d="M44 56 Q50 60 56 56" stroke="#8A4A3A" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  const extra = {
    zosia: `
      <path d="M31 41 Q31 22 50 21 Q69 22 69 41 Q64 30 56 32 Q50 27 44 32 Q36 30 31 41 Z" fill="#C9772E"/>
      <circle cx="40" cy="52" r="3" fill="#F2A1A1" opacity="0.8"/><circle cx="60" cy="52" r="3" fill="#F2A1A1" opacity="0.8"/>
      <path d="M43 55 Q50 62 57 55" stroke="#8A4A3A" stroke-width="2.2" fill="#fff" stroke-linecap="round"/>`,
    hela: `
      <path d="M31 42 Q31 25 50 25 Q69 25 69 42 Q64 32 50 32 Q36 32 31 42 Z" fill="#D9D9DE"/>
      <circle cx="43" cy="45" r="5.5" fill="none" stroke="#7A5A3A" stroke-width="1.8"/>
      <circle cx="57" cy="45" r="5.5" fill="none" stroke="#7A5A3A" stroke-width="1.8"/>
      <path d="M48.5 45 L51.5 45" stroke="#7A5A3A" stroke-width="1.8"/>
      <path d="M30 86 Q50 76 70 86" stroke="#F0B44C" stroke-width="2" fill="none"/>
      <circle cx="50" cy="80" r="2" fill="#F0B44C"/>`,
    witek: `
      <path d="M31 40 Q30 21 50 20 Q70 21 69 40 Q64 28 56 30 Q60 24 50 25 Q42 24 44 30 Q36 28 31 40 Z" fill="#2B2B2B"/>
      <path d="M28 44 Q28 18 50 17 Q72 18 72 44" stroke="#1B232C" stroke-width="4" fill="none"/>
      <rect x="23" y="40" width="9" height="14" rx="4" fill="#1B232C"/><rect x="68" y="40" width="9" height="14" rx="4" fill="#1B232C"/>
      <path d="M36 82 L44 74 M64 82 L56 74" stroke="#FBF7EE" stroke-width="2.2" stroke-linecap="round"/>`,
    profesor: `
      <path d="M31 46 Q30 34 35 30 Q34 40 37 44 Z M69 46 Q70 34 65 30 Q66 40 63 44 Z" fill="#E8E8EC"/>
      <path d="M36 30 Q50 22 64 30" stroke="#F2C9A0" stroke-width="3" fill="none"/>
      <circle cx="43" cy="45" r="5" fill="rgba(255,255,255,0.35)" stroke="#1B232C" stroke-width="1.8"/>
      <circle cx="57" cy="45" r="5" fill="rgba(255,255,255,0.35)" stroke="#1B232C" stroke-width="1.8"/>
      <path d="M48 45 L52 45" stroke="#1B232C" stroke-width="1.8"/>
      <path d="M42 54 Q50 52 58 54" stroke="#E8E8EC" stroke-width="3" stroke-linecap="round"/>
      <path d="M41 77 L50 81 L41 85 Z M59 77 L50 81 L59 85 Z" fill="#C8352C"/><circle cx="50" cy="81" r="2.2" fill="#9E2A22"/>`,
    kuba: `
      <path d="M31 38 Q31 20 50 19 Q69 20 69 38 Q60 31 50 31 Q40 31 31 38 Z" fill="#2F6E4E"/>
      <path d="M66 33 Q80 33 84 38 Q76 40 68 38 Z" fill="#245A3F"/>
      <path d="M33 38 Q38 33 44 35" stroke="#5A3A22" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="51" r="1" fill="#C98A64"/><circle cx="44" cy="52" r="1" fill="#C98A64"/>
      <circle cx="58" cy="52" r="1" fill="#C98A64"/><circle cx="62" cy="51" r="1" fill="#C98A64"/>`,
    ola: `
      <path d="M31 40 Q33 22 50 22 Q67 22 69 40 Q60 30 47 31 Q38 32 31 40 Z" fill="#9A4A2B"/>
      <circle cx="31" cy="54" r="2.2" fill="#F0B44C"/><circle cx="69" cy="54" r="2.2" fill="#F0B44C"/>
      <rect x="37" y="40" width="11" height="9" rx="3" fill="none" stroke="#1B232C" stroke-width="1.8"/>
      <rect x="52" y="40" width="11" height="9" rx="3" fill="none" stroke="#1B232C" stroke-width="1.8"/>
      <path d="M48 44 L52 44" stroke="#1B232C" stroke-width="1.8"/>`,
    marek: `
      <path d="M31 39 Q31 22 50 22 Q69 22 69 39 Q66 30 50 30 Q34 30 31 39 Z" fill="#8E949C"/>
      <path d="M31 46 Q32 70 50 72 Q68 70 69 46 Q66 58 58 61 Q50 63 42 61 Q34 58 31 46 Z" fill="#8E949C"/>
      <path d="M44 57 Q50 60 56 57" stroke="#F2C9A0" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M38 38 L47 39" stroke="#6B7078" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M53 39 L62 38" stroke="#6B7078" stroke-width="2.4" stroke-linecap="round"/>`,
    hrabia: `
      <rect x="34" y="5" width="32" height="22" rx="2" fill="#1B232C"/>
      <rect x="34" y="20" width="32" height="4" fill="#7B4FD1"/>
      <rect x="26" y="26" width="48" height="5" rx="2.5" fill="#1B232C"/>
      <path d="M38 54 Q44 50 50 54 Q56 50 62 54 Q66 54 67 50 Q65 58 58 57 Q54 56 50 55 Q46 56 42 57 Q35 58 33 50 Q34 54 38 54 Z" fill="#2B2B2B"/>
      <circle cx="57" cy="45" r="5.5" fill="none" stroke="#E2B04A" stroke-width="1.8"/>
      <path d="M62 47 Q70 58 66 70" stroke="#E2B04A" stroke-width="1.2" fill="none"/>`,
  }[who];
  return svg(192, 192, "0 0 100 100", `
    <defs><clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <g clip-path="url(#c)"><circle cx="50" cy="50" r="50" fill="${p.bg}"/>${base}${extra}</g>`);
}

const you = svg(192, 192, "0 0 100 100", `
  <circle cx="50" cy="50" r="50" fill="#E8925A"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
  <text x="50" y="66" text-anchor="middle" font-family="Fraunces" font-size="44" fill="#1E0F06">Ty</text>`);

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
for (const who of Object.keys(PEOPLE)) shots.push([`portrait-${who}.png`, 192, 192, face(who)]);
shots.push(["portrait-you.png", 192, 192, you]);
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
    await p.evaluate(() => document.fonts.ready);
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
