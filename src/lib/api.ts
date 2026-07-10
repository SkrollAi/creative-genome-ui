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

export default api;
