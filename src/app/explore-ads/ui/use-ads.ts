"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import { useAdsFilters } from "./use-ads-filters";
import type { Ad } from "./ads-card";

type Pagination = {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type AdsResponse = {
  ads: Ad[];
  pagination: Pagination;
};

export function useAds() {
  const { selected } = useAdAccount();
  const { filters } = useAdsFilters();

  return useQuery({
    queryKey: ["ads", selected?.account_id, filters],
    queryFn: async (): Promise<AdsResponse> => {
      const res = await api.post("/creative_genome/ads/list", {
        account_id:    selected?.account_id,
        search:        filters.q,
        creative_type: filters.type,
        sort_by:       filters.sort,
        sort_order:    filters.order,
        page:          filters.page,
        limit:         filters.limit,
      });
      return res.data.data;
    },
    enabled: !!selected?.account_id,
    placeholderData: (prev) => prev,
  });
}
