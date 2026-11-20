// Hardware the app can do without. Android infers required features from the
// manifest: `orientation: "portrait"` (screenOrientation) implies
// android.hardware.screen.portrait, and the Wi‑Fi permissions (the Wi‑Fi table:
// ACCESS_WIFI_STATE, CHANGE_WIFI_MULTICAST_STATE) imply android.hardware.wifi.
// Google Play then hides the app from devices without them (tablets, desktops,
// Google Play Games on PC, Android XR). The game itself needs neither: without
// Wi‑Fi only the game with friends is unavailable, and a landscape-only screen
// shows the portrait layout letterboxed. So both are declared optional here.
// The camera (QR code to join a table) is optional the same way.
const { withAndroidManifest } = require("expo/config-plugins");

/** Features declared with android:required="false". */
const OPTIONAL_FEATURES = [
  "android.hardware.screen.portrait",
  "android.hardware.wifi",
  "android.hardware.camera",
  "android.hardware.camera.autofocus",
];

/** The manifest with every feature of `names` present and optional (pure: a new object). */
function withFeaturesOptional(androidManifest, names = OPTIONAL_FEATURES) {
  const manifest = { ...androidManifest.manifest };
  const features = (manifest["uses-feature"] ?? []).map((f) => ({ ...f, $: { ...f.$ } }));
  for (const name of names) {
    const found = features.find((f) => f.$["android:name"] === name);
    if (found) found.$["android:required"] = "false";
    else features.push({ $: { "android:name": name, "android:required": "false" } });
  }
  manifest["uses-feature"] = features;
  // tools:replace needs the tools namespace (a library may declare a feature required).
  manifest.$ = { "xmlns:tools": "http://schemas.android.com/tools", ...manifest.$ };
  for (const f of features) if (names.includes(f.$["android:name"])) f.$["tools:replace"] = "android:required";
  return { ...androidManifest, manifest };
}

const withOptionalFeatures = (config) =>
  withAndroidManifest(config, (c) => {
    c.modResults = withFeaturesOptional(c.modResults);
    return c;
  });

module.exports = withOptionalFeatures;
module.exports.withFeaturesOptional = withFeaturesOptional;
module.exports.OPTIONAL_FEATURES = OPTIONAL_FEATURES;
