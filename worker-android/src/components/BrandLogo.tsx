import { StyleSheet, Text, View } from "react-native";

export default function BrandLogo() {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <View style={styles.cOuter} />
        <View style={styles.cInner} />
        <View style={styles.diamond} />
      </View>
      <Text style={styles.wordmark}>CHHAPERIA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 72, height: 52, justifyContent: "center" },
  cOuter: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 6,
    borderColor: "#f26722",
    borderRightColor: "transparent",
    left: 0,
  },
  cInner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "#f26722",
    borderRightColor: "transparent",
    left: 8,
  },
  diamond: {
    position: "absolute",
    width: 18,
    height: 18,
    backgroundColor: "#f26722",
    transform: [{ rotate: "45deg" }],
    left: 42,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 1,
  },
});
