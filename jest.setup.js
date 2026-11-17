// Native modules that have no implementation under Jest.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

// Wi-Fi table natives (src/lan): nothing on the network under Jest.
jest.mock("react-native-zeroconf", () => {
  class Zeroconf {
    publishService() {
      return Promise.resolve({ name: "x", fullName: "", host: "", port: 0, addresses: [], txt: {} });
    }
    unpublishService() {
      return Promise.resolve(null);
    }
    updateService() {
      return Promise.resolve({});
    }
    removeDeviceListeners() {}
    on() {
      return this;
    }
  }
  return {
    __esModule: true,
    default: Zeroconf,
    useZeroconf: () => ({ services: [], isScanning: true, error: null, stop() {}, restart() {} }),
  };
});
jest.mock("react-native-tcp-socket", () => ({
  __esModule: true,
  default: {
    createServer: () => {
      const server = {
        listen(_options, cb) {
          if (cb) cb();
          return server;
        },
        close() {},
        on() {},
        once() {},
        off() {},
        address: () => ({ port: 47676, family: "IPv4", address: "0.0.0.0" }),
      };
      return server;
    },
    createConnection: () => ({ on() {}, once() {}, off() {}, destroy() {}, write() {}, setEncoding() {}, setNoDelay() {}, setKeepAlive() {} }),
  },
}));
jest.mock("expo-network", () => ({ getIpAddressAsync: () => Promise.resolve("192.168.1.40") }));
jest.mock("expo-camera", () => ({
  CameraView: () => null,
  useCameraPermissions: () => [{ granted: false, canAskAgain: true }, () => Promise.resolve({ granted: false }), () => Promise.resolve({ granted: false })],
}));

// Oczko Pro natives: no store and no ads under Jest (tests inject fakes).
jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    configure() {},
    getCustomerInfo: async () => ({ entitlements: { active: {} } }),
    getOfferings: async () => ({ current: null }),
    purchasePackage: async () => ({ customerInfo: { entitlements: { active: {} } } }),
    restorePurchases: async () => ({ entitlements: { active: {} } }),
    showManageSubscriptions: async () => {},
    syncPurchasesForResult: async () => ({ customerInfo: { entitlements: { active: {} } } }),
    presentCodeRedemptionSheet: async () => {},
    invalidateCustomerInfoCache: async () => {},
    addCustomerInfoUpdateListener() {},
    removeCustomerInfoUpdateListener() {},
  },
  PACKAGE_TYPE: { ANNUAL: "ANNUAL", LIFETIME: "LIFETIME" },
}));
jest.mock("react-native-google-mobile-ads", () => ({
  __esModule: true,
  default: () => ({ initialize: async () => [] }),
  AdsConsent: {
    gatherConsent: async () => ({ canRequestAds: false }),
    getUserChoices: async () => ({ selectPersonalisedAds: false }),
    showPrivacyOptionsForm: async () => ({}),
    getConsentInfo: async () => ({ canRequestAds: false, privacyOptionsRequirementStatus: "NOT_REQUIRED" }),
  },
  AdsConsentPrivacyOptionsRequirementStatus: { REQUIRED: "REQUIRED", NOT_REQUIRED: "NOT_REQUIRED", UNKNOWN: "UNKNOWN" },
  RewardedAd: { createForAdRequest: () => ({ addAdEventListener: () => () => {}, load() {}, show: async () => {} }) },
  RewardedAdEventType: { LOADED: "rewarded_loaded", EARNED_REWARD: "rewarded_earned_reward" },
  AdEventType: { CLOSED: "closed", ERROR: "error" },
  TestIds: { REWARDED: "test-rewarded" },
}));
