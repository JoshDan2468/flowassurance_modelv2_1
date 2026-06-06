import axios from "axios";

export const API_BASE =
  (typeof window !== "undefined" &&
    (window as unknown as { __FAIP_API__?: string }).__FAIP_API__) ||
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_FAIP_API_URL ||
  "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE || undefined,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});
