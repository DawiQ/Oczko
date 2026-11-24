// Release builds without R8 (shrinking and obfuscation). The Expo SDK 58
// template turns R8 on (android.enableMinifyInReleaseBuilds=true), and with it
// the release app crashed at start: WorkManager (pulled in by Google Mobile
// Ads) could not create its Room database (androidx.work.impl.WorkDatabase),
// which Room finds by reflection. Several native modules here (Wi‑Fi sockets,
// mDNS) ship no keep rules either, so the app goes without R8 — a few MB
// larger, the same code as in the tested debug build.
const { withGradleProperties } = require("expo/config-plugins");

const OFF = {
  "android.enableMinifyInReleaseBuilds": "false",
  // Shrinking resources needs R8.
  "android.enableShrinkResourcesInReleaseBuilds": "false",
};

/** gradle.properties entries with R8 off (pure: a new list). */
function withMinifyOff(props) {
  const out = props.filter((p) => !(p.type === "property" && p.key in OFF));
  for (const [key, value] of Object.entries(OFF)) out.push({ type: "property", key, value });
  return out;
}

const withNoMinify = (config) =>
  withGradleProperties(config, (c) => {
    c.modResults = withMinifyOff(c.modResults);
    return c;
  });

module.exports = withNoMinify;
module.exports.withMinifyOff = withMinifyOff;
