"use client";

import { create } from "zustand";
import { METRIC_DEFS } from "./ads-metrics-store";

export const SORT_OPTIONS = METRIC_DEFS.map((d) => ({
  label: d.label,
  value: d.key,
}));

export const CREATIVE_TYPES = [
  { label: "All", value: "all" },
  { label: "Video", value: "video" },
  { label: "Image", value: "image" },
];

export const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

export type AdsFilters = {
  ad_name: string;
  adset_name: string;
  campaign_name: string;
  type: string;
  status: string;
  sort: string;
  order: string;
  page: number;
  limit: number;
};

export const DEFAULT_FILTERS: AdsFilters = {
  ad_name: "",
  adset_name: "",
  campaign_name: "",
  type: "all",
  status: "all",
  sort: "spend",
  order: "desc",
  page: 1,
  limit: 20,
};

type AdsFiltersStore = {
  filters: AdsFilters;
  setFilters: (partial: Partial<AdsFilters>) => void;
  reset: () => void;
};

export const useAdsFiltersStore = create<AdsFiltersStore>((set) => ({
  filters: { ...DEFAULT_FILTERS },
  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),
  reset: () => set({ filters: { ...DEFAULT_FILTERS } }),
}));

export function useAdsFilters() {
  const { filters, setFilters, reset } = useAdsFiltersStore();
  return { filters, setFilters, reset };
}
