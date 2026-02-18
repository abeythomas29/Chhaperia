import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BrandLogo from "../components/BrandLogo";
import { api } from "../api/client";
import { getQueue } from "../storage/local";

export default function DashboardScreen({
  onNewEntry,
  onPastEntries,
  onSync,
  onLogout,
}: {
  onNewEntry: () => void;
  onPastEntries: () => void;
  onSync: () => Promise<void>;
  onLogout: () => void;
}) {
  const [codes, setCodes] = useState<string[]>([]);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    const { data } = await api.get("/metadata/master");
    const activeCodes = data.categories.flatMap((c: any) => c.codes.map((code: any) => code.code));
    setCodes(activeCodes);
    const queue = await getQueue();
    setPending(queue.filter((q) => q.status !== "SYNCED").length);
  }

  useEffect(() => {
    load();
  }, []);

  async function triggerSync() {
    setSyncing(true);
    await onSync();
    await load();
    setSyncing(false);
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.container}>
      <View style={styles.brandCard}>
        <BrandLogo />
        <Text style={styles.company}>Chhaperia Cables</Text>
        <Text style={styles.subtitle}>Production Floor Dashboard</Text>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusCard, pending > 0 ? styles.pendingCard : styles.syncedCard]}>
          <Text style={styles.statusLabel}>Sync Queue</Text>
          <Text style={styles.statusValue}>{pending} pending</Text>
        </View>
        <Pressable style={styles.syncBtn} onPress={triggerSync}>
          <Text style={styles.syncBtnText}>{syncing ? "Syncing..." : "Sync Now"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Product Codes</Text>
        <View style={styles.chipsWrap}>
          {codes.map((code) => (
            <View key={code} style={styles.chip}>
              <Text style={styles.chipText}>{code}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={[styles.actionBtn, styles.primaryAction]} onPress={onNewEntry}>
        <Text style={styles.actionTitle}>New Production Entry</Text>
        <Text style={styles.actionSub}>Tap to record rolls and quantity</Text>
      </Pressable>

      <Pressable style={[styles.actionBtn, styles.secondaryAction]} onPress={onPastEntries}>
        <Text style={styles.actionTitleDark}>View Past Entries</Text>
        <Text style={styles.actionSubDark}>Open read-only local and synced logs</Text>
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#eef2f5" },
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  brandCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0e6ee",
    gap: 4,
  },
  company: { fontSize: 20, fontWeight: "800", color: "#1a1f2a" },
  subtitle: { color: "#667081", fontSize: 14 },
  statusRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  statusCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
  },
  pendingCard: { backgroundColor: "#fff4e9", borderWidth: 1, borderColor: "#ffd6b2" },
  syncedCard: { backgroundColor: "#ecfff3", borderWidth: 1, borderColor: "#bce8cb" },
  statusLabel: { fontSize: 13, color: "#5d6777", fontWeight: "700" },
  statusValue: { fontSize: 22, color: "#1a1f2a", fontWeight: "800" },
  syncBtn: {
    backgroundColor: "#0f4c9a",
    minWidth: 118,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  syncBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#e4e9f0" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1a1f2a", marginBottom: 8 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#0f4c9a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  actionBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  primaryAction: {
    backgroundColor: "#f26722",
  },
  secondaryAction: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d6deea",
  },
  actionTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  actionSub: { color: "#fff8f2", fontSize: 14, marginTop: 2 },
  actionTitleDark: { color: "#1e2a3b", fontSize: 22, fontWeight: "800" },
  actionSubDark: { color: "#5f6a7a", fontSize: 14, marginTop: 2 },
  logoutBtn: {
    marginTop: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2b7b7",
    backgroundColor: "#fff3f3",
    alignItems: "center",
    paddingVertical: 10,
  },
  logoutBtnText: { color: "#a02222", fontWeight: "800", fontSize: 16 },
});
