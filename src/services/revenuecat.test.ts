const configureMock = jest.fn();
const getCustomerInfoMock = jest.fn();
const getOfferingsMock = jest.fn();
const purchasePackageMock = jest.fn();
const restorePurchasesMock = jest.fn();
const setLogLevelMock = jest.fn();

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("react-native-purchases", () => ({
  __esModule: true,
  default: {
    LOG_LEVEL: { INFO: "INFO" },
    configure: configureMock,
    getCustomerInfo: getCustomerInfoMock,
    getOfferings: getOfferingsMock,
    purchasePackage: purchasePackageMock,
    restorePurchases: restorePurchasesMock,
    setLogLevel: setLogLevelMock,
  },
}));

describe("revenuecat service", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = "ios_key";
  });

  it("configures only once across repeated calls", async () => {
    const service = await import("./revenuecat");
    await service.initRevenueCat();
    await service.initRevenueCat();
    expect(configureMock).toHaveBeenCalledTimes(1);
  });

  it("returns false when api key missing", async () => {
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = "";
    const service = await import("./revenuecat");
    const ready = await service.initRevenueCat();
    expect(ready).toBe(false);
    expect(configureMock).not.toHaveBeenCalled();
  });

  it("purchases successfully when entitlement becomes active", async () => {
    getOfferingsMock.mockResolvedValue({
      all: {},
      current: { availablePackages: [{ identifier: "$rc_lifetime" }] },
    });
    purchasePackageMock.mockResolvedValue({
      customerInfo: { entitlements: { active: { more_players: {} } } },
    });

    const service = await import("./revenuecat");
    const result = await service.purchaseMorePlayers();
    expect(result).toEqual({ ok: true, reason: "purchased" });
  });

  it("returns cancelled when user cancels purchase", async () => {
    getOfferingsMock.mockResolvedValue({
      all: {},
      current: { availablePackages: [{ identifier: "$rc_lifetime" }] },
    });
    purchasePackageMock.mockRejectedValue({ userCancelled: true });

    const service = await import("./revenuecat");
    const result = await service.purchaseMorePlayers();
    expect(result).toEqual({ ok: false, reason: "cancelled" });
  });

  it("restores entitlement correctly", async () => {
    restorePurchasesMock.mockResolvedValue({
      entitlements: { active: { more_players: {} } },
    });
    const service = await import("./revenuecat");
    await expect(service.restoreMorePlayersPurchases()).resolves.toBe(true);
  });
});

