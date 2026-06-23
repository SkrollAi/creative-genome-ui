"use client";

import { useReport } from "./use-report";

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Never synced";
  const normalized = dateStr.includes("Z")
    ? dateStr
    : dateStr.replace(" ", "T") + "Z";
  const diff = Date.now() - new Date(normalized).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Synced ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Synced ${hrs}h ago`;
  return `Synced ${Math.floor(hrs / 24)}d ago`;
}

function dateRangeLabel(dr: string | { from: string; to: string } | undefined) {
  if (!dr) return "last 14 days";
  if (typeof dr === "string") return dr.replace(/_/g, " ");
  return `${dr.from} – ${dr.to}`;
}

export function ReportHeader({ id }: { id: string }) {
  const { data: report } = useReport(id);
  if (!report) return null;

  return (
    <div className="px-6 py-5 border-b border-border">
      <h1 className="text-xl font-semibold tracking-tight truncate">
        {report.name}
      </h1>
      <p className="text-xs text-muted-foreground mt-0.5">
        {timeAgo(report.last_rerun_at)} ·{" "}
        {dateRangeLabel(report.filters.date_range)}
      </p>
    </div>
  );
}
