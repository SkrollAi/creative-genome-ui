"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const SORT_OPTIONS = [
  { label: "Spend",       value: "spend" },
  { label: "ROAS",        value: "roas" },
  { label: "CPA",         value: "cpa" },
  { label: "CTR",         value: "ctr" },
  { label: "CPM",         value: "cpm" },
  { label: "CPC",         value: "cpc" },
  { label: "Purchases",   value: "purchases" },
  { label: "Impressions", value: "impressions" },
  { label: "Reach",       value: "reach" },
  { label: "Hook rate",   value: "hook_rate" },
  { label: "Hold rate",   value: "hold_rate" },
  { label: "ATC rate",    value: "atc_rate" },
];

export const CREATIVE_TYPES = [
  { label: "All",   value: "all" },
  { label: "Video", value: "video" },
  { label: "Image", value: "image" },
];

export function useAdsFilters() {
  const [filters, setFilters] = useQueryStates({
    q:     parseAsString.withDefault(""),
    type:  parseAsString.withDefault("all"),
    sort:  parseAsString.withDefault("spend"),
    order: parseAsString.withDefault("desc"),
    page:  parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  });

  return { filters, setFilters };
}
