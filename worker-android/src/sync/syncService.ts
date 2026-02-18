import NetInfo from "@react-native-community/netinfo";
import { api } from "../api/client";
import { getQueue, saveQueue } from "../storage/local";

export async function syncPendingEntries() {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return { synced: 0 };

  const queue = await getQueue();
  const pending = queue.filter((q) => q.status !== "SYNCED");
  if (!pending.length) return { synced: 0 };

  const payload = pending.map(({ localId, status, createdAt, ...rest }) => rest);

  try {
    const { data } = await api.post("/entries/sync-batch", { entries: payload });
    const syncedRefs = new Set<string>(
      (data?.results ?? [])
        .map((r: { localRef: string | null }) => r.localRef)
        .filter((ref: string | null): ref is string => Boolean(ref))
    );

    const updated = queue.map((q) =>
      syncedRefs.has(q.localId) ? { ...q, status: "SYNCED" as const } : q
    );
    await saveQueue(updated);
    return { synced: syncedRefs.size };
  } catch {
    const failed = queue.map((q) => (q.status === "PENDING" ? { ...q, status: "FAILED" as const } : q));
    await saveQueue(failed);
    return { synced: 0 };
  }
}
