"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useAdsFilters,
  SORT_OPTIONS,
  CREATIVE_TYPES,
  STATUS_OPTIONS,
} from "./use-ads-filters";
import { useAds } from "./use-ads";
import { MetricsSelector } from "./metrics-selector";
import { MetricFilters } from "./metric-filters";
import { SaveReportDialog } from "./save-report-dialog";
import { SmartSearch } from "./smart-search";
import { DateRangePicker } from "./date-range-picker";
import { MetricsFreshness } from "./metrics-freshness";
import { useAdAccount } from "@/context/ad-account-context";

type Props = { actions?: React.ReactNode; hideSave?: boolean };

export function AdsToolbar({ actions, hideSave }: Props) {
  const { filters, setFilters } = useAdsFilters();
  const { data, isFetching } = useAds();
  const { selected } = useAdAccount();
  const pagination = data?.pagination;
  const [saveOpen, setSaveOpen] = useState(false);

  const currentSort = SORT_OPTIONS.find((o) => o.value === filters.sort);

  return (
    <div className="flex flex-col gap-3 px-6 py-4 border-b border-border">
      {/* Row 1 — smart search + injected actions + save */}
      <div className="flex items-start gap-2">
        <SmartSearch />
        <DateRangePicker />
        {actions}
        {!hideSave && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-sm shrink-0 h-9"
            disabled={!selected}
            onClick={() => setSaveOpen(true)}
          >
            <BookmarkPlus className="size-4" />
            Save as report
          </Button>
        )}
      </div>

      <SaveReportDialog open={saveOpen} onClose={() => setSaveOpen(false)} />

      {/* Row 2 — type tabs + status + sort + metrics + count */}
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

        {/* Status tabs */}
        <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilters({ status: s.value, page: 1 })}
              className={cn(
                "px-3 h-7 rounded-md text-sm font-medium transition-colors",
                filters.status === s.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

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

        {/* Metric threshold filters */}
        <MetricFilters />

        {/* Metrics */}
        <MetricsSelector />

        {/* Count + freshness */}
        <div className="ml-auto flex items-center gap-2">
          {pagination && (
            <span className="text-xs font-medium text-foreground whitespace-nowrap bg-muted px-2 py-0.5 rounded-md">
              {pagination.total_items} creatives
            </span>
          )}
          <div className="w-px h-3.5 bg-border" />
          <MetricsFreshness />
        </div>
      </div>
    </div>
  );
}
