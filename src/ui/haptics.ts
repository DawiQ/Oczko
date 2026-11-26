// Haptic feedback. Never throws: a device without a vibration motor (or a
// test without the native module) simply gets none. Can be switched off in
// the settings (setHapticsEnabled).
import * as Haptics from "expo-haptics";

let enabled = true;

export function setHapticsEnabled(on: boolean): void {
  enabled = on;
}

const safe = (f: () => Promise<void> | undefined) => {
  if (!enabled) return;
  try {
    Promise.resolve(f()).catch(() => {});
  } catch {
    // no haptics here
  }
};

export const haptic = {
  /** A choice in a list or a toggle. */
  select: () => safe(() => Haptics.selectionAsync()),
  /** "Dobieram": a card comes to the hand. */
  hit: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** "Starczy". */
  stand: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Your turn has come. */
  turn: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** "Fura!" — over 21. */
  bust: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  /** "Perskie oczko!" or a won round / match. */
  win: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
