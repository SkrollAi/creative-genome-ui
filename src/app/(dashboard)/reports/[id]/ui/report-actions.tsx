"use client";

import { useState } from "react";
import { Save, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useReport } from "./use-report";
import { UpdateReportDialog } from "./update-report-dialog";
import { DeleteReportDialog } from "./delete-report-dialog";

export function ReportActions({ id }: { id: string }) {
  const { data: report } = useReport(id);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const qc = useQueryClient();

  if (!report) return null;

  async function handleRefreshAdIds() {
    setRefreshing(true);
    try {
      const { data } = await api.post(
        "/creative_genome/reports/refresh-ad-ids",
        { report_id: id }
      );
      if (!data.success) {
        toast.error(data.error ?? "Failed to refresh ad ids");
        return;
      }
      toast.success(
        `Ad ids refreshed — ${data.added} added, ${data.removed} removed, ${data.total_ads} total`
      );
      qc.invalidateQueries({ queryKey: ["ads"] });
    } catch {
      toast.error("Failed to refresh ad ids");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-9 text-sm shrink-0"
        disabled={refreshing}
        onClick={handleRefreshAdIds}
        title="Re-run this report's filters against current ads and update the captured set"
      >
        <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
        Refresh ad ids
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-9 text-sm shrink-0"
        onClick={() => setUpdateOpen(true)}
      >
        <Save className="size-4" />
        Update report
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-9 text-sm shrink-0 text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>

      <UpdateReportDialog
        report={report}
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
      />

      <DeleteReportDialog
        report={report}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
