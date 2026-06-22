"use client";

import { useState } from "react";
import { Trash2, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAdAccount } from "@/context/ad-account-context";
import {
  useReports,
  useDeleteReport,
  useRerunReport,
  type Report,
} from "./use-reports";
import { RerunDialog } from "./rerun-dialog";

function buildExploreUrl(report: Report) {
  const p = new URLSearchParams();
  if (report.filters.search) p.set("q", report.filters.search);
  if (report.filters.creative_type) p.set("type", report.filters.creative_type);
  if (report.filters.sort_by) p.set("sort", report.filters.sort_by);
  if (report.filters.sort_order) p.set("order", report.filters.sort_order);
  p.set("page", "1");
  return `/explore-ads?${p.toString()}`;
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Never";
  // BE returns naive UTC strings — append Z so JS parses them as UTC
  const normalized = dateStr.includes("Z")
    ? dateStr
    : dateStr.replace(" ", "T") + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ReportsList() {
  const { selected } = useAdAccount();
  const { data: reports, isLoading, isError } = useReports();
  const { mutate: deleteReport, isPending: deleting } = useDeleteReport();
  const { mutate: rerunReport, isPending: rerunning } = useRerunReport();
  const [rerunTarget, setRerunTarget] = useState<Report | null>(null);
  const router = useRouter();

  if (!selected) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Select an ad account from the sidebar to view reports.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading reports…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-destructive text-sm">
        Failed to load reports.
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No reports saved yet. Use "Save as report" on Explore Ads to create one.
      </div>
    );
  }

  return (
    <>
      <RerunDialog
        report={rerunTarget}
        open={!!rerunTarget}
        onClose={() => setRerunTarget(null)}
        isPending={rerunning}
        onConfirm={(report_id, date_range) => {
          rerunReport(
            { report_id, date_range },
            { onSuccess: () => setRerunTarget(null) }
          );
        }}
      />
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex-1">
              <p className="text-sm font-semibold leading-snug">
                {report.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {report.last_rerun_at
                  ? `Synced ${timeAgo(report.last_rerun_at)}`
                  : "Never synced"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5 flex-1"
                onClick={() => router.push(buildExploreUrl(report))}
              >
                <ExternalLink className="size-3.5" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1"
                onClick={() => setRerunTarget(report)}
              >
                <RefreshCw className="size-3.5" />
                Rerun
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                disabled={deleting}
                onClick={() => deleteReport(report.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
