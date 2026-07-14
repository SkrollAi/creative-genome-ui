"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
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
import { useAdsFilters } from "@/app/(dashboard)/explore-ads/ui/use-ads-filters";
import type { Report } from "@/app/(dashboard)/reports/ui/use-reports";

type Props = {
  report: Report;
  open: boolean;
  onClose: () => void;
};

export function UpdateReportDialog({ report, open, onClose }: Props) {
  const { selected } = useAdAccount();
  const { filters } = useAdsFilters();
  const qc = useQueryClient();
  const [name, setName] = useState(report.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(report.name);
  }, [open, report.name]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post("/creative_genome/reports/update", {
        report_id: report.id,
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
      qc.invalidateQueries({ queryKey: ["report", report.id] });
      qc.invalidateQueries({ queryKey: ["reports", selected?.account_id] });
      toast.success("Report updated");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update report");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="size-4" />
            Update report
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="report-name">Report name</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Current filters will also be saved with this report.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
