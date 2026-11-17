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
