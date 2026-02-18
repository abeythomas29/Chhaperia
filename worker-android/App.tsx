import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import NewEntryScreen from "./src/screens/NewEntryScreen";
import PastEntriesScreen from "./src/screens/PastEntriesScreen";
import LoadingScreen from "./src/screens/LoadingScreen";
import { clearAuth, loadAuth, saveAuth } from "./src/storage/local";
import { setAuthToken } from "./src/api/client";
import { syncPendingEntries } from "./src/sync/syncService";

type Screen = "login" | "dashboard" | "new-entry" | "past-entries";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) syncPendingEntries();
    });
    return unsubscribe;
  }, []);

  async function loadSession() {
    const { token } = await loadAuth();
    if (token) {
      setAuthToken(token);
      setScreen("dashboard");
    }
    setLoading(false);
  }

  async function onLogin(token: string, user: any) {
    await saveAuth(token, JSON.stringify(user));
    setAuthToken(token);
    setScreen("dashboard");
  }

  async function onLogout() {
    await clearAuth();
    setAuthToken(null);
    setScreen("login");
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (screen === "login") return <LoginScreen onLogin={onLogin} />;
  if (screen === "new-entry") return <NewEntryScreen onDone={() => setScreen("dashboard")} />;
  if (screen === "past-entries") return <PastEntriesScreen onBack={() => setScreen("dashboard")} />;

  return (
    <DashboardScreen
      onNewEntry={() => setScreen("new-entry")}
      onPastEntries={() => setScreen("past-entries")}
      onSync={async () => { await syncPendingEntries(); }}
      onLogout={onLogout}
    />
  );
}
