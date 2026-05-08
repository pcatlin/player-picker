import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLOR_PICKER_SWATCHES } from "../constants/colors";
import { SupportedLanguage, translate } from "../i18n/translations";

type SettingsScreenProps = {
  canUseMorePlayers: boolean;
  hapticsEnabled: boolean;
  language: SupportedLanguage;
  onClose: () => void;
  onRestorePurchases: () => void;
  onToggleHaptics: () => void;
  onUnlockMorePlayers: () => void;
  onUpdatePlayerColor: (index: number, color: string) => void;
  playerColors: string[];
  showUnlockPrompt: boolean;
};

export const SettingsScreen = ({
  canUseMorePlayers,
  hapticsEnabled,
  language,
  onClose,
  onRestorePurchases,
  onToggleHaptics,
  onUnlockMorePlayers,
  onUpdatePlayerColor,
  playerColors,
  showUnlockPrompt,
}: SettingsScreenProps) => {
  const visibleColorRows = canUseMorePlayers ? playerColors : playerColors.slice(0, 3);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{translate(language, "settingsTitle")}</Text>
        <Pressable onPress={onClose} style={styles.iconButton}>
          <Text style={styles.iconText}>X</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {showUnlockPrompt ? (
          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>{translate(language, "unlockPromptCardTitle")}</Text>
            <Text style={styles.promptBody}>{translate(language, "unlockPromptCardBody")}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate(language, "gameplayTitle")}</Text>
          <Pressable onPress={onToggleHaptics} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              {hapticsEnabled
                ? translate(language, "hapticsOn")
                : translate(language, "hapticsOff")}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate(language, "morePlayersTitle")}</Text>
          {!canUseMorePlayers ? (
            <>
              <Text style={styles.helper}>{translate(language, "pickUpTo8")}</Text>
              <Pressable onPress={onUnlockMorePlayers} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>
                  {translate(language, "unlockMorePlayers")}
                </Text>
              </Pressable>
              <Pressable onPress={onRestorePurchases} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  {translate(language, "restorePurchases")}
                </Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.helper}>{translate(language, "unlockedThanks")}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate(language, "playerColorsTitle")}</Text>
          <Text style={styles.helper}>{translate(language, "playerColorHelper")}</Text>
          {visibleColorRows.map((color, playerIndex) => (
            <View key={`player-color-${playerIndex}`} style={styles.playerRow}>
              <Text style={styles.playerLabel}>
                {translate(language, "playerLabel", { index: playerIndex })}
              </Text>
              <View style={styles.swatches}>
                {COLOR_PICKER_SWATCHES.map((swatch) => (
                  <Pressable
                    key={`${playerIndex}-${swatch}`}
                    onPress={() => onUpdatePlayerColor(playerIndex, swatch)}
                    style={[
                      styles.swatch,
                      { backgroundColor: swatch },
                      color === swatch ? styles.swatchSelected : null,
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
          {!canUseMorePlayers ? (
              <Text style={styles.helper}>
                {translate(language, "playersLockedHelper")}
              </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: "#0b1020",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  helper: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 16,
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
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  playerLabel: {
    color: "#f4f8ff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  playerRow: {
    marginBottom: 16,
  },
  promptBody: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    marginTop: 6,
  },
  promptCard: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  promptTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  screen: {
    backgroundColor: "rgba(7,15,35,0.95)",
    flex: 1,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  swatch: {
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    marginBottom: 8,
    marginRight: 8,
    width: 28,
  },
  swatches: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  swatchSelected: {
    borderColor: "#ffffff",
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },
  toggleButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
