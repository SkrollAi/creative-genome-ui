"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import { useAdsFiltersStore } from "./use-ads-filters";
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
  ttl_minutes: number;
};

export function useAds() {
  const { selected } = useAdAccount();
  const { filters } = useAdsFiltersStore();

  return useQuery({
    queryKey: ["ads", selected?.account_id, filters],
    queryFn: async (): Promise<AdsResponse> => {
      const res = await api.post("/creative_genome/ads/list", {
        account_id: selected?.account_id,
        ad_name: filters.ad_name,
        adset_name: filters.adset_name,
        campaign_name: filters.campaign_name,
        creative_type: filters.type,
        status: filters.status,
        sort: filters.sort,
        order: filters.order,
        date_from: filters.date_from,
        date_to: filters.date_to,
        page: filters.page,
        limit: filters.limit,
        ...(filters.metric_filters?.length && {
          metric_filters: filters.metric_filters,
        }),
      });
      return res.data;
    },
    enabled: !!selected?.account_id,
    placeholderData: (prev) => prev,
  });
}

export function useForceRefreshAds() {
  const { selected } = useAdAccount();
  const { filters } = useAdsFiltersStore();
  const qc = useQueryClient();

  return async () => {
    await api.post("/creative_genome/ads/list", {
      account_id: selected?.account_id,
      ad_name: filters.ad_name,
      adset_name: filters.adset_name,
      campaign_name: filters.campaign_name,
      creative_type: filters.type,
      status: filters.status,
      sort: filters.sort,
      order: filters.order,
      date_from: filters.date_from,
      date_to: filters.date_to,
      page: filters.page,
      limit: filters.limit,
      force: true,
      ...(filters.metric_filters?.length && {
        metric_filters: filters.metric_filters,
      }),
    });
    qc.invalidateQueries({ queryKey: ["ads", selected?.account_id] });
  };
}
