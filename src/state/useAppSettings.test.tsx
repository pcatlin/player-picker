import { act, renderHook, waitFor } from "@testing-library/react";

const storage: Record<string, string | null> = {};

const getItemMock = jest.fn(async (key: string) => storage[key] ?? null);
const setItemMock = jest.fn(async (key: string, value: string) => {
  storage[key] = value;
});

const initRevenueCatMock = jest.fn(async () => true);
const hasEntitlementMock = jest.fn(async () => false);
const purchaseMorePlayersMock = jest.fn(async () => ({ ok: true as const, reason: "purchased" as const }));
const restorePurchasesMock = jest.fn(async () => false);

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: getItemMock,
    setItem: setItemMock,
  },
}));

jest.mock("../services/revenuecat", () => ({
  hasMorePlayersEntitlement: hasEntitlementMock,
  initRevenueCat: initRevenueCatMock,
  purchaseMorePlayers: purchaseMorePlayersMock,
  restoreMorePlayersPurchases: restorePurchasesMock,
}));

describe("useAppSettings", () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    jest.clearAllMocks();
    hasEntitlementMock.mockResolvedValue(false);
    purchaseMorePlayersMock.mockResolvedValue({ ok: true, reason: "purchased" });
    restorePurchasesMock.mockResolvedValue(false);
  });

  const renderSettingsHook = async () => {
    const { useAppSettings } = await import("./useAppSettings");
    const hook = renderHook(() => useAppSettings());
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    return hook;
  };

  it("loads defaults when storage is empty", async () => {
    const { result, unmount } = await renderSettingsHook();
    const current = result.current;
    expect(current.isLoading).toBe(false);
    expect(current.hapticsEnabled).toBe(true);
    expect(current.isUnlocked).toBe(false);
    expect(current.playerColors).toHaveLength(8);
    unmount();
  });

  it("syncs remote entitlement to unlocked", async () => {
    hasEntitlementMock.mockResolvedValue(true);
    const { result, unmount } = await renderSettingsHook();
    expect(result.current.isUnlocked).toBe(true);
    unmount();
  });

  it("persists haptics updates", async () => {
    const { result, unmount } = await renderSettingsHook();
    await act(async () => {
      await result.current.setHapticsEnabled(false);
    });
    expect(setItemMock).toHaveBeenCalled();
    expect(result.current.hapticsEnabled).toBe(false);
    expect(setItemMock).toHaveBeenLastCalledWith(
      "player-picker-settings-v1",
      expect.stringContaining("\"hapticsEnabled\":false"),
    );
    unmount();
  });

  it("persists player color updates", async () => {
    const { result, unmount } = await renderSettingsHook();
    await act(async () => {
      await result.current.updatePlayerColor(0, "#ffffff");
    });
    expect(result.current.playerColors[0]).toBe("#ffffff");
    expect(setItemMock).toHaveBeenLastCalledWith(
      "player-picker-settings-v1",
      expect.stringContaining("#ffffff"),
    );
    unmount();
  });

  it("unlocks after successful purchase", async () => {
    const { result, unmount } = await renderSettingsHook();
    await act(async () => {
      await result.current.unlockMorePlayers();
    });
    expect(purchaseMorePlayersMock).toHaveBeenCalled();
    expect(result.current.isUnlocked).toBe(true);
    unmount();
  });

  it("restore purchases unlocks when revenuecat restore succeeds", async () => {
    restorePurchasesMock.mockResolvedValue(true);
    const { result, unmount } = await renderSettingsHook();
    await act(async () => {
      await result.current.restorePurchases();
    });
    expect(result.current.isUnlocked).toBe(true);
    unmount();
  });
});

