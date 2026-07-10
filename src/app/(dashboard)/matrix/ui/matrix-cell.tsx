"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AggregatedMetrics } from "./use-matrix";
import { getCellColor } from "./use-matrix";
import type {
  MetricKey,
  MetricDef,
} from "@/app/(dashboard)/explore-ads/ui/ads-metrics-store";

type Props = {
  data: AggregatedMetrics | null;
  colorBy: MetricKey;
  baseline: AggregatedMetrics;
  displayMode: "value" | "pct";
  metricDef: MetricDef;
  rowTag: string;
  colTag: string;
  isLastCol?: boolean;
  isLastRow?: boolean;
  onClick: () => void;
};

export function MatrixCell({
  data,
  colorBy,
  baseline,
  displayMode,
  metricDef,
  rowTag,
  colTag,
  isLastCol,
  isLastRow,
  onClick,
}: Props) {
  const tdClass = cn("p-0.5", isLastCol && "pr-4", isLastRow && "pb-4");

  if (!data) {
    return (
      <td className={tdClass}>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-20 h-14 rounded-md border border-dashed border-border/50 bg-muted/20" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {rowTag} × {colTag}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
    );
  }

  const cellValue = (data[colorBy as keyof AggregatedMetrics] as number) ?? 0;
  const baselineValue =
    (baseline[colorBy as keyof AggregatedMetrics] as number) ?? 0;
  const colorClass = getCellColor(
    cellValue,
    baselineValue,
    metricDef.higherIsBetter
  );

  let displayValue: string;
  if (displayMode === "pct") {
    if (baselineValue === 0) {
      displayValue = "—";
    } else {
      const pct = Math.abs(((cellValue - baselineValue) / baselineValue) * 100);
      displayValue = `${pct.toFixed(0)}%`;
    }
  } else {
    if (baselineValue === 0) {
      displayValue = metricDef.format(cellValue);
    } else {
      displayValue = metricDef.format(Math.abs(cellValue - baselineValue));
    }
  }

  return (
    <td className={tdClass}>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                "w-20 h-14 rounded-md border flex flex-col items-center justify-center gap-0.5 transition-opacity hover:opacity-80 cursor-pointer",
                colorClass
              )}
            >
              <span className="text-sm font-bold leading-none truncate w-full text-center px-1">
                {displayValue}
              </span>
              <span className="text-[9px] opacity-60">n{data.n}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {rowTag} × {colTag}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </td>
  );
}
