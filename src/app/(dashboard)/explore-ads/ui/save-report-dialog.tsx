"use client";

import { useState } from "react";
import { BookmarkPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import { useAdsFilters } from "./use-ads-filters";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SaveReportDialog({ open, onClose }: Props) {
  const { selected } = useAdAccount();
  const { filters } = useAdsFilters();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post("/creative_genome/reports/create", {
        account_id: selected?.account_id,
        name: name.trim(),
        filters: {
          ad_name: filters.ad_name,
          adset_name: filters.adset_name,
          campaign_name: filters.campaign_name,
          creative_type: filters.type,
          status: filters.status,
          sort: filters.sort,
          order: filters.order,
          limit: filters.limit,
          date_from: filters.date_from,
          date_to: filters.date_to,
          launched_at_from: filters.launched_at_from,
          launched_at_to: filters.launched_at_to,
          metric_filters: filters.metric_filters ?? [],
        },
      });
      qc.invalidateQueries({ queryKey: ["reports", selected?.account_id] });
      toast.success(`Report "${name.trim()}" saved`);
      setName("");
      onClose();
    } catch {
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setName("");
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="size-4" />
            Save as report
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-name">Report name</Label>
            <Input
              id="report-name"
              placeholder="e.g. Top video ads — June"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Save report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
