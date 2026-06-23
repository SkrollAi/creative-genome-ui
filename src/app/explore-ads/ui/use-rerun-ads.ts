"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import { useAdsFiltersStore } from "./use-ads-filters";

export function useRerunAds() {
  const qc = useQueryClient();
  const { selected } = useAdAccount();
  const { filters } = useAdsFiltersStore();

  return useMutation({
    mutationFn: (dateRange: string | { from: string; to: string }) =>
      api.post("/creative_genome/ads/rerun", {
        account_id: selected?.account_id,
        date_range: dateRange,
        filters: {
          ad_name: filters.ad_name,
          adset_name: filters.adset_name,
          campaign_name: filters.campaign_name,
          creative_type: filters.type,
          status: filters.status,
          sort: filters.sort,
          order: filters.order,
        },
      }),
    onSuccess: (res) => {
      const { metrics_saved, ads_queried } = res.data.data ?? {};
      toast.success(
        `Synced — ${metrics_saved ?? 0} metrics updated across ${
          ads_queried ?? 0
        } ads`
      );
      qc.invalidateQueries({ queryKey: ["ads", selected?.account_id] });
    },
    onError: () => toast.error("Rerun failed"),
  });
}
