"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAdAccount, type AdAccount } from "@/context/ad-account-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AccountSelector() {
  const { isMobile } = useSidebar();
  const { accounts, setAccounts, selected, setSelected } = useAdAccount();

  const { data } = useQuery({
    queryKey: ["ad-accounts"],
    queryFn: async () => {
      const res = await api.get("/creative_genome/ad-accounts/list");
      return res.data.data as AdAccount[];
    },
  });

  useEffect(() => {
    if (!data) return;
    setAccounts(data);
    // Auto-select first synced account if nothing stored
    if (!selected) {
      const first = data.find((a) => a.is_synced);
      if (first) setSelected(first);
    }
  }, [data]);

  function handleSelect(account: AdAccount) {
    if (!account.is_synced) {
      toast.error(`"${account.name}" hasn't been synced yet.`);
      return;
    }
    setSelected(account);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Building2 className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium truncate leading-tight">
                  {selected?.name ?? "Select account"}
                </span>
                <span className="text-[11px] text-muted-foreground truncate leading-tight">
                  {selected?.account_id ?? "No account selected"}
                </span>
              </div>
              <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Ad Accounts
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(accounts ?? []).map((account) => (
              <DropdownMenuItem
                key={account.account_id}
                onClick={() => handleSelect(account)}
                className={cn(
                  "flex flex-col items-start gap-0.5 cursor-pointer",
                  !account.is_synced && "opacity-50"
                )}
              >
                <span className="text-sm font-medium">{account.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {account.account_id}
                  {!account.is_synced && (
                    <span className="text-destructive font-medium">
                      · not synced
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
