"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarClock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdsFilters } from "./use-ads-filters";

export function LaunchedAtFilter() {
  const { filters, setFilters } = useAdsFilters();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(filters.launched_at_from);
  const [to, setTo] = useState(filters.launched_at_to);
  const ref = useRef<HTMLDivElement>(null);

  const active = !!filters.launched_at_from || !!filters.launched_at_to;
  const label = active
    ? `${filters.launched_at_from || "…"} – ${filters.launched_at_to || "…"}`
    : "Launched on";

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function apply() {
    setFilters({
      launched_at_from: from,
      launched_at_to: to,
      page: 1,
    });
    setOpen(false);
  }

  function clear() {
    setFrom("");
    setTo("");
    setFilters({ launched_at_from: "", launched_at_to: "", page: 1 });
    setOpen(false);
  }

  const canApply = (!from && !to) || (!!from && !!to && from <= to);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-sm h-9 shrink-0"
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarClock className="size-3.5 text-muted-foreground" />
        {label}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-border bg-popover shadow-md p-3 flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-0.5">
            Launched on
          </p>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-muted-foreground w-8">From</span>
            <Input
              type="date"
              value={from}
              max={to || new Date().toISOString().split("T")[0]}
              onChange={(e) => setFrom(e.target.value)}
              className="h-8 text-xs flex-1"
            />
          </div>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-muted-foreground w-8">To</span>
            <Input
              type="date"
              value={to}
              min={from || undefined}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setTo(e.target.value)}
              className="h-8 text-xs flex-1"
            />
          </div>
          <div className="flex items-center gap-2 px-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={clear}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              disabled={!canApply}
              onClick={apply}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
