"use client";

import { useEffect } from "react";
import { useAdsFilters } from "@/app/explore-ads/ui/use-ads-filters";
import { useReport } from "./use-report";

export function ReportFilterInitializer({ id }: { id: string }) {
  const { data: report } = useReport(id);
  const { setFilters, reset } = useAdsFilters();

  // Clear on mount so we never show stale explore-ads state
  useEffect(() => {
    reset();
  }, [id]);

  // Apply saved filters once report loads
  useEffect(() => {
    if (!report) return;
    const f = report.filters;
    setFilters({
      ad_name: f.ad_name ?? "",
      adset_name: f.adset_name ?? "",
      campaign_name: f.campaign_name ?? "",
      type: f.creative_type ?? "all",
      status: f.status ?? "all",
      sort: f.sort_by ?? "spend",
      order: f.sort_order ?? "desc",
      page: 1,
    });
  }, [report?.id]);

  return null;
}
