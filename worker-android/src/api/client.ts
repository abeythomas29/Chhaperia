declare const process: { env: Record<string, string | undefined> };

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://chhaperia-cables-backend.onrender.com";
let authToken: string | null = null;

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(path, baseURL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T = any>(method: "GET" | "POST", path: string, body?: unknown, options?: RequestOptions) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(buildUrl(path, options?.params), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error((data && (data.message as string)) || `HTTP ${response.status}`);
  }

  return { data: data as T };
}

export const api = {
  get: <T = any>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T = any>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
};

export function setAuthToken(token: string | null) {
  authToken = token;
}
