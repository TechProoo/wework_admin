import axios from "axios";

// Prefer explicit VITE_API_BASE_URL or VITE_API_URL; otherwise default to localhost:3000 for local dev
const API_BASE =
  (import.meta.env as any).VITE_API_BASE_URL ||
  (import.meta.env as any).VITE_API_URL ||
  "http://localhost:3000";

export const httpClient = axios.create({
  baseURL: API_BASE || undefined,
  withCredentials: true,
  // don't let requests hang indefinitely — fail fast so the UI can recover
  timeout: 15000,
});
// helpful debug: show which base URL the client is using when running locally
console.debug("httpClient baseURL:", API_BASE);
// Pass through the request config (placeholder for auth headers)
httpClient.interceptors.request.use((config) => config);

// Surface response errors with clearer messages so callers don't hang.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize axios error to something easier to log/use
    const msg =
      error?.response?.data?.message || error?.message || "Network error";
    console.error("HTTP error:", msg, error?.response?.data ?? error);
    return Promise.reject(new Error(msg));
  }
);
