// Release signing for local builds (node build.js). The prebuild template signs
// release builds with the DEBUG key: Google Play rejects such a bundle, and an
// APK signed with it can never be updated by a properly signed one (users would
// have to uninstall and lose their saved games and statistics).
//
// This plugin adds a "release" signing config that reads the upload key from
// Gradle properties — kept OUT of the repository, in ~/.gradle/gradle.properties:
//
//   OCZKO_UPLOAD_STORE_FILE=/absolute/path/to/oczko-upload.jks
//   OCZKO_UPLOAD_STORE_PASSWORD=...
//   OCZKO_UPLOAD_KEY_ALIAS=oczko-upload
//   OCZKO_UPLOAD_KEY_PASSWORD=...
//
// Without them release builds keep the debug key (fine for testing on your own
// phone). EAS builds (eas.json) sign with EAS-managed credentials instead.
const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "// oczko: release signing";

const RELEASE_CONFIG = `
        ${MARKER}
        release {
            if (project.hasProperty('OCZKO_UPLOAD_STORE_FILE')) {
                storeFile file(OCZKO_UPLOAD_STORE_FILE)
                storePassword OCZKO_UPLOAD_STORE_PASSWORD
                keyAlias OCZKO_UPLOAD_KEY_ALIAS
                keyPassword OCZKO_UPLOAD_KEY_PASSWORD
            }
        }`;

function addReleaseSigning(gradle) {
  if (gradle.includes(MARKER)) return gradle;
  const configs = /signingConfigs\s*\{/;
  const releaseType = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;
  if (!configs.test(gradle) || !releaseType.test(gradle)) {
    console.warn("withReleaseSigning: app/build.gradle has an unexpected shape; release builds keep the debug key.");
    return gradle;
  }
  return gradle
    .replace(configs, (m) => m + RELEASE_CONFIG)
    .replace(
      releaseType,
      (_, head) =>
        head +
        "signingConfig project.hasProperty('OCZKO_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug"
    );
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language === "groovy") cfg.modResults.contents = addReleaseSigning(cfg.modResults.contents);
    return cfg;
  });
};
module.exports.addReleaseSigning = addReleaseSigning;
