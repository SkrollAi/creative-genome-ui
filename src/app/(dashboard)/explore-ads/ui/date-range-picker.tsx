"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DATE_PRESETS, daysToAbsolute, useAdsFilters } from "./use-ads-filters";

function deriveLabelFromDates(date_from: string, date_to: string): string {
  const preset = DATE_PRESETS.find(({ days }) => {
    const { date_from: f, date_to: t } = daysToAbsolute(days);
    return f === date_from && t === date_to;
  });
  return preset ? preset.label : `${date_from} – ${date_to}`;
}

export function DateRangePicker() {
  const { filters, setFilters } = useAdsFilters();
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const label = deriveLabelFromDates(filters.date_from, filters.date_to);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function applyPreset(days: number) {
    const { date_from, date_to } = daysToAbsolute(days);
    setFilters({ date_from, date_to, page: 1 });
    setOpen(false);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    setFilters({ date_from: customFrom, date_to: customTo, page: 1 });
    setCustomFrom("");
    setCustomTo("");
    setOpen(false);
  }

  const canApply = !!customFrom && !!customTo && customFrom <= customTo;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-sm h-9 shrink-0"
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarDays className="size-3.5 text-muted-foreground" />
        {label}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-border bg-popover shadow-md p-3 flex flex-col gap-1">
          {/* Presets */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-1 pb-0.5">
            Presets
          </p>
          {DATE_PRESETS.map(({ label: pl, days }) => {
            const { date_from, date_to } = daysToAbsolute(days);
            const active =
              filters.date_from === date_from && filters.date_to === date_to;
            return (
              <button
                key={days}
                onClick={() => applyPreset(days)}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                {pl}
                {active && <span className="text-primary">✓</span>}
              </button>
            );
          })}

          <div className="my-1 h-px bg-border" />

          {/* Custom range */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-0.5">
            Custom range
          </p>
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-8">From</span>
              <Input
                type="date"
                value={customFrom}
                max={customTo || new Date().toISOString().split("T")[0]}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-8 text-xs flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-8">To</span>
              <Input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-8 text-xs flex-1"
              />
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              disabled={!canApply}
              onClick={applyCustom}
            >
              Apply range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
