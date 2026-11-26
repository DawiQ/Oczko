// Release builds without R8 (shrinking and obfuscation). The Expo SDK 58
// template turns R8 on (android.enableMinifyInReleaseBuilds=true), and with it
// the release app crashed at start: WorkManager (pulled in by Google Mobile
// Ads) could not create its Room database (androidx.work.impl.WorkDatabase),
// which Room finds by reflection. Several native modules here (Wi‑Fi sockets,
// mDNS) ship no keep rules either, so the app goes without R8 — a few MB
// larger, the same code as in the tested debug build.
//
// Three layers, because a Gradle property can be overridden from outside the
// project (~/.gradle/gradle.properties, -P, ORG_GRADLE_PROJECT_*), and 1.0.4
// still came out minified with only the first one:
//  1. gradle.properties: R8 and resource shrinking off;
//  2. app/build.gradle: `minifyEnabled false` / `shrinkResources false`
//     written into the release build type, whatever the properties say;
//  3. proguard-rules.pro: keep rules for Room and WorkManager, in case R8
//     runs anyway (another build path, a later template).
const { withAppBuildGradle, withDangerousMod, withGradleProperties } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

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

/** app/build.gradle with R8 and resource shrinking off in every build type
 *  (`minifyEnabled <anything>` → `minifyEnabled false`). Idempotent. */
function gradleMinifyOff(gradle) {
  return gradle
    .replace(/^(\s*)minifyEnabled\s+(?!false\b).+$/gm, "$1minifyEnabled false // oczko: no R8 (plugins/withNoMinify.js)")
    .replace(/^(\s*)shrinkResources\s+(?!false\b).+$/gm, "$1shrinkResources false // oczko: no R8 (plugins/withNoMinify.js)");
}

const KEEP_MARKER = "# oczko: keep rules (plugins/withNoMinify.js)";

/** Room finds `<Database>_Impl` by name; WorkManager's initializer and workers
 *  are created by reflection. */
const KEEP_RULES = `
${KEEP_MARKER}
-keep class * extends androidx.room.RoomDatabase { <init>(); }
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class * extends androidx.work.ListenableWorker { <init>(...); }
-keep class * extends androidx.startup.Initializer { <init>(); }
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**
`;

/** proguard-rules.pro with the keep rules (appended once). */
function withKeepRules(rules) {
  return rules.includes(KEEP_MARKER) ? rules : `${rules.trimEnd()}\n${KEEP_RULES}`;
}

const withNoMinify = (config) => {
  config = withGradleProperties(config, (c) => {
    c.modResults = withMinifyOff(c.modResults);
    return c;
  });
  config = withAppBuildGradle(config, (c) => {
    if (c.modResults.language === "groovy") c.modResults.contents = gradleMinifyOff(c.modResults.contents);
    return c;
  });
  return withDangerousMod(config, [
    "android",
    (c) => {
      const file = path.join(c.modRequest.platformProjectRoot, "app", "proguard-rules.pro");
      const rules = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
      fs.writeFileSync(file, withKeepRules(rules));
      return c;
    },
  ]);
};

module.exports = withNoMinify;
module.exports.withMinifyOff = withMinifyOff;
module.exports.gradleMinifyOff = gradleMinifyOff;
module.exports.withKeepRules = withKeepRules;
