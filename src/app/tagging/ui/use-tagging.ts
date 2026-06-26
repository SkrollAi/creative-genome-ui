"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import { daysToAbsolute } from "@/app/explore-ads/ui/use-ads-filters";
import type { Creative } from "@/app/explore-ads/ui/ads-card";

// ── date filter store (tagging-scoped, independent of explore-ads) ─────────

export type TaggingFilters = {
  date_from: string;
  date_to: string;
  sort: string;
  page: number;
  creative_type: "all" | "video" | "image";
};

function defaultFilters(): TaggingFilters {
  return { ...daysToAbsolute(7), sort: "is_tagged", page: 1, creative_type: "all" };
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

  return useQuery({
    queryKey: ["tagging-creatives", selected?.account_id, filters],
    queryFn: async () => {
      const res = await api.post("/creative_genome/ads/list", {
        account_id: selected?.account_id,
        sort: filters.sort,
        order: filters.sort === "is_tagged" ? "asc" : "desc",
        date_from: filters.date_from,
        date_to: filters.date_to,
        page: filters.page,
        limit: 10,
        ...(filters.creative_type !== "all" && { creative_type: filters.creative_type }),
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
    enabled: !!selected?.account_id && !!filters.date_from,
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
    },
  });
}
