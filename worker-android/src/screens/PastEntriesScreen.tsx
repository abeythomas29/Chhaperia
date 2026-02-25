import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";
import { getQueue } from "../storage/local";

export default function PastEntriesScreen({ onBack }: { onBack: () => void }) {
  const [localEntries, setLocalEntries] = useState<any[]>([]);
  const [serverEntries, setServerEntries] = useState<any[]>([]);
  const [syncInfo, setSyncInfo] = useState("");

  async function load() {
    const queue = await getQueue();
    setLocalEntries(queue);
    try {
      const { data } = await api.get("/entries/mine");
      setServerEntries(data.slice(0, 40));
      setSyncInfo("");
    } catch {
      setServerEntries([]);
      setSyncInfo("Offline mode: synced records are shown after manual Sync.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Past Entries</Text>
      {syncInfo ? <Text style={styles.info}>{syncInfo}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.heading}>Local Queue</Text>
        {localEntries.length === 0 && <Text style={styles.empty}>No local entries</Text>}
        {localEntries.map((e) => (
          <View key={e.localId} style={styles.rowCard}>
            <Text style={styles.rowMain}>{e.date} | Rolls {e.rollsCount}</Text>
            <Text style={[styles.rowTag, e.status === "SYNCED" ? styles.synced : styles.pending]}>{e.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Synced Records</Text>
        {serverEntries.length === 0 && <Text style={styles.empty}>No synced entries</Text>}
        {serverEntries.map((e) => (
          <View key={e.id} style={styles.rowCard}>
            <Text style={styles.rowMain}>{new Date(e.date).toISOString().slice(0, 10)} | {e.productCode.code}</Text>
            <Text style={styles.rowSub}>Rolls {e.rollsCount} | {e.issuedToCompany.name}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#eef2f5" },
  container: { padding: 16, gap: 12, paddingBottom: 28 },
  title: { fontSize: 26, fontWeight: "800", color: "#182132" },
  info: { color: "#5f6f84", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dfe6f1",
    padding: 12,
    gap: 8,
  },
  heading: { fontSize: 16, fontWeight: "800", color: "#263248" },
  empty: { color: "#667387", fontSize: 14 },
  rowCard: { backgroundColor: "#f8fafd", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#e4eaf3" },
  rowMain: { color: "#1c273a", fontWeight: "700" },
  rowSub: { color: "#637188", marginTop: 3 },
  rowTag: { marginTop: 6, alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, fontWeight: "800", fontSize: 12 },
  synced: { backgroundColor: "#e8faef", color: "#16774a" },
  pending: { backgroundColor: "#fff0e4", color: "#b35512" },
  backBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1dae7", borderRadius: 12, alignItems: "center", paddingVertical: 12 },
  backText: { fontWeight: "800", color: "#2f3b50", fontSize: 16 },
});
