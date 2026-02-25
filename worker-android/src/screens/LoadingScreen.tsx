import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import BrandLogo from "../components/BrandLogo";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <BrandLogo large />
      <Text style={styles.company}>Chhaperia Cables</Text>
      <Text style={styles.tag}>Production Tracker</Text>
      <ActivityIndicator size="large" color="#f26722" />
      <Text style={styles.wait}>Loading secure workspace...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "#f5f7fb",
    padding: 16,
  },
  company: { fontSize: 20, fontWeight: "800", color: "#1d1d1d" },
  tag: { fontSize: 13, color: "#5d6777", fontWeight: "700" },
  wait: { color: "#596476", fontWeight: "700" },
});
