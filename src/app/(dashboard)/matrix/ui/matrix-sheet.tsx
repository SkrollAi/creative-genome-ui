"use client";

import Image from "next/image";
import { X, VideoIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useMatrixStore,
  useMatrixDerived,
  buildCellMap,
  aggregateMetrics,
  getCellColor,
} from "./use-matrix";
import { getMetricDefs } from "@/app/(dashboard)/explore-ads/ui/ads-metrics-store";
import { useAdAccount } from "@/context/ad-account-context";
import type { MatrixCreative } from "./use-matrix";

// Metrics to show in the sheet grid (exclude launched_at)
const SHEET_METRICS = [
  "spend",
  "roas",
  "cpa",
  "ctr",
  "cpm",
  "cpc",
  "hook_rate",
  "hold_rate",
  "atc_rate",
  "impressions",
  "reach",
  "frequency",
  "link_clicks",
  "purchases",
] as const;

type Props = {
  creatives: MatrixCreative[];
};

export function MatrixSheet({ creatives }: Props) {
  const { selected: account } = useAdAccount();
  const {
    selected_cell,
    setSelectedCell,
    color_by,
    display_mode,
    row_category,
    col_category,
  } = useMatrixStore();
  const { baseline } = useMatrixDerived(creatives, undefined);
  const metricDefs = getMetricDefs(account?.currency ?? "USD");

  if (!selected_cell || !baseline) return null;

  const { row_tag, col_tag } = selected_cell;
  const cellMap = buildCellMap(creatives, row_category, col_category);
  const cell = cellMap.get(`${row_tag}|||${col_tag}`);
  if (!cell) return null;

  const { metrics, creatives: cellCreatives } = cell;
  const colorByDef = metricDefs.find((d) => d.key === color_by)!;
  const cellColorByValue =
    (metrics[color_by as keyof typeof metrics] as number) ?? 0;
  const baselineColorByValue =
    (baseline[color_by as keyof typeof baseline] as number) ?? 0;
  const headerColor = getCellColor(
    cellColorByValue,
    baselineColorByValue,
    colorByDef.higherIsBetter
  );

  function fmtCell(val: number, bval: number, def: typeof colorByDef) {
    if (bval === 0) return def.format(val);
    if (display_mode === "pct") {
      const pct = Math.abs(((val - bval) / bval) * 100);
      return `${pct.toFixed(0)}%`;
    }
    return def.format(Math.abs(val - bval));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setSelectedCell(null)}
      />

      {/* Sheet */}
      <div className="relative w-120 h-full bg-background border-l border-border flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Combination detail
              </p>
              <h2 className="text-xl font-bold">
                {row_tag} × {col_tag}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => setSelectedCell(null)}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Color-by metric hero */}
          <div className="flex items-center gap-3 mt-4">
            <div
              className={cn(
                "px-3 py-1.5 rounded-lg border flex flex-col items-start",
                headerColor
              )}
            >
              <span className="text-3xl font-bold leading-none">
                {fmtCell(cellColorByValue, baselineColorByValue, colorByDef)}
              </span>
              {baselineColorByValue > 0 &&
                (() => {
                  const pct = Math.abs(
                    ((cellColorByValue - baselineColorByValue) /
                      baselineColorByValue) *
                      100
                  );
                  const diff = Math.abs(
                    cellColorByValue - baselineColorByValue
                  );
                  return (
                    <span className="text-xs mt-0.5 opacity-70">
                      {colorByDef.format(diff)} · {pct.toFixed(0)}% vs baseline
                    </span>
                  );
                })()}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            {useMatrixStore.getState().selected_report?.filters.date_from} –{" "}
            {useMatrixStore.getState().selected_report?.filters.date_to}
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Metrics grid */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Metrics
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SHEET_METRICS.map((key) => {
                const def = metricDefs.find((d) => d.key === key);
                if (!def) return null;
                const val =
                  (metrics[key as keyof typeof metrics] as number) ?? 0;
                const bval =
                  (baseline[key as keyof typeof baseline] as number) ?? 0;
                const color = getCellColor(val, bval, def.higherIsBetter);
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 flex flex-col gap-0.5",
                      color
                    )}
                  >
                    <span className="text-[10px] opacity-70">{def.label}</span>
                    <span className="text-sm font-bold">
                      {fmtCell(val, bval, def)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Creatives thumbnails */}
          <div className="px-6 pb-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Creatives ({cellCreatives.length})
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {cellCreatives.map((c) => {
                const isVideo = c.creative_type === "video";
                const src = isVideo ? c.thumbnail_url || c.url : c.url;
                return (
                  <div
                    key={c.creative_id}
                    className="relative w-24 aspect-3/4 rounded-lg overflow-hidden bg-muted shrink-0"
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        {isVideo ? (
                          <VideoIcon className="size-5 text-muted-foreground" />
                        ) : (
                          <ImageIcon className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    {c.ad_count > 1 && (
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                        +{c.ad_count - 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
