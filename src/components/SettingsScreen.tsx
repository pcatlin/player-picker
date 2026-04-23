import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLOR_PICKER_SWATCHES } from "../constants/colors";

type SettingsScreenProps = {
  hapticsEnabled: boolean;
  onClose: () => void;
  onToggleHaptics: () => void;
  onUpdatePlayerColor: (index: number, color: string) => void;
  playerColors: string[];
};

export const SettingsScreen = ({
  hapticsEnabled,
  onClose,
  onToggleHaptics,
  onUpdatePlayerColor,
  playerColors,
}: SettingsScreenProps) => {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={onClose} style={styles.iconButton}>
          <Text style={styles.iconText}>X</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gameplay</Text>
          <Pressable onPress={onToggleHaptics} style={styles.toggleButton}>
            <Text style={styles.toggleText}>
              Haptics: {hapticsEnabled ? "On" : "Off"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Colors (1-8)</Text>
          <Text style={styles.helper}>
            Choose fixed colors used for touch circles and winner reveal.
          </Text>
          {playerColors.map((color, playerIndex) => (
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
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
