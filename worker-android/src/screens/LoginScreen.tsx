import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import BrandLogo from "../components/BrandLogo";
import { api } from "../api/client";
import { findOfflineCredential, saveOfflineCredential } from "../storage/local";

export default function LoginScreen({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [identity, setIdentity] = useState("EMP001");
  const [password, setPassword] = useState("worker123");
  const [error, setError] = useState("");

  async function login() {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { identity, password });
      if (data.user.role !== "WORKER") {
        setError("Use worker credentials for this app.");
        return;
      }
      await saveOfflineCredential({ identity, password, user: data.user });
      onLogin(data.token, data.user);
    } catch {
      const cached = await findOfflineCredential(identity);
      if (cached && cached.password === password && cached.user.role === "WORKER") {
        onLogin("OFFLINE", cached.user);
        return;
      }
      setError("Invalid ID/password. Connect internet once to register offline login.");
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <BrandLogo />
        <Text style={styles.title}>Worker Login</Text>
        <Text style={styles.subtitle}>Simple daily production entry for floor teams</Text>

        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Employee ID"
          placeholderTextColor="#6f7682"
          value={identity}
          onChangeText={setIdentity}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          placeholderTextColor="#6f7682"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryBtn} onPress={login}>
          <Text style={styles.primaryBtnText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
    backgroundColor: "#f2f4f7",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e3e7ed",
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#151a22",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#5f6775",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e3644",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccd3de",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9fbfd",
    fontSize: 18,
    color: "#10151e",
  },
  error: {
    color: "#c62626",
    fontWeight: "700",
    marginTop: 2,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: "#f26722",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
  },
});
