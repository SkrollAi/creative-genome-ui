"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAdsFilters, SORT_OPTIONS, CREATIVE_TYPES } from "./use-ads-filters";
import { useAds } from "./use-ads";
import { MetricsSelector } from "./metrics-selector";
import { SaveReportDialog } from "./save-report-dialog";
import { useAdAccount } from "@/context/ad-account-context";

export function AdsToolbar() {
  const { filters, setFilters } = useAdsFilters();
  const { data, isFetching } = useAds();
  const { selected } = useAdAccount();
  const pagination = data?.pagination;
  const [saveOpen, setSaveOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(filters.q);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.q) setFilters({ q: searchInput, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setSearchInput(filters.q); }, [filters.q]);

  const currentSort = SORT_OPTIONS.find((o) => o.value === filters.sort);

  return (
    <div className="flex flex-col gap-3 px-6 py-4 border-b border-border">
      {/* Row 1 — search + actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search ad name, campaign or ad set…"
            className="pl-9 h-9 bg-background"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-sm shrink-0"
          disabled={!selected}
          onClick={() => setSaveOpen(true)}
        >
          <BookmarkPlus className="size-4" />
          Save as report
        </Button>
      </div>

      <SaveReportDialog open={saveOpen} onClose={() => setSaveOpen(false)} />

      {/* Row 2 — type tabs + sort + metrics + count */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Creative type tabs */}
        <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
          {CREATIVE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilters({ type: t.value, page: 1 })}
              className={cn(
                "px-3 h-7 rounded-md text-sm font-medium transition-colors",
                filters.type === t.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-sm h-8">
              <SlidersHorizontal className="size-3.5" />
              Sort: <span className="font-semibold">{currentSort?.label}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuRadioGroup
              value={filters.sort}
              onValueChange={(v) => setFilters({ sort: v, page: 1 })}
            >
              {SORT_OPTIONS.map((o) => (
                <DropdownMenuRadioItem key={o.value} value={o.value}>
                  {o.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Metrics */}
        <MetricsSelector />

        {/* Count */}
        {pagination && (
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-auto">
            {isFetching ? "Loading…" : `${pagination.total_items} ads`}
          </span>
        )}
      </div>
    </div>
  );
}
