"use client";

import { useEffect } from "react";
import {
  useAdsFilters,
  daysToAbsolute,
} from "@/app/explore-ads/ui/use-ads-filters";
import { useReport } from "./use-report";

export function ReportFilterInitializer({ id }: { id: string }) {
  const { data: report } = useReport(id);
  const { setFilters, reset } = useAdsFilters();

  useEffect(() => {
    reset();
  }, [id]);

  useEffect(() => {
    if (!report) return;
    const f = report.filters;

    // Resolve date range — saved reports store absolute date_from/date_to
    const defaultDates = daysToAbsolute(7);
    const date_from = f.date_from ?? defaultDates.date_from;
    const date_to = f.date_to ?? defaultDates.date_to;

    setFilters({
      ad_name: f.ad_name ?? "",
      adset_name: f.adset_name ?? "",
      campaign_name: f.campaign_name ?? "",
      type: f.creative_type ?? "all",
      status: f.status ?? "all",
      sort: f.sort ?? "spend",
      order: f.order ?? "desc",
      date_from,
      date_to,
      metric_filters: f.metric_filters ?? [],
      page: 1,
    });
  }, [report?.id]);

  return null;
}
