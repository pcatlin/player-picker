import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PLAYER_COLORS } from "../constants/colors";
import {
  hasMorePlayersEntitlement,
  initRevenueCat,
  purchaseMorePlayers,
  restoreMorePlayersPurchases,
} from "../services/revenuecat";

const STORAGE_KEY = "player-picker-settings-v1";

type StoredSettings = {
  hapticsEnabled: boolean;
  isUnlocked: boolean;
  playerColors: string[];
};

const DEFAULT_SETTINGS: StoredSettings = {
  hapticsEnabled: true,
  isUnlocked: false,
  playerColors: DEFAULT_PLAYER_COLORS,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [devUnlockOverride, setDevUnlockOverride] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await initRevenueCat().catch(() => undefined);
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const remoteEntitled = await hasMorePlayersEntitlement().catch(() => false);
          if (remoteEntitled) {
            setSettings((current) => ({ ...current, isUnlocked: true }));
          }
          return;
        }
        const parsed = JSON.parse(raw) as Partial<StoredSettings>;
        const remoteEntitled = await hasMorePlayersEntitlement().catch(() => false);
        setSettings({
          hapticsEnabled: parsed.hapticsEnabled ?? DEFAULT_SETTINGS.hapticsEnabled,
          isUnlocked: remoteEntitled || parsed.isUnlocked || DEFAULT_SETTINGS.isUnlocked,
          playerColors:
            parsed.playerColors?.length === DEFAULT_PLAYER_COLORS.length
              ? parsed.playerColors
              : DEFAULT_PLAYER_COLORS,
        });
      } finally {
        setIsLoading(false);
      }
    };
    load().catch(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (next: StoredSettings) => {
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setHapticsEnabled = useCallback(
    async (enabled: boolean) => {
      await persist({ ...settings, hapticsEnabled: enabled });
    },
    [persist, settings],
  );

  const updatePlayerColor = useCallback(
    async (index: number, color: string) => {
      const nextColors = [...settings.playerColors];
      nextColors[index] = color;
      await persist({ ...settings, playerColors: nextColors });
    },
    [persist, settings],
  );

  const unlockMorePlayers = useCallback(async () => {
    const result = await purchaseMorePlayers();
    if (!result.ok) {
      return result;
    }

    await persist({ ...settings, isUnlocked: true });
    return result;
  }, [persist, settings]);

  const restorePurchases = useCallback(async () => {
    const restoredRemotely = await restoreMorePlayersPurchases().catch(() => false);
    if (restoredRemotely) {
      await persist({ ...settings, isUnlocked: true });
      return true;
    }

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    if (!parsed.isUnlocked) {
      return false;
    }
    setSettings((current) => ({ ...current, isUnlocked: true }));
    return true;
  }, [persist, settings]);

  const updateDevUnlockOverride = useCallback(
    (updater: (current: boolean) => boolean) => {
      setDevUnlockOverride((current) => updater(current));
    },
    [],
  );

  const updateHapticsEnabled = useCallback(
    async (enabled: boolean) => {
      await setHapticsEnabled(enabled);
    },
    [setHapticsEnabled],
  );

  const setPlayerColor = useCallback(
    async (index: number, color: string) => {
      await updatePlayerColor(index, color);
    },
    [updatePlayerColor],
  );

  const grantUnlocked = useCallback(async () => {
    await persist({ ...settings, isUnlocked: true });
  }, [persist, settings]);

  const isUnlocked = useMemo(
    () => settings.isUnlocked || devUnlockOverride,
    [devUnlockOverride, settings.isUnlocked],
  );

  return {
    devUnlockOverride,
    hapticsEnabled: settings.hapticsEnabled,
    isLoading,
    isUnlocked,
    playerColors: settings.playerColors,
    restorePurchases,
    setDevUnlockOverride: updateDevUnlockOverride,
    setHapticsEnabled: updateHapticsEnabled,
    unlockMorePlayers,
    updatePlayerColor: setPlayerColor,
    unlockLocallyForTesting: grantUnlocked,
  };
};

