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

export const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

export function daysToAbsolute(days: number): {
  date_from: string;
  date_to: string;
} {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return {
    date_from: from.toISOString().split("T")[0],
    date_to: to.toISOString().split("T")[0],
  };
}

function defaultDates() {
  return daysToAbsolute(7);
}

export type MetricFilter = { metric: string; operator: string; value: number };

export type AdsFilters = {
  ad_name: string;
  adset_name: string;
  campaign_name: string;
  type: string;
  status: string;
  sort: string;
  order: string;
  date_from: string;
  date_to: string;
  page: number;
  limit: number;
  metric_filters: MetricFilter[];
};

export function getDefaultFilters(): AdsFilters {
  return {
    ad_name: "",
    adset_name: "",
    campaign_name: "",
    type: "all",
    status: "all",
    sort: "spend",
    order: "desc",
    ...defaultDates(),
    page: 1,
    limit: 20,
    metric_filters: [],
  };
}

type AdsFiltersStore = {
  filters: AdsFilters;
  setFilters: (partial: Partial<AdsFilters>) => void;
  reset: () => void;
};

export const useAdsFiltersStore = create<AdsFiltersStore>((set) => ({
  filters: getDefaultFilters(),
  setFilters: (partial) =>
    set((s) => ({
      filters: { ...s.filters, ...partial, page: partial.page ?? 1 },
    })),
  reset: () => set({ filters: getDefaultFilters() }),
}));

export function useAdsFilters() {
  const { filters, setFilters, reset } = useAdsFiltersStore();
  return { filters, setFilters, reset };
}
