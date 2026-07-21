"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronsUpDown, Building2, RefreshCw } from "lucide-react";
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
import { SyncAccountDialog } from "./sync-account-dialog";

export function AccountSelector() {
  const { isMobile } = useSidebar();
  const { accounts, setAccounts, selected, setSelected } = useAdAccount();
  const [syncAccount, setSyncAccount] = useState<AdAccount | null>(null);

  const { data } = useQuery({
    queryKey: ["ad-accounts"],
    queryFn: async () => {
      const res = await api.get("/creative_genome/ad-accounts/list");
      return (res.data.accounts ?? []) as AdAccount[];
    },
    refetchInterval: (query) =>
      (query.state.data ?? []).some((a) => a.is_syncing) ? 10000 : false,
  });

  useEffect(() => {
    if (!data) return;
    setAccounts(data);
    if (selected && !data.some((a) => a.ad_account_id === selected.ad_account_id)) {
      setSelected(null);
    }
  }, [data]);

  function handleSelect(account: AdAccount) {
    if (!account.is_synced) {
      if (account.is_syncing) {
        toast.info(`"${account.name}" is still syncing — check back soon.`);
        return;
      }
      setSyncAccount(account);
      return;
    }
    setSelected(account);
  }

  return (
    <>
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
                    {selected?.ad_account_id ?? "No account selected"}
                  </span>
                </div>
                <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-72 p-0"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground px-3 pt-2.5 pb-1.5">
                {accounts?.length ?? 0} ad account
                {accounts?.length === 1 ? "" : "s"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-0" />
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {(accounts ?? []).map((account) => (
                  <DropdownMenuItem
                    key={account.ad_account_id}
                    onClick={() => handleSelect(account)}
                    className={cn(
                      "flex items-start gap-1 rounded-none px-3 py-2.5 cursor-pointer",
                      !account.is_synced && "opacity-70"
                    )}
                  >
                    <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                      <span className="text-sm font-medium leading-tight">
                        {account.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {account.is_syncing ? (
                          <span className="text-amber-600">Syncing</span>
                        ) : account.is_synced && account.sync_had_errors ? (
                          <span className="text-amber-600">
                            Synced (with errors)
                          </span>
                        ) : account.is_synced ? (
                          <span className="text-emerald-600">Synced</span>
                        ) : (
                          <span className="text-destructive">Not synced</span>
                        )}
                      </div>
                    </div>
                    {account.is_synced && !account.is_syncing && (
                      <button
                        type="button"
                        title="Resync"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSyncAccount(account);
                        }}
                        className="shrink-0 p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <RefreshCw className="size-3.5" />
                      </button>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SyncAccountDialog
        account={syncAccount}
        onClose={() => setSyncAccount(null)}
      />
    </>
  );
}
