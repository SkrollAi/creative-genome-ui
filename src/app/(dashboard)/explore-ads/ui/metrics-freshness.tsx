"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAds, useForceRefreshAds } from "./use-ads";

function timeAgoLabel(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function MetricsFreshness() {
  const { data, isFetching } = useAds();
  const forceRefresh = useForceRefreshAds();
  const [refreshing, setRefreshing] = useState(false);

  if (!data?.fetched_at) return null;

  const staleAt =
    new Date(data.fetched_at).getTime() + data.ttl_minutes * 60 * 1000;
  const isStale = Date.now() > staleAt;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await forceRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
      <span className={cn(isStale && "text-destructive")}>
        Updated {timeAgoLabel(data.fetched_at)}
      </span>
      <button
        onClick={handleRefresh}
        disabled={refreshing || isFetching}
        className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-40"
        title="Force refresh from Meta"
      >
        <RefreshCw
          className={cn("size-3", (refreshing || isFetching) && "animate-spin")}
        />
      </button>
    </div>
  );
}
