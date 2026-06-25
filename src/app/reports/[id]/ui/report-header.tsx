"use client";

import { useReport } from "./use-report";

function dateRangeLabel(date_from?: string, date_to?: string) {
  if (date_from && date_to) return `${date_from} – ${date_to}`;
  return "";
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
        {dateRangeLabel(report.filters.date_from, report.filters.date_to)}
      </p>
    </div>
  );
}
