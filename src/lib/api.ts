import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = process.env.NEXT_PUBLIC_BACKEND_TOKEN;
  config.headers.Authorization = `Bearer ${token}`;

  const userId = useAuthStore.getState().userId;
  if (userId) {
    if (config.method === "get") {
      config.params = { ...config.params, userId };
    } else {
      config.data = { ...config.data, userId };
    }
  }

  return config;
});

// Backend always returns HTTP 200 with {success, error} — reject here so
// every caller's normal catch/onError path gets the real backend message
// instead of having to check response.data.success manually everywhere.
api.interceptors.response.use((response) => {
  if (response.data && response.data.success === false) {
    return Promise.reject(
      new Error(response.data.error || response.data.message || "Request failed")
    );
  }
  return response;
});

export default api;
