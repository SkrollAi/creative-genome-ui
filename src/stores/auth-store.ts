import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userId: string | null;
  setAuthParams: (userId: string) => void;
  clearAuthParams: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      setAuthParams: (userId: string) => set({ userId }),
      clearAuthParams: () => set({ userId: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
