#!/usr/bin/env node
// Builds the app for a phone: node build.js [--ios] [options]
//
// With no options in a terminal it asks what to build: pick with the arrow
// keys (or the number) and Enter; it then shows the same command with options.
//
// Android (any computer with the Android SDK):
//   node build.js            APK -> dist/oczko-<version>.apk
//   node build.js --install  ...and install it on a connected phone (adb)
//   node build.js --aab      Play Store bundle (.aab) instead of an APK
//   node build.js --clean    regenerate android/ from scratch
//
// iOS, locally (a Mac with Xcode; your Apple team signs the app):
//   node build.js --ios --team ABCDE12345          IPA -> dist/oczko-<version>.ipa
//   node build.js --ios --team ABCDE12345 --install   ...and install it on the
//                                                  iPhone connected by cable
//   --method development | ad-hoc | app-store      how the IPA is signed
//                                                  (default development)
//   --device <UDID or name>                        with several iPhones connected
//   --clean                                        regenerate ios/ from scratch
// The team id can also come from PAN_IOS_TEAM_ID. A free Apple ID works with
// --method development (the app then runs for 7 days on your own iPhone); a
// paid Apple Developer account also signs ad-hoc / App Store builds. The
// iPhone needs Developer Mode on (Settings -> Privacy & Security).
//
// iOS in the cloud (any computer, paid Apple Developer account; EAS asks for
// the Apple login and makes the certificates the first time):
//   node build.js --ios --eas                      build -> an install link / QR
//   node build.js --ios --eas --register-device    first register your iPhone
//   --profile <name>                               eas.json profile (default preview)
//
// Steps: npm install (when node_modules is missing or older than
// package.json) -> expo prebuild (incremental, so app.json changes —
// version, icons, permissions — always reach the build) -> gradle
// assembleRelease / bundleRelease, or xcodebuild archive + export -> copy the
// result to dist/.
//
// Android signing: with the upload key in ~/.gradle/gradle.properties
// (PAN_UPLOAD_STORE_FILE, PAN_UPLOAD_STORE_PASSWORD, PAN_UPLOAD_KEY_ALIAS,
// PAN_UPLOAD_KEY_PASSWORD — see plugins/withReleaseSigning.js) the build is
// signed with it; otherwise with the debug key (testing only — --aab refuses).
// Every upload to Google Play needs a higher android.versionCode in app.json.
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");

const root = __dirname;
const win = process.platform === "win32";
const mac = process.platform === "darwin";
// Set in main() (from the command line, or from the menu).
let argv = [];
let args = new Set();
let ios = false;
let aab = false;
let clean = false;
let install = false;
let t0 = Date.now();

/** The value after `--name` (or undefined). */
function option(name) {
  const i = argv.indexOf(name);
  if (i < 0) return undefined;
  const v = argv[i + 1];
  if (!v || v.startsWith("--")) fail(`${name} needs a value`);
  return v;
}

function run(cmd, cmdArgs, cwd = root) {
  console.log(`\n> ${cmd} ${cmdArgs.join(" ")}`);
  const r = spawnSync(cmd, cmdArgs, { cwd, stdio: "inherit", shell: win });
  if (r.error) fail(`${cmd}: ${r.error.message}`);
  if (r.status !== 0) fail(`${cmd} failed (exit ${r.status})`);
}

/** Run and capture stdout (null if the command fails). */
function capture(cmd, cmdArgs, cwd = root) {
  const r = spawnSync(cmd, cmdArgs, { cwd, encoding: "utf8", shell: win });
  return r.status === 0 ? r.stdout : null;
}

function fail(msg) {
  console.error(`\nBuild failed: ${msg}`);
  process.exit(1);
}

/** Is the upload key configured (Gradle user properties or environment)? */
function hasUploadKey() {
  if (process.env.ORG_GRADLE_PROJECT_PAN_UPLOAD_STORE_FILE) return true;
  const home = process.env.GRADLE_USER_HOME || path.join(os.homedir(), ".gradle");
  try {
    return /^\s*PAN_UPLOAD_STORE_FILE\s*=/m.test(fs.readFileSync(path.join(home, "gradle.properties"), "utf8"));
  } catch {
    return false;
  }
}

/** npm install when node_modules is missing or older than package.json. */
function installDeps() {
  // npm rewrites node_modules/.package-lock.json on every install.
  const installed = path.join(root, "node_modules", ".package-lock.json");
  const mtime = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);
  const stale =
    !fs.existsSync(installed) ||
    Math.max(mtime(path.join(root, "package.json")), mtime(path.join(root, "package-lock.json"))) > mtime(installed);
  if (stale) run("npm", ["install"]);
}

function finish(out, note) {
  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
  const secs = Math.round((Date.now() - t0) / 1000);
  console.log(`\nDone in ${secs} s: ${path.relative(root, out)} (${mb} MB), ${note}`);
}

const { version, android } = require("./app.json").expo;
const distDir = path.join(root, "dist");

// prebuild would otherwise stop to ask about uncommitted git changes.
process.env.EXPO_NO_GIT_STATUS = "1";

async function main() {
  argv = process.argv.slice(2);
  if (argv.length === 0 && process.stdin.isTTY && process.stdout.isTTY) argv = await menu();
  args = new Set(argv);
  ios = args.has("--ios");
  aab = args.has("--aab");
  clean = args.has("--clean");
  install = args.has("--install");
  t0 = Date.now();
  if (ios) buildIos();
  else buildAndroid();
}


// ---------------------------------------------------------------------------
// The menu (no options given)
// ---------------------------------------------------------------------------

const C = { dim: "\x1b[2m", accent: "\x1b[36m", bold: "\x1b[1m", off: "\x1b[0m" };

/** Pick one of `items` with the arrow keys (or its number) and Enter. */
function choose(title, items, initial = 0) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    let i = initial;
    const lines = () => items.length;
    const draw = (first) => {
      if (!first) stdout.write(`\x1b[${lines()}A`);
      items.forEach((it, k) => {
        const on = k === i;
        const label = `${k + 1}. ${it.label}`;
        // One terminal line per item (a wrapped line would break the redraw).
        const room = (stdout.columns || 80) - 1 - (label.length + 2) - 2;
        const text = it.note && room >= 8 ? (it.note.length > room ? `${it.note.slice(0, room - 1)}…` : it.note) : "";
        const note = text ? `  ${C.dim}${text}${C.off}` : "";
        stdout.write(`\x1b[2K${on ? `${C.accent}${C.bold}❯ ${label}${C.off}` : `  ${label}`}${note}\n`);
      });
    };
    const cleanup = () => {
      stdin.off("keypress", onKey);
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\x1b[?25h");
    };
    const onKey = (str, key = {}) => {
      if ((key.ctrl && key.name === "c") || key.name === "escape" || str === "q") {
        cleanup();
        stdout.write("\nPrzerwano.\n");
        process.exit(130);
      }
      if (key.name === "up" || str === "k") i = (i - 1 + items.length) % items.length;
      else if (key.name === "down" || str === "j" || key.name === "tab") i = (i + 1) % items.length;
      else if (/^[1-9]$/.test(str || "") && Number(str) <= items.length) i = Number(str) - 1;
      else if (key.name === "return" || key.name === "enter") {
        cleanup();
        stdout.write(`\x1b[${lines()}A\x1b[J  ${C.accent}✓ ${items[i].label}${C.off}\n`);
        return resolve(items[i].value);
      } else return;
      draw(false);
    };
    stdout.write(`\n${C.bold}${title}${C.off} ${C.dim}(strzałki, Enter; Esc — wyjście)${C.off}\n\x1b[?25l`);
    draw(true);
    readline.emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("keypress", onKey);
  });
}

/** A line of text (Enter with nothing keeps `fallback`). */
function ask(question, fallback = "") {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const hint = fallback ? ` ${C.dim}[${fallback}]${C.off}` : "";
    rl.question(`${C.bold}${question}${C.off}${hint}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || fallback);
    });
  });
}

/** What to build, as command-line options. */
async function menu() {
  const onMac = mac ? undefined : "tylko na Macu";
  const what = await choose("Co budujemy?", [
    { label: "Android — APK", note: "dist/oczko-<wersja>.apk", value: [] },
    { label: "Android — APK i instalacja na telefonie", note: "adb, telefon na kablu", value: ["--install"] },
    { label: "Android — paczka do Google Play (AAB)", note: "wymaga klucza przesyłania", value: ["--aab"] },
    { label: "iOS — IPA", note: onMac ?? "Xcode, Twój zespół Apple", value: ["--ios"] },
    { label: "iOS — IPA i instalacja na iPhonie", note: onMac ?? "iPhone na kablu", value: ["--ios", "--install"] },
    { label: "iOS w chmurze (EAS)", note: "link / QR do instalacji, płatne konto Apple", value: ["--ios", "--eas"] },
    { label: "iOS w chmurze — najpierw rejestracja iPhone'a", note: "pierwszy raz na danym telefonie", value: ["--ios", "--eas", "--register-device"] },
  ]);
  const out = [...what];
  const local = !out.includes("--eas");
  if (out.includes("--ios") && local) {
    if (!mac) return out; // the build explains what to do instead
    if (!process.env.PAN_IOS_TEAM_ID) {
      const team = await ask("Identyfikator zespołu Apple (Team ID)");
      if (team) out.push("--team", team);
    }
    const method = await choose("Podpis", [
      { label: "development", note: "Twoje iPhone'y (darmowe Apple ID: 7 dni)", value: "development" },
      { label: "ad-hoc", note: "zarejestrowane iPhone'y, płatne konto", value: "ad-hoc" },
      { label: "app-store", note: "do App Store / TestFlight", value: "app-store" },
    ]);
    if (method !== "development") out.push("--method", method);
  }
  if (local) {
    const fresh = await choose(`Katalog ${out.includes("--ios") ? "ios/" : "android/"}`, [
      { label: "Użyj istniejącego", note: "szybciej", value: false },
      { label: "Wygeneruj od nowa (--clean)", note: "po zmianach w bibliotekach natywnych", value: true },
    ]);
    if (fresh) out.push("--clean");
  }
  console.log(`\n${C.dim}To samo bez menu:${C.off} node build.js ${out.join(" ")}`.trimEnd());
  return out;
}

// ---------------------------------------------------------------------------
// Android
// ---------------------------------------------------------------------------

function buildAndroid() {
  const androidDir = path.join(root, "android");
  if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT && !fs.existsSync(path.join(androidDir, "local.properties")))
    console.warn("Warning: ANDROID_HOME is not set — Gradle may not find the Android SDK.");

  const signed = hasUploadKey();
  if (aab && !signed)
    fail(
      "a Play Store bundle must be signed with your upload key.\n" +
        "Add PAN_UPLOAD_STORE_FILE / PAN_UPLOAD_STORE_PASSWORD / PAN_UPLOAD_KEY_ALIAS /\n" +
        "PAN_UPLOAD_KEY_PASSWORD to ~/.gradle/gradle.properties (see plugins/withReleaseSigning.js)."
    );

  installDeps();
  run("npx", ["expo", "prebuild", "-p", "android", "--no-install", ...(clean ? ["--clean"] : [])]);

  const gradlew = win ? "gradlew.bat" : "./gradlew";
  if (!win) fs.chmodSync(path.join(androidDir, "gradlew"), 0o755);
  run(gradlew, [aab ? "bundleRelease" : "assembleRelease"], androidDir);

  const built = aab
    ? path.join(androidDir, "app/build/outputs/bundle/release/app-release.aab")
    : path.join(androidDir, "app/build/outputs/apk/release/app-release.apk");
  if (!fs.existsSync(built)) fail(`no output at ${built}`);

  fs.mkdirSync(distDir, { recursive: true });
  const out = path.join(distDir, `oczko-${version}.${aab ? "aab" : "apk"}`);
  fs.copyFileSync(built, out);

  if (install) {
    if (aab) fail("--install works with an APK only (drop --aab)");
    run("adb", ["install", "-r", out]);
  }

  finish(out, `version ${version} (${android?.versionCode ?? 1})`);
  if (!signed) console.log("Signed with the DEBUG key — fine for your own phone, not for Google Play.");
}

// ---------------------------------------------------------------------------
// iOS
// ---------------------------------------------------------------------------

function buildIos() {
  if (args.has("--eas")) return buildIosEas();
  if (aab) fail("--aab is for Android");
  if (process.platform !== "darwin")
    fail(
      "an iOS build needs a Mac with Xcode.\n" +
        "On this computer use the cloud build instead: node build.js --ios --eas\n" +
        "(a paid Apple Developer account; the first run registers your iPhone with --register-device)."
    );
  if (!capture("xcodebuild", ["-version"])) fail("xcodebuild not found — install Xcode from the App Store and run it once.");

  const team = option("--team") || process.env.PAN_IOS_TEAM_ID;
  if (!team)
    fail(
      "say which Apple team signs the app: --team <TEAM ID> (or PAN_IOS_TEAM_ID).\n" +
        "Xcode -> Settings -> Accounts: add your Apple ID; the team id is on developer.apple.com -> Membership\n" +
        "(a free Apple ID: open the account in Xcode, the id of the Personal Team shows in signing errors and in\n" +
        "Keychain Access as the 'Apple Development: ... (TEAM ID)' certificate)."
    );
  const methods = { development: "development", "ad-hoc": "ad-hoc", "app-store": "app-store" };
  const method = option("--method") || "development";
  if (!methods[method]) fail(`--method must be one of: ${Object.keys(methods).join(", ")}`);

  installDeps();
  // prebuild also runs `pod install`.
  run("npx", ["expo", "prebuild", "-p", "ios", ...(clean ? ["--clean"] : [])]);

  const iosDir = path.join(root, "ios");
  const workspace = fs.readdirSync(iosDir).find((f) => f.endsWith(".xcworkspace"));
  if (!workspace) fail("no .xcworkspace in ios/ — did `pod install` fail?");
  const scheme = workspace.replace(/\.xcworkspace$/, "");
  const buildDir = path.join(iosDir, "build");
  const archive = path.join(buildDir, `${scheme}.xcarchive`);
  const exportDir = path.join(buildDir, "export");
  fs.rmSync(exportDir, { recursive: true, force: true });

  run(
    "xcodebuild",
    [
      "-workspace", workspace,
      "-scheme", scheme,
      "-configuration", "Release",
      "-destination", "generic/platform=iOS",
      "-archivePath", archive,
      "-allowProvisioningUpdates",
      `DEVELOPMENT_TEAM=${team}`,
      "CODE_SIGN_STYLE=Automatic",
      "archive",
    ],
    iosDir
  );

  const plist = path.join(buildDir, "ExportOptions.plist");
  fs.writeFileSync(
    plist,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>${methods[method]}</string>
  <key>teamID</key><string>${team}</string>
  <key>signingStyle</key><string>automatic</string>
  <key>compileBitcode</key><false/>
</dict>
</plist>
`
  );
  run(
    "xcodebuild",
    ["-exportArchive", "-archivePath", archive, "-exportPath", exportDir, "-exportOptionsPlist", plist, "-allowProvisioningUpdates"],
    iosDir
  );

  const ipa = fs.existsSync(exportDir) && fs.readdirSync(exportDir).find((f) => f.endsWith(".ipa"));
  if (!ipa) fail(`no .ipa in ${exportDir}`);
  fs.mkdirSync(distDir, { recursive: true });
  const out = path.join(distDir, `oczko-${version}.ipa`);
  fs.copyFileSync(path.join(exportDir, ipa), out);

  if (install) installOnIphone(path.join(archive, "Products", "Applications"));

  finish(out, `version ${version}, ${method}, team ${team}`);
  if (method === "development")
    console.log("Development signing: it installs on the iPhones of your team (a free Apple ID: yours, for 7 days).");
}

/** Install the archived .app on the iPhone connected by cable (Xcode 15+). */
function installOnIphone(appsDir) {
  const app = fs.existsSync(appsDir) && fs.readdirSync(appsDir).find((f) => f.endsWith(".app"));
  if (!app) fail(`no .app in ${appsDir}`);
  let device = option("--device") || process.env.PAN_IOS_DEVICE;
  if (!device) {
    const json = path.join(os.tmpdir(), `oczko-devices-${process.pid}.json`);
    capture("xcrun", ["devicectl", "list", "devices", "--json-output", json]);
    try {
      const list = JSON.parse(fs.readFileSync(json, "utf8")).result?.devices ?? [];
      const phones = list.filter(
        (d) => d.hardwareProperties?.platform === "iOS" && d.connectionProperties?.tunnelState === "connected"
      );
      if (phones.length > 1) fail(`several iPhones are connected — pick one with --device: ${phones.map((d) => d.deviceProperties?.name).join(", ")}`);
      device = phones[0]?.identifier;
    } catch {
      device = undefined;
    } finally {
      fs.rmSync(json, { force: true });
    }
  }
  if (!device) fail("no iPhone connected — plug it in, unlock it, trust this Mac, and turn on Developer Mode.");
  run("xcrun", ["devicectl", "device", "install", "app", "--device", device, path.join(appsDir, app)]);
}

/** The cloud build (EAS): any computer, a paid Apple Developer account. */
function buildIosEas() {
  installDeps();
  const profile = option("--profile") || "preview";
  if (args.has("--register-device")) run("npx", ["eas-cli", "device:create"]);
  run("npx", ["eas-cli", "build", "--platform", "ios", "--profile", profile]);
  console.log(
    `\nDone in ${Math.round((Date.now() - t0) / 1000)} s. Open the link (or scan the QR code) above on the iPhone to install.\n` +
      "Only iPhones registered for the build can install it: add one with --register-device and build again."
  );
}

// Last: everything above (the menu's constants too) is defined by now.
main().catch((e) => fail(e && e.message ? e.message : String(e)));
