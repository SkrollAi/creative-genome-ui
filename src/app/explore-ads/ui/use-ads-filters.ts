"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
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

export function useAdsFilters() {
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(""),
    type: parseAsString.withDefault("all"),
    sort: parseAsString.withDefault("spend"),
    order: parseAsString.withDefault("desc"),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  });

  return { filters, setFilters };
}
