import { StyleSheet, Text, View } from "react-native";

export default function BrandLogo({ large = false }: { large?: boolean }) {
  const ringSize = large ? 78 : 58;
  const ringThickness = large ? 6 : 5;
  const gap = large ? 10 : 8;
  const textSize = large ? 36 : 28;
  const markHeight = ringSize + gap * 3;

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { width: large ? 98 : 84, height: markHeight }]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.ring,
              {
                width: ringSize - i * gap * 2,
                height: ringSize - i * gap * 2,
                borderRadius: (ringSize - i * gap * 2) / 2,
                borderWidth: ringThickness,
                left: i * gap,
                top: i * gap,
              },
            ]}
          />
        ))}
        <View style={[styles.diamond, { left: large ? 66 : 54, width: large ? 24 : 18, height: large ? 24 : 18 }]} />
      </View>
      <Text style={[styles.wordmark, { fontSize: textSize }]}>CHHAPERIA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { justifyContent: "center" },
  ring: {
    position: "absolute",
    borderColor: "#f26722",
    borderRightColor: "transparent",
  },
  diamond: {
    position: "absolute",
    backgroundColor: "#f26722",
    transform: [{ rotate: "45deg" }],
    top: 30,
  },
  wordmark: {
    fontWeight: "900",
    color: "#111",
    letterSpacing: 0.8,
  },
});
