import NetInfo from "@react-native-community/netinfo";
import { api } from "../api/client";
import { getQueue, loadAuth, loadMasterData, saveAuth, saveMasterData, saveQueue, findOfflineCredential } from "../storage/local";
import { setAuthToken } from "../api/client";

async function refreshTokenIfNeeded() {
  const { token, user } = await loadAuth();
  if (!token || token === "OFFLINE") {
    const parsedUser = user ? JSON.parse(user) : null;
    const identity = parsedUser?.employeeId;
    if (!identity) return false;
    const cached = await findOfflineCredential(identity);
    if (!cached) return false;
    const { data } = await api.post("/auth/login", { identity: cached.identity, password: cached.password });
    await saveAuth(data.token, JSON.stringify(data.user));
    setAuthToken(data.token);
    return true;
  }
  return true;
}

async function syncMasterData() {
  try {
    await refreshTokenIfNeeded();
    const { data } = await api.get("/metadata/master");
    await saveMasterData({ ...data, updatedAt: new Date().toISOString() });
    return true;
  } catch {
    return false;
  }
}

function resolveMasterIds(entry: any, masterData: any) {
  const localCodePrefix = "local:code:";
  const localCompanyPrefix = "local:company:";
  let productCodeId = entry.productCodeId;
  let issuedToCompanyId = entry.issuedToCompanyId;

  if (productCodeId?.startsWith(localCodePrefix)) {
    const code = productCodeId.slice(localCodePrefix.length);
    const matchCode = masterData.categories
      .flatMap((c: any) => c.codes)
      .find((c: any) => c.code === code);
    if (matchCode) productCodeId = matchCode.id;
  }

  if (issuedToCompanyId?.startsWith(localCompanyPrefix)) {
    const name = issuedToCompanyId.slice(localCompanyPrefix.length);
    const matchCompany = masterData.companies.find((c: any) => c.name === name);
    if (matchCompany) issuedToCompanyId = matchCompany.id;
  }

  return { ...entry, productCodeId, issuedToCompanyId };
}

export async function syncPendingEntries() {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return { synced: 0, masterUpdated: false };

  const queue = await getQueue();
  const pending = queue.filter((q) => q.status !== "SYNCED");
  const masterUpdated = await syncMasterData();
  if (!pending.length) return { synced: 0, masterUpdated };

  const masterData = await loadMasterData();
  const payload = pending
    .map(({ localId, status, createdAt, ...rest }) => resolveMasterIds(rest, masterData))
    .map(({ localId, status, createdAt, ...rest }) => rest);

  try {
    await refreshTokenIfNeeded();
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
    return { synced: syncedRefs.size, masterUpdated };
  } catch {
    const failed = queue.map((q) => (q.status === "PENDING" ? { ...q, status: "FAILED" as const } : q));
    await saveQueue(failed);
    return { synced: 0, masterUpdated };
  }
}
