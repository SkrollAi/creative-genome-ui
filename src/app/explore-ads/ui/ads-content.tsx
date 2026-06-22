"use client";

import { useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdAccount } from "@/context/ad-account-context";
import { useAds } from "./use-ads";
import { useAdsFilters } from "./use-ads-filters";
import { AdsCard } from "./ads-card";
import { AdsSheet } from "./ads-sheet";
import type { Ad } from "./ads-card";

export function AdsContent() {
  const { selected } = useAdAccount();
  const { data, isLoading, isError, isFetching } = useAds();
  const { filters, setFilters } = useAdsFilters();
  const pagination = data?.pagination;
  const [sheetAd, setSheetAd] = useState<Ad | null>(null);

  if (!selected) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Select an ad account from the sidebar to get started.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading ads…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-destructive text-sm">
        Failed to load ads. Make sure the backend is running.
      </div>
    );
  }

  const ads = data?.ads ?? [];

  return (
    <>
    <AdsSheet ad={sheetAd} open={!!sheetAd} onClose={() => setSheetAd(null)} />
    <div className="flex flex-col flex-1">
      <div
        className={`flex-1 px-6 py-6 transition-opacity ${
          isFetching ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {ads.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No ads found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {ads.map((ad) => (
              <AdsCard key={ad.ad_id} ad={ad} onSelect={setSheetAd} />
            ))}
          </div>
        )}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.has_prev}
              onClick={() => setFilters({ page: filters.page - 1 })}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.has_next}
              onClick={() => setFilters({ page: filters.page + 1 })}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
