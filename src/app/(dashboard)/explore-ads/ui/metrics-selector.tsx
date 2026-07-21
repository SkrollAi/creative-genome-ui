"use client";

import { BarChart2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMetricDefs, useAdsMetrics } from "./ads-metrics-store";
import { useAdAccount } from "@/context/ad-account-context";

export function MetricsSelector() {
  const { selected, toggle } = useAdsMetrics();
  const { selected: account } = useAdAccount();
  const metricDefs = getMetricDefs(account?.currency ?? "INR");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm">
          <BarChart2 className="size-3.5" />
          Metrics
          <span className="size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
            {selected.length}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56 p-2">
        <DropdownMenuLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase px-1 pb-2">
          Show per ad — pick any
        </DropdownMenuLabel>

        <div className="flex flex-col gap-0.5">
          {metricDefs.map((def) => {
            const active = selected.includes(def.key);
            return (
              <button
                key={def.key}
                onClick={() => toggle(def.key)}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors hover:bg-muted w-full text-left",
                  active && "bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    active ? "bg-primary border-primary" : "border-border"
                  )}
                >
                  {active && (
                    <svg
                      viewBox="0 0 10 8"
                      className="size-2.5 text-primary-foreground"
                      fill="none"
                    >
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="flex-1 font-medium">{def.label}</span>
                <span className="text-xs text-muted-foreground">
                  {def.unit}
                </span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
