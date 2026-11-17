// Sound effects (synthesised by tools/render-sounds.py). Loaded once at start;
// playing never throws and never waits. Respects the phone's silent switch and
// mixes with other audio. Can be switched off in the settings.
import type { AudioPlayer } from "expo-audio";

const FILES = {
  hit: require("../../assets/sounds/hit.wav"),
  deal: require("../../assets/sounds/deal.wav"),
  stand: require("../../assets/sounds/stand.wav"),
  turn: require("../../assets/sounds/turn.wav"),
  bust: require("../../assets/sounds/bust.wav"),
  persian: require("../../assets/sounds/persian.wav"),
  win: require("../../assets/sounds/win.wav"),
  end: require("../../assets/sounds/end.wav"),
};

export type SoundName = keyof typeof FILES;

const loaded: Partial<Record<SoundName, AudioPlayer>> = {};
let enabled = true;
let started = false;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

/** Loads the sounds (once). A missing native module just means silence. */
export async function initSounds(): Promise<void> {
  if (started) return;
  started = true;
  try {
    // Loaded lazily: the module needs its native half (absent in tests).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAudioPlayer, setAudioModeAsync } = require("expo-audio") as typeof import("expo-audio");
    await setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: "mixWithOthers",
      shouldPlayInBackground: false,
      allowsRecording: false,
    });
    for (const name of Object.keys(FILES) as SoundName[]) loaded[name] = createAudioPlayer(FILES[name]);
  } catch {
    // no sound on this device / in tests
  }
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  const p = loaded[name];
  if (!p) return;
  try {
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // ignore
  }
}
