import { Pressable, StyleSheet, Text, View } from "react-native";

type WinnerModalProps = {
  onPlayAgain: () => void;
  bottomOffset?: number;
};

export const WinnerModal = ({ onPlayAgain, bottomOffset = 56 }: WinnerModalProps) => {
  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]}>
      <Text style={styles.title}>Chosen Player</Text>
      <Pressable onPress={onPlayAgain} style={styles.button}>
        <Text style={styles.buttonText}>Play Again</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#0b1020",
    fontSize: 17,
    fontWeight: "700",
  },
  title: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  wrapper: {
    alignItems: "center",
    bottom: 56,
    left: 0,
    paddingHorizontal: 20,
    position: "absolute",
    right: 0,
    zIndex: 50,
  },
});
