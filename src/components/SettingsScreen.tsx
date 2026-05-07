import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLOR_PICKER_SWATCHES } from "../constants/colors";

type SettingsScreenProps = {
  canUseMorePlayers: boolean;
  devUnlockOverride: boolean;
  hapticsEnabled: boolean;
  onClose: () => void;
  onRestorePurchases: () => void;
  onToggleHaptics: () => void;
  onToggleDevUnlockOverride: () => void;
  onUnlockMorePlayers: () => void;
  onUpdatePlayerColor: (index: number, color: string) => void;
  playerColors: string[];
  showDevTools: boolean;
  showUnlockPrompt: boolean;
};

export const SettingsScreen = ({
  canUseMorePlayers,
  devUnlockOverride,
  hapticsEnabled,
  onClose,
  onRestorePurchases,
  onToggleHaptics,
  onToggleDevUnlockOverride,
  onUnlockMorePlayers,
  onUpdatePlayerColor,
  playerColors,
  showDevTools,
  showUnlockPrompt,
}: SettingsScreenProps) => {
  const visibleColorRows = canUseMorePlayers ? playerColors : playerColors.slice(0, 3);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={onClose} style={styles.iconButton}>
          <Text style={styles.iconText}>X</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {showUnlockPrompt ? (
          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Unlock more players</Text>
            <Text style={styles.promptBody}>Open purchase options below in this settings screen.</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gameplay</Text>
          <Pressable onPress={onToggleHaptics} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              Haptics: {hapticsEnabled ? "On" : "Off"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Players</Text>
          <Text style={styles.helper}>pick from up to 8 players</Text>
          <Pressable onPress={onUnlockMorePlayers} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Unlock more players</Text>
          </Pressable>
          <Pressable onPress={onRestorePurchases} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Restore purchases</Text>
          </Pressable>
          {showDevTools ? (
            <Pressable onPress={onToggleDevUnlockOverride} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>
                Developer test unlock: {devUnlockOverride ? "On" : "Off"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Colors</Text>
          <Text style={styles.helper}>
            Choose fixed colors used for touch circles and winner reveal.
          </Text>
          {visibleColorRows.map((color, playerIndex) => (
            <View key={`player-color-${playerIndex}`} style={styles.playerRow}>
              <Text style={styles.playerLabel}>Player {playerIndex + 1}</Text>
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
                Players 4-8 are locked. Unlock more players to customize additional colors.
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
