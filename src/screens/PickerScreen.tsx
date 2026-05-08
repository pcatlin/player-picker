import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SettingsScreen } from "../components/SettingsScreen";
import { TouchArena } from "../components/TouchArena";
import { WinnerModal } from "../components/WinnerModal";
import { getSupportedLanguage, translate } from "../i18n/translations";
import { useAppSettings } from "../state/useAppSettings";
import { usePickerState } from "../state/usePickerState";

export const PickerScreen = () => {
  const language = getSupportedLanguage(Intl.DateTimeFormat().resolvedOptions().locale);
  const { height: windowHeight } = useWindowDimensions();
  const textOffsetY = windowHeight * 0.05;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    hapticsEnabled,
    isLoading,
    isUnlocked,
    playerColors,
    restorePurchases,
    setHapticsEnabled,
    unlockMorePlayers,
    updatePlayerColor,
  } = useAppSettings();
  const maxPlayers = isUnlocked ? 8 : 3;
  const {
    MIN_PLAYERS,
    activeTouches,
    countdownSeconds,
    phase,
    rawTouchCount,
    resetForNewRound,
    updateTouches,
    winner,
  } = usePickerState();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!winner || !hapticsEnabled) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
      // Ignore device haptics errors so gameplay flow is unaffected.
    });
  }, [hapticsEnabled, isLoading, winner]);

  useEffect(() => {
    const shouldFadeOut = !isSettingsOpen && phase !== "reveal" && activeTouches.length > 1;
    Animated.timing(textOpacity, {
      duration: 350,
      toValue: shouldFadeOut ? 0 : 1,
      useNativeDriver: true,
    }).start();
  }, [activeTouches.length, isSettingsOpen, phase, textOpacity]);

  const BASE_WINNER_MODAL_BOTTOM = 56;
  const WINNER_MODAL_HEIGHT = 132;
  const WINNER_FINGER_CLEARANCE = 42;

  const winnerModalBottomOffset = (() => {
    if (!winner) {
      return BASE_WINNER_MODAL_BOTTOM;
    }

    const modalTopAtBase = windowHeight - BASE_WINNER_MODAL_BOTTOM - WINNER_MODAL_HEIGHT;
    const shouldMoveUp = winner.y >= modalTopAtBase;

    if (!shouldMoveUp) {
      return BASE_WINNER_MODAL_BOTTOM;
    }

    // Keep modal just above the winning finger only when overlap would occur.
    return windowHeight - winner.y + WINNER_FINGER_CLEARANCE;
  })();

  return (
    <View style={styles.container}>
      {!isSettingsOpen ? (
      <View style={styles.header}>
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textOffsetY }],
          }}
        >
          <Text style={styles.title}>{translate(language, "appTitle")}</Text>
          <Text style={styles.subtitle}>
            {translate(language, "holdInstruction")}
          </Text>
          <Text style={styles.helper}>{translate(language, "minPlayers", { count: MIN_PLAYERS })}</Text>
        </Animated.View>
        <Pressable
          onPress={() => setIsSettingsOpen(true)}
          style={[
            styles.iconButton,
            styles.settingsButton,
            { transform: [{ translateY: textOffsetY }] },
          ]}
        >
          <Text style={styles.iconText}>⚙</Text>
        </Pressable>
      </View>
      ) : null}

      <TouchArena
        countdownSeconds={countdownSeconds}
        onTouchesChanged={(touches) => updateTouches(touches, maxPlayers)}
        phase={phase}
        playerColors={playerColors}
        touches={activeTouches}
        winner={winner}
      />

      {!isUnlocked && rawTouchCount >= 4 && !isSettingsOpen ? (
        <Pressable onPress={() => setIsSettingsOpen(true)} style={styles.unlockPromptInline}>
          <Text style={styles.unlockPromptInlineText}>
            {translate(language, "unlockMorePlayers")}
          </Text>
        </Pressable>
      ) : null}

      {phase === "ready" && !isSettingsOpen ? (
        <Animated.View
          style={[
            styles.instructions,
            {
              opacity: textOpacity,
            },
          ]}
        >
          <Text style={styles.instructionsText}>{translate(language, "touchToBegin")}</Text>
        </Animated.View>
      ) : null}

      {phase === "reveal" && winner && !isSettingsOpen ? (
        <WinnerModal
          bottomOffset={winnerModalBottomOffset}
          language={language}
          onPlayAgain={resetForNewRound}
        />
      ) : null}

      {isSettingsOpen ? (
        <SettingsScreen
          canUseMorePlayers={isUnlocked}
          hapticsEnabled={hapticsEnabled}
          language={language}
          onClose={() => setIsSettingsOpen(false)}
          onRestorePurchases={async () => {
            const restored = await restorePurchases();
            Alert.alert(
              restored
                ? translate(language, "purchasesRestoredTitle")
                : translate(language, "nothingToRestoreTitle"),
              restored
                ? translate(language, "restoredBody")
                : translate(language, "notFoundBody"),
            );
          }}
          onToggleHaptics={() => setHapticsEnabled(!hapticsEnabled)}
          onUnlockMorePlayers={async () => {
            const result = await unlockMorePlayers();
            if (result.ok) {
              Alert.alert(
                translate(language, "unlockedTitle"),
                translate(language, "unlockedBody"),
              );
              return;
            }

            if (result.reason === "cancelled") {
              Alert.alert(
                translate(language, "purchaseCancelledTitle"),
                translate(language, "purchaseCancelledBody"),
              );
              return;
            }

            Alert.alert(
              translate(language, "unableToUnlockTitle"),
              translate(language, "unableToUnlockBody"),
            );
          }}
          onUpdatePlayerColor={updatePlayerColor}
          playerColors={playerColors}
          showUnlockPrompt={!isUnlocked && rawTouchCount >= 4}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsButton: {
    zIndex: 80,
  },
  unlockPromptInline: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    bottom: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "absolute",
    zIndex: 45,
  },
  unlockPromptInlineText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  helper: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: Platform.select({
      android: "sans-serif-medium",
      ios: "AvenirNext-Medium",
      default: "System",
    }),
    fontSize: 12,
    marginTop: 2,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconText: {
    color: "#f8f8ff",
    fontSize: 18,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 20,
    position: "absolute",
    right: 0,
    top: 20,
    zIndex: 30,
  },
  instructions: {
    alignItems: "center",
    bottom: 56,
    left: 0,
    paddingHorizontal: 20,
    position: "absolute",
    right: 0,
    zIndex: 15,
  },
  instructionsText: {
    color: "rgba(255,255,255,0.95)",
    fontFamily: Platform.select({
      android: "sans-serif-medium",
      ios: "AvenirNext-DemiBold",
      default: "System",
    }),
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontFamily: Platform.select({
      android: "sans-serif-medium",
      ios: "AvenirNext-Medium",
      default: "System",
    }),
    fontSize: 13,
    marginTop: 4,
    maxWidth: 250,
  },
  title: {
    color: "#ffffff",
    fontFamily: Platform.select({
      android: "sans-serif-medium",
      ios: "AvenirNext-DemiBold",
      default: "System",
    }),
    fontSize: 24,
    fontWeight: "900",
  },
});
