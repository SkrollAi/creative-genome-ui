"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdAccount } from "@/context/ad-account-context";
import { RerunDialog } from "@/app/reports/ui/rerun-dialog";
import { useRerunAds } from "./use-rerun-ads";

export function RerunAdsButton() {
  const { selected } = useAdAccount();
  const [open, setOpen] = useState(false);
  const { mutate: rerun, isPending } = useRerunAds();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-sm shrink-0 h-9"
        disabled={!selected || isPending}
        onClick={() => setOpen(true)}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Rerun
      </Button>

      <RerunDialog
        report={null}
        open={open}
        onClose={() => setOpen(false)}
        isPending={isPending}
        onConfirm={(_, dateRange) => {
          rerun(dateRange ?? "last_14d", { onSuccess: () => setOpen(false) });
        }}
      />
    </>
  );
}
