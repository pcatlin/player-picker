import React from "react";
import { act, create } from "react-test-renderer";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

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

const flush = async () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

describe("useAppSettings", () => {
  beforeEach(() => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    jest.clearAllMocks();
    hasEntitlementMock.mockResolvedValue(false);
    purchaseMorePlayersMock.mockResolvedValue({ ok: true, reason: "purchased" });
    restorePurchasesMock.mockResolvedValue(false);
  });

  const renderHook = async () => {
    let latest: any = null;
    let renderer: any = null;

    const Harness = () => {
      const { useAppSettings } = require("./useAppSettings");
      latest = useAppSettings();
      return null;
    };

    await act(async () => {
      renderer = create(React.createElement(Harness));
    });
    await flush();

    return {
      getCurrent: () => latest,
      unmount: () => renderer?.unmount(),
    };
  };

  it("loads defaults when storage is empty", async () => {
    const { getCurrent, unmount } = await renderHook();
    const current = getCurrent();
    expect(current.isLoading).toBe(false);
    expect(current.hapticsEnabled).toBe(true);
    expect(current.isUnlocked).toBe(false);
    expect(current.playerColors).toHaveLength(8);
    unmount();
  });

  it("syncs remote entitlement to unlocked", async () => {
    hasEntitlementMock.mockResolvedValue(true);
    const { getCurrent, unmount } = await renderHook();
    expect(getCurrent().isUnlocked).toBe(true);
    unmount();
  });

  it("persists haptics updates", async () => {
    const { getCurrent, unmount } = await renderHook();
    await act(async () => {
      await getCurrent().setHapticsEnabled(false);
    });
    expect(setItemMock).toHaveBeenCalled();
    expect(getCurrent().hapticsEnabled).toBe(false);
    expect(setItemMock).toHaveBeenLastCalledWith(
      "player-picker-settings-v1",
      expect.stringContaining("\"hapticsEnabled\":false"),
    );
    unmount();
  });

  it("persists player color updates", async () => {
    const { getCurrent, unmount } = await renderHook();
    await act(async () => {
      await getCurrent().updatePlayerColor(0, "#ffffff");
    });
    expect(getCurrent().playerColors[0]).toBe("#ffffff");
    expect(setItemMock).toHaveBeenLastCalledWith(
      "player-picker-settings-v1",
      expect.stringContaining("#ffffff"),
    );
    unmount();
  });

  it("unlocks after successful purchase", async () => {
    const { getCurrent, unmount } = await renderHook();
    await act(async () => {
      await getCurrent().unlockMorePlayers();
    });
    expect(purchaseMorePlayersMock).toHaveBeenCalled();
    expect(getCurrent().isUnlocked).toBe(true);
    unmount();
  });

  it("restore purchases unlocks when revenuecat restore succeeds", async () => {
    restorePurchasesMock.mockResolvedValue(true);
    const { getCurrent, unmount } = await renderHook();
    await act(async () => {
      await getCurrent().restorePurchases();
    });
    expect(getCurrent().isUnlocked).toBe(true);
    unmount();
  });
});

