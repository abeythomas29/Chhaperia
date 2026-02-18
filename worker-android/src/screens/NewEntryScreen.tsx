import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../api/client";
import { addLocalEntry, updateLocalEntryStatus } from "../storage/local";
import { EntryPayload } from "../types";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function SelectChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function NewEntryScreen({ onDone }: { onDone: () => void }) {
  const [codes, setCodes] = useState<{ id: string; code: string }[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState("");
  const [form, setForm] = useState<EntryPayload>({
    productCodeId: "",
    date: new Date().toISOString().slice(0, 10),
    rollsCount: 0,
    unit: "METER",
    quantityPerRoll: 0,
    issuedToCompanyId: "",
  });

  useEffect(() => {
    api.get("/metadata/master")
      .then(({ data }) => {
        const firstCategory = data.categories[0];
        const codeList = firstCategory?.codes || [];
        setCodes(codeList);
        setCompanies(data.companies);
        setForm((prev) => ({
          ...prev,
          productCodeId: codeList[0]?.id || "",
          issuedToCompanyId: data.companies[0]?.id || "",
        }));
      })
      .catch(() => {
        setMetaError("Unable to load product/company options. Please check backend connection.");
      })
      .finally(() => setLoadingMeta(false));
  }, []);

  async function submit() {
    if (loadingMeta || metaError) {
      Alert.alert("Please wait", "Options are not loaded yet. Check connection and try again.");
      return;
    }

    if (!form.productCodeId || !form.issuedToCompanyId || !form.rollsCount || !form.quantityPerRoll) {
      Alert.alert("Validation", "Please fill all required fields");
      return;
    }

    const localId = uid();
    const payload: EntryPayload = {
      ...form,
      sourceDeviceId: localId,
      syncStatus: "PENDING",
    };

    await addLocalEntry({ ...payload, localId, status: "PENDING", createdAt: new Date().toISOString() });

    try {
      await api.post("/entries", payload);
      await updateLocalEntryStatus(localId, "SYNCED");
      Alert.alert("Success", "Entry uploaded successfully");
    } catch {
      Alert.alert("Saved Offline", "Entry saved locally and will sync when online");
    }

    onDone();
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.container}>
      <View style={styles.topCard}>
        <Text style={styles.title}>New Production Entry</Text>
        <Text style={styles.subtitle}>Semiconductor Woven Water Blocking Tape</Text>
        {loadingMeta && <Text style={styles.info}>Loading options...</Text>}
        {!loadingMeta && metaError ? <Text style={styles.error}>{metaError}</Text> : null}
      </View>

      <Text style={styles.label}>Product Code</Text>
      <View style={styles.chipWrap}>
        {codes.map((c) => (
          <SelectChip key={c.id} label={c.code} active={form.productCodeId === c.id} onPress={() => setForm((p) => ({ ...p, productCodeId: c.id }))} />
        ))}
      </View>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={form.date} onChangeText={(v) => setForm((p) => ({ ...p, date: v }))} />

      <Text style={styles.label}>Number of Rolls</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={String(form.rollsCount || "")}
        onChangeText={(v) => setForm((p) => ({ ...p, rollsCount: Number(v || 0) }))}
      />

      <Text style={styles.label}>Unit</Text>
      <View style={styles.chipWrap}>
        <SelectChip label="Meter" active={form.unit === "METER"} onPress={() => setForm((p) => ({ ...p, unit: "METER" }))} />
        <SelectChip label="Square Metre" active={form.unit === "SQM"} onPress={() => setForm((p) => ({ ...p, unit: "SQM" }))} />
      </View>

      <Text style={styles.label}>Quantity per Roll</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={String(form.quantityPerRoll || "")}
        onChangeText={(v) => setForm((p) => ({ ...p, quantityPerRoll: Number(v || 0) }))}
      />

      <Text style={styles.label}>Issued To</Text>
      <View style={styles.chipWrap}>
        {companies.map((c) => (
          <SelectChip key={c.id} label={c.name} active={form.issuedToCompanyId === c.id} onPress={() => setForm((p) => ({ ...p, issuedToCompanyId: c.id }))} />
        ))}
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Quantity</Text>
        <Text style={styles.totalValue}>
          {(form.rollsCount * form.quantityPerRoll || 0).toFixed(2)} {form.unit === "METER" ? "m" : "sqm"}
        </Text>
      </View>

      <Pressable style={styles.primaryBtn} onPress={submit}>
        <Text style={styles.primaryBtnText}>Submit Entry</Text>
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={onDone}>
        <Text style={styles.secondaryBtnText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#eef2f5" },
  container: { padding: 16, gap: 10, paddingBottom: 28 },
  topCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#dfe5ee" },
  title: { fontSize: 25, fontWeight: "800", color: "#1c2432" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#677285" },
  info: { marginTop: 6, color: "#4c5c77", fontWeight: "700" },
  error: { marginTop: 6, color: "#c22323", fontWeight: "700" },
  label: { marginTop: 6, fontSize: 16, fontWeight: "800", color: "#2a3342" },
  input: {
    borderWidth: 1,
    borderColor: "#cfd6e2",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 18,
    color: "#111822",
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cfd6e2",
  },
  chipActive: { backgroundColor: "#0f4c9a", borderColor: "#0f4c9a" },
  chipText: { color: "#233047", fontWeight: "700", fontSize: 14 },
  chipTextActive: { color: "#fff" },
  totalCard: {
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dce4ef",
    padding: 12,
    marginTop: 8,
  },
  totalLabel: { color: "#647085", fontWeight: "700", fontSize: 13 },
  totalValue: { color: "#132035", fontWeight: "800", fontSize: 28 },
  primaryBtn: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "#f26722",
    alignItems: "center",
    paddingVertical: 14,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  secondaryBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1dae7",
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryBtnText: { color: "#2e3c52", fontWeight: "800", fontSize: 16 },
});
