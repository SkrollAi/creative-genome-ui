"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronsUpDown, Building2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAdAccount, type AdAccount } from "@/context/ad-account-context";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SyncAccountDialog } from "./sync-account-dialog";
import { useAdsFiltersStore } from "@/app/(dashboard)/explore-ads/ui/use-ads-filters";
import { useAdsMetrics } from "@/app/(dashboard)/explore-ads/ui/ads-metrics-store";
import { useTaggingFiltersStore } from "@/app/(dashboard)/tagging/ui/use-tagging";
import { useMatrixStore } from "@/app/(dashboard)/matrix/ui/use-matrix";

const GROUPS: { status: AdAccount["status"]; label: string }[] = [
  { status: "synced", label: "Synced" },
  { status: "syncing", label: "Syncing" },
  { status: "unsynced", label: "Not synced" },
];

export function AccountSelector() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { accounts, setAccounts, selected, setSelected } = useAdAccount();
  const [syncAccount, setSyncAccount] = useState<AdAccount | null>(null);
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["ad-accounts"],
    queryFn: async () => {
      const res = await api.get("/creative_genome/ad-accounts/list");
      const { synced = [], syncing = [], unsynced = [] } = res.data;
      const map = (list: any[], status: AdAccount["status"]): AdAccount[] =>
        list.map((a) => ({
          ad_account_id: a.ad_account_id,
          name: a.name,
          status,
          synced_account_id: a.synced_account_id,
          sync_had_errors: a.sync_had_errors,
          last_synced_at: a.last_synced_at,
          synced_by: a.synced_by,
          started_by: a.started_by,
        }));
      return [
        ...map(synced, "synced"),
        ...map(syncing, "syncing"),
        ...map(unsynced, "unsynced"),
      ] as AdAccount[];
    },
    refetchInterval: (query) =>
      (query.state.data ?? []).some((a) => a.status === "syncing") ? 10000 : false,
  });

  useEffect(() => {
    if (!data) return;
    setAccounts(data);
    if (selected && !data.some((a) => a.ad_account_id === selected.ad_account_id)) {
      setSelected(null);
    }
  }, [data]);

  function handleSelect(account: AdAccount) {
    if (account.status !== "synced") {
      if (account.status === "syncing") {
        toast.info(`"${account.name}" is still syncing — check back soon.`);
        return;
      }
      setSyncAccount(account);
      setOpen(false);
      return;
    }
    setSelected(account);
    setOpen(false);
    // Every other CG store is scoped to "whatever account/report is
    // currently active" — none of it carries meaning across an account
    // switch, so it's reset here rather than left stale for the new
    // account. useAdAccount itself is deliberately excluded, since it's
    // what we just set.
    useAdsFiltersStore.getState().reset();
    useAdsMetrics.getState().reset();
    useTaggingFiltersStore.getState().reset();
    useMatrixStore.getState().reset();
    router.push("/explore-ads");
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>

            <PopoverContent
              className="w-80 p-0"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <Command>
                <CommandInput placeholder="Search ad accounts..." />
                <CommandList>
                  <CommandEmpty className="text-muted-foreground">
                    No ad accounts found.
                  </CommandEmpty>
                  {GROUPS.map(({ status, label }) => {
                    const group = (accounts ?? []).filter((a) => a.status === status);
                    if (!group.length) return null;
                    return (
                      <CommandGroup key={status} heading={`${label} (${group.length})`}>
                        {group.map((account) => (
                          <CommandItem
                            key={account.ad_account_id}
                            value={`${account.name} ${account.ad_account_id}`}
                            onSelect={() => handleSelect(account)}
                            className="items-start gap-2 py-2"
                          >
                            <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                              <span className="text-sm font-medium leading-tight truncate">
                                {account.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                {status === "syncing" ? (
                                  <span className="text-amber-600">
                                    Syncing
                                    {account.started_by
                                      ? ` — started by ${account.started_by.name}`
                                      : ""}
                                  </span>
                                ) : status === "synced" && account.sync_had_errors ? (
                                  <span className="text-amber-600">
                                    Synced with errors
                                    {account.synced_by
                                      ? ` — by ${account.synced_by.name}`
                                      : ""}
                                  </span>
                                ) : status === "synced" ? (
                                  <span className="text-emerald-600">
                                    Synced
                                    {account.synced_by
                                      ? ` — by ${account.synced_by.name}`
                                      : ""}
                                  </span>
                                ) : (
                                  <span>Not synced yet</span>
                                )}
                              </div>
                            </div>
                            {status === "synced" &&
                              selected?.ad_account_id === account.ad_account_id && (
                                <Check className="size-3.5 shrink-0 text-foreground" />
                              )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarMenu>

      <SyncAccountDialog
        account={syncAccount}
        onClose={() => setSyncAccount(null)}
      />
    </>
  );
}
