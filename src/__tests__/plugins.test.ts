// Expo config plugins: Google Play must not hide the app from devices without
// Wi‑Fi, a portrait screen or a camera (the game needs none of them).
/* eslint-disable @typescript-eslint/no-require-imports */
const { withFeaturesOptional, OPTIONAL_FEATURES } = require("../../plugins/withOptionalFeatures");
const { withMinifyOff, gradleMinifyOff, withKeepRules } = require("../../plugins/withNoMinify");
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

describe("withNoMinify", () => {
  type Prop = { type: string; key?: string; value?: string };
  const value = (props: Prop[], key: string) => props.filter((p) => p.key === key).map((p) => p.value);

  it("turns R8 off in release builds (the template turns it on)", () => {
    const template: Prop[] = [
      { type: "comment", value: "Enable R8 in release builds" },
      { type: "property", key: "android.enableMinifyInReleaseBuilds", value: "true" },
      { type: "property", key: "hermesEnabled", value: "true" },
    ];
    const out: Prop[] = withMinifyOff(template);
    expect(value(out, "android.enableMinifyInReleaseBuilds")).toEqual(["false"]);
    expect(value(out, "android.enableShrinkResourcesInReleaseBuilds")).toEqual(["false"]);
    expect(value(out, "hermesEnabled")).toEqual(["true"]);
    expect(template[1].value).toBe("true");
    expect(withMinifyOff(out)).toEqual(out);
  });

  it("writes R8 off into the release build type, whatever the properties say", () => {
    const gradle = [
      "        release {",
      "            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'",
      "            shrinkResources enableShrinkResources.toBoolean()",
      "            minifyEnabled enableMinifyInReleaseBuilds",
      '            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"',
      "        }",
    ].join("\n");
    const out: string = gradleMinifyOff(gradle);
    expect(out).toMatch(/^\s*minifyEnabled false\b/m);
    expect(out).toMatch(/^\s*shrinkResources false\b/m);
    expect(out).not.toMatch(/minifyEnabled enableMinify/);
    expect(out).toContain("proguardFiles");
    expect(gradleMinifyOff(out)).toBe(out);
  });

  it("keeps Room's database and WorkManager if R8 runs anyway (added once)", () => {
    const once: string = withKeepRules("# Add any project specific keep options here:\n");
    expect(once).toContain("-keep class * extends androidx.room.RoomDatabase { <init>(); }");
    expect(once).toContain("androidx.work.impl.WorkDatabase_Impl");
    expect(withKeepRules(once)).toBe(once);
  });

  it("is in app.json", () => {
    expect(app.expo.plugins).toContain("./plugins/withNoMinify");
  });
});
