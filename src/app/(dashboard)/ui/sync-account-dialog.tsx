"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAdAccount, type AdAccount } from "@/context/ad-account-context";
import { getAccountStatusLabel } from "@/lib/ad-account-status";

type Props = {
  account: AdAccount | null;
  onClose: () => void;
};

export function SyncAccountDialog({ account, onClose }: Props) {
  const { accounts, setAccounts } = useAdAccount();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    if (!account) return;
    setSyncing(true);
    try {
      await api.post("/creative_genome/ad-accounts/sync", {
        account_id: account.account_id,
      });
      setAccounts(
        accounts.map((a) =>
          a.account_id === account.account_id
            ? { ...a, is_syncing: true }
            : a
        )
      );
      toast.success("Sync started — this can take a while, check back soon");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start sync");
      onClose();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Dialog open={!!account} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="size-4" />
            Sync {account?.name}
          </DialogTitle>
          <DialogDescription>
            Status: {getAccountStatusLabel(account?.account_status ?? null)}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          We&apos;ll collect all active and paused ads for this account. This
          can take a while depending on how many ads it has — once it&apos;s
          done, you&apos;ll be able to explore, tag, and report on them here.
          We&apos;ll only fetch creatives for pages you have access to.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={syncing}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
