"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, X, ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAdsFilters } from "./use-ads-filters";
import { METRIC_DEFS } from "./ads-metrics-store";
import type { MetricFilter } from "./use-ads-filters";

const FILTERABLE_METRICS = METRIC_DEFS.filter((d) => d.key !== "launched_at");

const OPERATORS = [
  { value: "gte", label: "≥", description: "at least" },
  { value: "lte", label: "≤", description: "at most" },
  { value: "gt", label: ">", description: "more than" },
  { value: "lt", label: "<", description: "less than" },
];

function emptyFilter(): MetricFilter {
  return { metric: "spend", operator: "gte", value: 0 };
}

export function MetricFilters() {
  const { filters, setFilters } = useAdsFilters();
  const applied = filters.metric_filters ?? [];
  const count = applied.length;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MetricFilter[]>(applied);
  const selectOpenCount = useRef(0);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open]);

  function update(index: number, patch: Partial<MetricFilter>) {
    setDraft((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  }

  function add() {
    setDraft((prev) => [...prev, emptyFilter()]);
  }

  function remove(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  }

  function apply() {
    setFilters({ metric_filters: draft, page: 1 });
    setOpen(false);
  }

  function clear() {
    setDraft([]);
    setFilters({ metric_filters: [], page: 1 });
    setOpen(false);
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(applied);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-sm h-8">
          <ListFilter className="size-3.5" />
          Min. thresholds
          {count > 0 ? (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full size-4 flex items-center justify-center leading-none">
              {count}
            </span>
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-130 p-5 flex flex-col gap-4"
        onInteractOutside={(e) => {
          if (selectOpenCount.current > 0) e.preventDefault();
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Minimum thresholds
        </p>

        {draft.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No thresholds set. Only creatives with spend &gt; 0 are shown by
            default.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {draft.map((f, i) => {
            const def = FILTERABLE_METRICS.find((d) => d.key === f.metric);
            return (
              <div key={i} className="flex items-center gap-2">
                <Select
                  value={f.metric}
                  onValueChange={(v) => update(i, { metric: v })}
                  onOpenChange={(o) => {
                    if (o) selectOpenCount.current += 1;
                    else
                      setTimeout(() => {
                        selectOpenCount.current -= 1;
                      }, 100);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTERABLE_METRICS.map((d) => (
                      <SelectItem key={d.key} value={d.key} className="text-xs">
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={f.operator}
                  onValueChange={(v) => update(i, { operator: v })}
                  onOpenChange={(o) => {
                    if (o) selectOpenCount.current += 1;
                    else
                      setTimeout(() => {
                        selectOpenCount.current -= 1;
                      }, 100);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem
                        key={op.value}
                        value={op.value}
                        className="text-xs"
                      >
                        <span className="font-mono w-4 inline-block">
                          {op.label}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          {op.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  {def?.unit === "%" && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      %
                    </span>
                  )}
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={f.value === 0 ? "" : f.value}
                    placeholder="0"
                    onChange={(e) =>
                      update(i, { value: parseFloat(e.target.value) || 0 })
                    }
                    className={cn("h-8 text-xs", def?.unit === "%" && "pr-7")}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => remove(i)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>

        <button
          onClick={add}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" />
          Add threshold
        </button>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between gap-2">
          {count > 0 ? (
            <button
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          ) : (
            <span />
          )}
          <Button
            size="sm"
            className="h-8 text-xs px-4"
            disabled={!hasChanges}
            onClick={apply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
