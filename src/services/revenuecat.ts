import { Platform } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";

const ENTITLEMENT_ID = "more_players";
const OFFERING_ID = "default";

let isConfigured = false;
let initPromise: Promise<boolean> | null = null;

const getApiKey = () => {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "";
  }
  return "";
};

export const initRevenueCat = async () => {
  if (isConfigured) {
    return true;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return false;
    }

    Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO);
    try {
      await Purchases.configure({ apiKey });
    } catch (error: any) {
      const message = String(error?.message ?? error ?? "");
      // Can happen on fast refresh if an instance was already configured.
      if (!message.includes("Purchases instance already set")) {
        throw error;
      }
    }
    isConfigured = true;
    return true;
  })();

  try {
    return await initPromise;
  } finally {
    initPromise = null;
  }
};

export const hasMorePlayersEntitlement = async () => {
  const ready = await initRevenueCat();
  if (!ready) {
    return false;
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
};

const getUnlockPackage = async (): Promise<PurchasesPackage | null> => {
  const offerings = await Purchases.getOfferings();
  const preferredOffering = offerings.all[OFFERING_ID] ?? offerings.current;

  if (!preferredOffering) {
    return null;
  }

  const byIdentifier = preferredOffering.availablePackages.find(
    (item) =>
      item.identifier === "more_players" ||
      item.identifier === "$rc_lifetime" ||
      item.identifier === "$rc_annual" ||
      item.identifier === "$rc_monthly",
  );
  return byIdentifier ?? preferredOffering.availablePackages[0] ?? null;
};

export const purchaseMorePlayers = async () => {
  const ready = await initRevenueCat();
  if (!ready) {
    return { ok: false as const, reason: "not-configured" as const };
  }

  const pkg = await getUnlockPackage();
  if (!pkg) {
    return { ok: false as const, reason: "no-package" as const };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const unlocked = Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
    return { ok: unlocked as boolean, reason: unlocked ? "purchased" : "not-entitled" };
  } catch (error: any) {
    if (error?.userCancelled) {
      return { ok: false as const, reason: "cancelled" as const };
    }
    return { ok: false as const, reason: "failed" as const };
  }
};

export const restoreMorePlayersPurchases = async () => {
  const ready = await initRevenueCat();
  if (!ready) {
    return false;
  }
  const customerInfo = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
};

