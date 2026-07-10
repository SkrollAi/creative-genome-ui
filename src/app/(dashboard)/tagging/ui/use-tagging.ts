"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import type { Creative } from "@/app/(dashboard)/explore-ads/ui/ads-card";
import type { Report } from "@/app/(dashboard)/reports/ui/use-reports";

export type TaggingFilters = {
  page: number;
  creative_type: "all" | "video" | "image";
  selected_report: Report | null;
};

function defaultFilters(): TaggingFilters {
  return { page: 1, creative_type: "all", selected_report: null };
}

type TaggingFiltersStore = {
  filters: TaggingFilters;
  setFilters: (partial: Partial<TaggingFilters>) => void;
  reset: () => void;
};

export const useTaggingFiltersStore = create<TaggingFiltersStore>((set) => ({
  filters: defaultFilters(),
  setFilters: (partial) =>
    set((s) => ({
      filters: { ...s.filters, ...partial, page: partial.page ?? 1 },
    })),
  reset: () => set({ filters: defaultFilters() }),
}));

// ── creatives list ────────────────────────────────────────────────────────────

export function useTaggingCreatives() {
  const { selected } = useAdAccount();
  const { filters } = useTaggingFiltersStore();
  const report = filters.selected_report;

  return useQuery({
    queryKey: ["tagging-creatives", selected?.account_id, filters],
    queryFn: async () => {
      const res = await api.post("/creative_genome/ads/list", {
        account_id: selected?.account_id,
        date_from: report?.filters.date_from,
        date_to: report?.filters.date_to,
        sort: "is_tagged",
        order: "asc",
        ...(report?.filters.status &&
          report.filters.status !== "all" && { status: report.filters.status }),
        ...(report?.filters.search && { search: report.filters.search }),
        ...(report?.filters.campaign_name && {
          campaign_name: report.filters.campaign_name,
        }),
        ...(report?.filters.adset_name && {
          adset_name: report.filters.adset_name,
        }),
        ...(report?.filters.ad_name && { ad_name: report.filters.ad_name }),
        ...(report?.filters.metric_filters?.length && {
          metric_filters: report.filters.metric_filters,
        }),
        page: filters.page,
        limit: 10,
        creative_type: filters.creative_type,
      });
      return res.data.data as {
        creatives: Creative[];
        pagination: {
          current_page: number;
          total_pages: number;
          has_next: boolean;
          has_prev: boolean;
          total_items: number;
        };
      };
    },
    enabled: !!selected?.account_id && !!report,
    placeholderData: (prev) => prev,
  });
}

// ── tag library ───────────────────────────────────────────────────────────────

export type TagCategory = {
  key: string;
  label: string;
  description: string;
  defaults: string[];
  custom_tags: string[];
};

export function useTagLibrary() {
  const { selected } = useAdAccount();

  return useQuery({
    queryKey: ["tag-library", selected?.account_id],
    queryFn: async () => {
      const res = await api.get("/creative_genome/tags/library", {
        params: { account_id: selected?.account_id },
      });
      return res.data.data.library as TagCategory[];
    },
    enabled: !!selected?.account_id,
  });
}

// ── save tags ─────────────────────────────────────────────────────────────────

export function useSaveTags() {
  const { selected } = useAdAccount();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      creative_id: string;
      tags: Record<string, string[]>;
    }) => {
      const res = await api.post("/creative_genome/tags/save", payload, {
        params: { account_id: selected?.account_id },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["tagging-creatives", selected?.account_id],
      });
      qc.invalidateQueries({ queryKey: ["ads", selected?.account_id] });
      qc.invalidateQueries({ queryKey: ["tag-library", selected?.account_id] });
    },
  });
}
