"use client";

import { EllipsisVertical, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "./use-current-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function UserMenu() {
  const clearAuthParams = useAuthStore((state) => state.clearAuthParams);
  const { data: user, isLoading } = useCurrentUser();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  function handleSignOut() {
    clearAuthParams();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild className="cursor-default">
          <div>
            {isLoading ? (
              <Skeleton className="size-8 rounded-full shrink-0" />
            ) : (
              <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground text-xs font-semibold">
                  {initials}
                </span>
              </div>
            )}
            <div className="flex flex-col min-w-0 flex-1 gap-1 group-data-[collapsible=icon]:hidden">
              {isLoading ? (
                <>
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <span className="text-sm font-medium truncate leading-tight">
                    {fullName || "—"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate leading-tight">
                    {user?.email ?? ""}
                  </span>
                </>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded-md hover:bg-sidebar-accent shrink-0 group-data-[collapsible=icon]:hidden"
                >
                  <EllipsisVertical className="size-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" sideOffset={4}>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
