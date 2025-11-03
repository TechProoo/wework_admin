import axios from "axios";

const API_BASE =
  (import.meta.env as any).VITE_API_BASE_URL ||
  (import.meta.env as any).VITE_API_URL ||
  "";

export const httpClient = axios.create({
  baseURL: API_BASE || undefined,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  return config;
});
