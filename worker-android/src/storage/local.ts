import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalEntry, MasterData, OfflineCredential } from "../types";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const QUEUE_KEY = "entryQueue";
const MASTER_KEY = "masterData";
const CREDENTIALS_KEY = "offlineCredentials";

export async function saveAuth(token: string, user: string) {
  await AsyncStorage.multiSet([[TOKEN_KEY, token], [USER_KEY, user]]);
}

export async function loadAuth() {
  const [token, user] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  return { token: token[1], user: user[1] };
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function getQueue(): Promise<LocalEntry[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveQueue(entries: LocalEntry[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
}

export async function addLocalEntry(entry: LocalEntry) {
  const current = await getQueue();
  current.unshift(entry);
  await saveQueue(current);
}

export async function updateLocalEntryStatus(localId: string, status: LocalEntry["status"]) {
  const current = await getQueue();
  const updated = current.map((entry) => (entry.localId === localId ? { ...entry, status } : entry));
  await saveQueue(updated);
}

function defaultMasterData(): MasterData {
  return {
    categories: [
      {
        id: "local-category-scwwbt",
        name: "Semiconductor Woven Water Blocking Tape",
        codes: [
          { id: "local:code:CHSCWWBT 18", code: "CHSCWWBT 18", status: "ACTIVE" },
          { id: "local:code:CHSCWWBT 20", code: "CHSCWWBT 20", status: "ACTIVE" },
          { id: "local:code:CHSCWWBT 22", code: "CHSCWWBT 22", status: "ACTIVE" },
          { id: "local:code:CHSCWWBT 25", code: "CHSCWWBT 25", status: "ACTIVE" },
        ],
      },
    ],
    companies: [
      { id: "local:company:Internal Store", name: "Internal Store", status: "ACTIVE" },
      { id: "local:company:ABC Cables", name: "ABC Cables", status: "ACTIVE" },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export async function loadMasterData(): Promise<MasterData> {
  const raw = await AsyncStorage.getItem(MASTER_KEY);
  if (!raw) {
    const fallback = defaultMasterData();
    await saveMasterData(fallback);
    return fallback;
  }
  return JSON.parse(raw);
}

export async function saveMasterData(masterData: MasterData) {
  await AsyncStorage.setItem(MASTER_KEY, JSON.stringify(masterData));
}

export async function saveOfflineCredential(credential: OfflineCredential) {
  const raw = await AsyncStorage.getItem(CREDENTIALS_KEY);
  const current: OfflineCredential[] = raw ? JSON.parse(raw) : [];
  const next = [
    credential,
    ...current.filter((c) => c.identity.toLowerCase() !== credential.identity.toLowerCase()),
  ];
  await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(next.slice(0, 5)));
}

export async function findOfflineCredential(identity: string): Promise<OfflineCredential | null> {
  const raw = await AsyncStorage.getItem(CREDENTIALS_KEY);
  const current: OfflineCredential[] = raw ? JSON.parse(raw) : [];
  return current.find((c) => c.identity.toLowerCase() === identity.toLowerCase()) ?? null;
}
