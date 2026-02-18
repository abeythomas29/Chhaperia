import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalEntry } from "../types";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const QUEUE_KEY = "entryQueue";

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
