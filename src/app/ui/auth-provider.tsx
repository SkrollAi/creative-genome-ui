"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const AllowedRoutes = ["/login"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!AllowedRoutes.includes(pathname) && !userId) {
      router.replace("/login");
    } else if (AllowedRoutes.includes(pathname) && userId) {
      router.replace("/");
    }
  }, [mounted, pathname, userId, router]);

  if (!mounted) {
    return null;
  }

  if (
    (!AllowedRoutes.includes(pathname) && !userId) ||
    (AllowedRoutes.includes(pathname) && userId)
  ) {
    return null;
  }

  return <>{children}</>;
}
