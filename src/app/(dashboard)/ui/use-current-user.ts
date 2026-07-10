import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export type CurrentUser = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export function useCurrentUser() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: ["current-user", userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data.data as CurrentUser;
    },
    enabled: !!userId,
  });
}
