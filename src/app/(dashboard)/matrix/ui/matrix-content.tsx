"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, Check, Loader2, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAdAccount } from "@/context/ad-account-context";
import { useReports } from "@/app/(dashboard)/reports/ui/use-reports";
import type { Report } from "@/app/(dashboard)/reports/ui/use-reports";
import {
  getMetricDefs,
  METRIC_DEFS,
} from "@/app/(dashboard)/explore-ads/ui/ads-metrics-store";
import { useMatrixStore, useMatrixData, useMatrixDerived } from "./use-matrix";
import { MatrixGrid } from "./matrix-grid";
import { MatrixSheet } from "./matrix-sheet";
import { useTagLibrary } from "@/app/(dashboard)/tagging/ui/use-tagging";

const COLOR_BY_OPTIONS = METRIC_DEFS.filter((d) => d.key !== "launched_at");

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function MatrixContent() {
  const { selected: account } = useAdAccount();
  const metricDefs = getMetricDefs(account?.currency ?? "USD");

  const {
    selected_report,
    row_category,
    col_category,
    color_by,
    display_mode,
    setReport,
    setRowCategory,
    setColCategory,
    setColorBy,
    setDisplayMode,
    reset,
  } = useMatrixStore();

  const { data: reports } = useReports();
  const { data: library } = useTagLibrary();
  const { data: creatives = [], isLoading } = useMatrixData();
  const { rowTags, colTags, baseline } = useMatrixDerived(
    creatives,
    library ?? undefined
  );

  const [reportOpen, setReportOpen] = useState(false);

  // auto-set row/col category to first two on library load
  useEffect(() => {
    if (library && library.length >= 2 && !row_category && !col_category) {
      setRowCategory(library[0].key);
      setColCategory(library[1].key);
    }
  }, [library]);

  // reset on unmount
  useEffect(() => () => reset(), []);

  const categories = library ?? [];
  const colorByDef =
    metricDefs.find((d) => d.key === color_by) ?? metricDefs[0];

  if (!account) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Select an ad account to get started.
      </div>
    );
  }

  return (
    <>
      {creatives.length > 0 && <MatrixSheet creatives={creatives} />}

      <div className="flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-border shrink-0 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mr-1">
            Build Matrix
          </span>

          {/* Report picker */}
          <Popover open={reportOpen} onOpenChange={setReportOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                role="combobox"
                className="h-8 gap-1.5 text-xs max-w-48"
              >
                <span className="truncate">
                  {selected_report?.name ?? "Select report…"}
                </span>
                <ChevronsUpDown className="size-3 text-muted-foreground shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search reports…"
                  className="h-8 text-xs"
                />
                <CommandList>
                  <CommandEmpty className="py-4 text-xs text-center text-muted-foreground">
                    No reports found.
                  </CommandEmpty>
                  <CommandGroup>
                    {reports?.map((r: Report) => (
                      <CommandItem
                        key={r.id}
                        value={r.name}
                        onSelect={() => {
                          setReport(r);
                          setReportOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "size-3.5 mr-2 shrink-0",
                            selected_report?.id === r.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm truncate">{r.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {fmtDate(r.filters.date_from)} –{" "}
                            {fmtDate(r.filters.date_to)}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <span className="text-xs text-muted-foreground">Rows</span>

          {/* Row category */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <span className="size-2 rounded-full bg-primary shrink-0" />
                {categories.find((c) => c.key === row_category)?.label ??
                  "Pick category"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuRadioGroup
                value={row_category}
                onValueChange={setRowCategory}
              >
                {categories
                  .filter((c) => c.key !== col_category)
                  .map((c) => (
                    <DropdownMenuRadioItem key={c.key} value={c.key}>
                      {c.label}
                    </DropdownMenuRadioItem>
                  ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-muted-foreground text-xs">×</span>
          <span className="text-xs text-muted-foreground">Columns</span>

          {/* Col category */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                {categories.find((c) => c.key === col_category)?.label ??
                  "Pick category"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuRadioGroup
                value={col_category}
                onValueChange={setColCategory}
              >
                {categories
                  .filter((c) => c.key !== row_category)
                  .map((c) => (
                    <DropdownMenuRadioItem key={c.key} value={c.key}>
                      {c.label}
                    </DropdownMenuRadioItem>
                  ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-xs text-muted-foreground ml-2">Color by</span>

          {/* Color by */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {colorByDef.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuRadioGroup
                value={color_by}
                onValueChange={(v) => setColorBy(v as typeof color_by)}
              >
                {COLOR_BY_OPTIONS.map((d) => (
                  <DropdownMenuRadioItem key={d.key} value={d.key}>
                    {d.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Display mode toggle */}
          <div className="flex items-center rounded-md border border-border overflow-hidden bg-muted/40 ml-auto">
            {(["value", "pct"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDisplayMode(m)}
                className={cn(
                  "text-xs px-3 py-1.5 transition-colors border-r border-border last:border-r-0 flex items-center gap-1",
                  display_mode === m
                    ? "bg-background text-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {m === "value" ? (
                  <>
                    <Triangle className="size-3" />
                    <span>Value</span>
                  </>
                ) : (
                  <>
                    <Triangle className="size-3" />
                    <span>Percentage</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          {!selected_report ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Select a report to build the matrix.
            </div>
          ) : isLoading ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ) : creatives.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              No tagged creatives found in this report.
            </div>
          ) : (
            <MatrixGrid creatives={creatives} library={library ?? undefined} />
          )}
        </div>

        {/* Legend */}
        {creatives.length > 0 && baseline && (
          <div className="px-6 py-2.5 border-t border-border shrink-0 flex items-center gap-4 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Color key
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700">
              <span className="size-3 rounded-sm bg-emerald-100 border border-emerald-200 inline-block" />{" "}
              better than baseline
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-3 rounded-sm bg-muted/50 border border-border inline-block" />{" "}
              ~baseline
            </span>
            <span className="flex items-center gap-1.5 text-xs text-red-700">
              <span className="size-3 rounded-sm bg-red-100 border border-red-200 inline-block" />{" "}
              worse than baseline
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-3 rounded-sm border border-dashed border-border inline-block" />{" "}
              no ads tagged
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              Baseline {colorByDef.label}:{" "}
              <span className="font-medium text-foreground">
                {colorByDef.format(
                  baseline[color_by as keyof typeof baseline] as number
                )}
              </span>
              {" · "}n = creatives in both tags
            </span>
          </div>
        )}
      </div>
    </>
  );
}
