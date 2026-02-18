import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import BrandLogo from "../components/BrandLogo";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCard}>
        <BrandLogo />
        <Text style={styles.company}>Chhaperia Cables</Text>
        <Text style={styles.tag}>Production Tracker</Text>
      </View>
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
    backgroundColor: "#f2f5f8",
    padding: 16,
  },
  logoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: "#e1e6ef",
    alignItems: "center",
    gap: 4,
  },
  company: { fontSize: 20, fontWeight: "800", color: "#1d1d1d" },
  tag: { fontSize: 13, color: "#5d6777", fontWeight: "700" },
  wait: { color: "#596476", fontWeight: "700" },
});
