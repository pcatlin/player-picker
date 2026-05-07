import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PickerScreen } from "./src/screens/PickerScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={["#2b8cff", "#2f9fd8"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.app}
      >
        <SafeAreaView edges={[]} style={styles.app}>
          <StatusBar style="light" />
          <PickerScreen />
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
