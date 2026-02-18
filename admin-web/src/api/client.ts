import axios from "axios";

const baseURL =
  (globalThis as { __API_BASE_URL__?: string }).__API_BASE_URL__ ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:4000";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
