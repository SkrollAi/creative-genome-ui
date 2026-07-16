"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import { useAdsFiltersStore } from "./use-ads-filters";
import { toBackendMetricField } from "./ads-metrics-store";
import type { Creative } from "./ads-card";

type Pagination = {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type AdsResponse = {
  creatives: Creative[];
  pagination: Pagination;
  fetched_at: string | null;
  ttl_minutes?: number;
  window_days?: number;
  window_date_from?: string;
  window_date_to?: string;
};

export function useAds(reportId?: string) {
  const { selected } = useAdAccount();
  const { filters } = useAdsFiltersStore();

  return useQuery({
    queryKey: ["ads", selected?.account_id, reportId, filters],
    queryFn: async (): Promise<AdsResponse> => {
      if (reportId) {
        const res = await api.post("/creative_genome/reports/creatives", {
          report_id: reportId,
          ad_name: filters.ad_name,
          adset_name: filters.adset_name,
          campaign_name: filters.campaign_name,
          creative_type: filters.type,
          status: filters.status,
          sort: toBackendMetricField(filters.sort),
          order: filters.order,
          date_from: filters.date_from,
          date_to: filters.date_to,
          launched_at_from: filters.launched_at_from,
          launched_at_to: filters.launched_at_to,
          page: filters.page,
          limit: filters.limit,
          ...(filters.metric_filters?.length && {
            metric_filters: filters.metric_filters.map((f) => ({
              ...f,
              metric: toBackendMetricField(f.metric),
            })),
          }),
        });
        return res.data;
      }

      const res = await api.post("/creative_genome/explore-ads/list", {
        account_id: selected?.account_id,
        ad_name: filters.ad_name,
        adset_name: filters.adset_name,
        campaign_name: filters.campaign_name,
        creative_type: filters.type,
        status: filters.status,
        sort: toBackendMetricField(filters.sort),
        order: filters.order,
        launched_at_from: filters.launched_at_from,
        launched_at_to: filters.launched_at_to,
        page: filters.page,
        limit: filters.limit,
        ...(filters.metric_filters?.length && {
          metric_filters: filters.metric_filters.map((f) => ({
            ...f,
            metric: toBackendMetricField(f.metric),
          })),
        }),
      });
      return res.data;
    },
    enabled: !!selected?.account_id,
    placeholderData: (prev) => prev,
  });
}

// Report view only — explore-ads is DB-only/cron-fed and has no manual
// refresh of its own.
export function useForceRefreshAds(reportId: string) {
  const { selected } = useAdAccount();
  const { filters } = useAdsFiltersStore();
  const qc = useQueryClient();

  return async () => {
    const res = await api.post("/creative_genome/reports/creatives", {
      report_id: reportId,
      ad_name: filters.ad_name,
      adset_name: filters.adset_name,
      campaign_name: filters.campaign_name,
      creative_type: filters.type,
      status: filters.status,
      sort: toBackendMetricField(filters.sort),
      order: filters.order,
      date_from: filters.date_from,
      date_to: filters.date_to,
      launched_at_from: filters.launched_at_from,
      launched_at_to: filters.launched_at_to,
      page: filters.page,
      limit: filters.limit,
      force: true,
      ...(filters.metric_filters?.length && {
        metric_filters: filters.metric_filters.map((f) => ({
          ...f,
          metric: toBackendMetricField(f.metric),
        })),
      }),
    });
    qc.setQueryData(
      ["ads", selected?.account_id, reportId, filters],
      res.data
    );
  };
}
