"use client";

import { useEffect } from "react";
import { useAdsFilters } from "./use-ads-filters";

export function FiltersReset() {
  const { reset } = useAdsFilters();
  useEffect(() => {
    reset();
  }, []);
  return null;
}
