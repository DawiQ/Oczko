import * as Haptics from "expo-haptics";

import { haptic, setHapticsEnabled } from "../haptics";

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Error: "error" },
}));

const all = () => Object.values(haptic).forEach((f) => f());
const calls = () =>
  (Haptics.selectionAsync as jest.Mock).mock.calls.length +
  (Haptics.impactAsync as jest.Mock).mock.calls.length +
  (Haptics.notificationAsync as jest.Mock).mock.calls.length;

describe("haptics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setHapticsEnabled(true);
  });

  it("plays every effect", () => {
    all();
    expect(calls()).toBe(Object.keys(haptic).length);
  });

  it("is silent when switched off", () => {
    setHapticsEnabled(false);
    all();
    expect(calls()).toBe(0);
  });

  it("never throws, also when the native module fails", async () => {
    (Haptics.impactAsync as jest.Mock).mockImplementationOnce(() => {
      throw new Error("no motor");
    });
    (Haptics.notificationAsync as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("no motor")));
    expect(() => all()).not.toThrow();
    await Promise.resolve();
  });
});
