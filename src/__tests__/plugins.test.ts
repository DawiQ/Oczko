// Expo config plugins: Google Play must not hide the app from devices without
// Wi‑Fi, a portrait screen or a camera (the game needs none of them).
/* eslint-disable @typescript-eslint/no-require-imports */
const { withFeaturesOptional, OPTIONAL_FEATURES } = require("../../plugins/withOptionalFeatures");
const app = require("../../app.json");

type Feature = { $: Record<string, string> };
type Manifest = { manifest: { $: Record<string, string>; "uses-feature"?: Feature[]; [k: string]: unknown } };

const optional = (m: Manifest) =>
  (m.manifest["uses-feature"] ?? []).filter((f) => f.$["android:required"] === "false").map((f) => f.$["android:name"]);

describe("withOptionalFeatures", () => {
  it("declares Wi‑Fi, the portrait screen and the camera optional", () => {
    const out: Manifest = withFeaturesOptional({ manifest: { $: { "xmlns:android": "http://schemas.android.com/apk/res/android" } } });
    expect(optional(out).sort()).toEqual([...OPTIONAL_FEATURES].sort());
    expect(out.manifest.$["xmlns:tools"]).toBe("http://schemas.android.com/tools");
    expect(out.manifest.$["xmlns:android"]).toBe("http://schemas.android.com/apk/res/android");
  });

  it("turns a required declaration optional, keeps the others, runs twice the same", () => {
    const input: Manifest = {
      manifest: {
        $: {},
        "uses-feature": [
          { $: { "android:name": "android.hardware.wifi", "android:required": "true" } },
          { $: { "android:name": "android.hardware.touchscreen", "android:required": "false" } },
        ],
      },
    };
    const once: Manifest = withFeaturesOptional(input);
    expect(input.manifest["uses-feature"]![0].$["android:required"]).toBe("true");
    expect(once.manifest["uses-feature"]!.filter((f) => f.$["android:name"] === "android.hardware.wifi")).toHaveLength(1);
    expect(optional(once)).toContain("android.hardware.wifi");
    expect(optional(once)).toContain("android.hardware.touchscreen");
    expect(withFeaturesOptional(once)).toEqual(once);
  });

  it("is in app.json", () => {
    expect(app.expo.plugins).toContain("./plugins/withOptionalFeatures");
  });
});
