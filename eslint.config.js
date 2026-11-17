// ESLint (flat config): Expo's recommended rules for React Native + TypeScript.
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["node_modules/*", "dist/*", "android/*", "ios/*", ".expo/*", "docs/*"],
  },
  {
    // Node scripts and the Jest setup (CommonJS).
    files: ["tools/**/*.js", "jest.setup.js", "eslint.config.js"],
    languageOptions: {
      globals: { __dirname: "readonly", require: "readonly", module: "writable", process: "readonly", jest: "readonly" },
    },
  },
]);
