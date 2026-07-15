"use client";

import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { useMemo } from "react";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";
import type { Report } from "@/app/(dashboard)/reports/ui/use-reports";
import type { MetricKey } from "@/app/(dashboard)/explore-ads/ui/ads-metrics-store";
import { toBackendMetricField } from "@/app/(dashboard)/explore-ads/ui/ads-metrics-store";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MatrixCreative = {
  creative_id: string;
  creative_type: "video" | "image";
  url: string | null;
  thumbnail_url: string | null;
  ad_count: number;
  tags: Record<string, string[]>;
  spend: number;
  impressions: number;
  reach: number;
  link_clicks: number;
  inline_link_clicks: number;
  purchases: number;
  purchase_value: number;
  views_3s: number;
  video_plays: number;
  p100_views: number;
  atc: number;
};

export type AggregatedMetrics = {
  spend: number;
  impressions: number;
  reach: number;
  link_clicks: number;
  purchases: number;
  roas: number;
  cpm: number;
  cpc: number;
  cpa: number;
  ctr: number;
  hook_rate: number;
  hold_rate: number;
  atc_rate: number;
  frequency: number;
  n: number;
};

export type CellData = {
  metrics: AggregatedMetrics;
  creatives: MatrixCreative[];
};

// ── Store ─────────────────────────────────────────────────────────────────────

type MatrixStore = {
  selected_report: Report | null;
  row_category: string;
  col_category: string;
  color_by: MetricKey;
  display_mode: "value" | "pct";
  selected_cell: { row_tag: string; col_tag: string } | null;
  setReport: (r: Report | null) => void;
  setRowCategory: (k: string) => void;
  setColCategory: (k: string) => void;
  setColorBy: (k: MetricKey) => void;
  setDisplayMode: (m: "value" | "pct") => void;
  setSelectedCell: (c: { row_tag: string; col_tag: string } | null) => void;
  reset: () => void;
};

const defaultState = {
  selected_report: null,
  row_category: "",
  col_category: "",
  color_by: "roas" as MetricKey,
  display_mode: "value" as const,
  selected_cell: null,
};

export const useMatrixStore = create<MatrixStore>((set) => ({
  ...defaultState,
  setReport: (r) => set({ selected_report: r, selected_cell: null }),
  setRowCategory: (k) => set({ row_category: k, selected_cell: null }),
  setColCategory: (k) => set({ col_category: k, selected_cell: null }),
  setColorBy: (k) => set({ color_by: k }),
  setDisplayMode: (m) => set({ display_mode: m }),
  setSelectedCell: (c) => set({ selected_cell: c }),
  reset: () => set(defaultState),
}));

// ── API ───────────────────────────────────────────────────────────────────────

export function useMatrixData() {
  const { selected } = useAdAccount();
  const { selected_report } = useMatrixStore();

  return useQuery({
    queryKey: ["matrix", selected?.account_id, selected_report?.id],
    queryFn: async () => {
      const r = selected_report!;
      const res = await api.post("/creative_genome/matrix", {
        report_id: r.id,
        date_from: r.filters.date_from,
        date_to: r.filters.date_to,
        ...(r.filters.status &&
          r.filters.status !== "all" && { status: r.filters.status }),
        ...(r.filters.creative_type &&
          r.filters.creative_type !== "all" && {
            creative_type: r.filters.creative_type,
          }),
        ...(r.filters.search && { search: r.filters.search }),
        ...(r.filters.campaign_name && {
          campaign_name: r.filters.campaign_name,
        }),
        ...(r.filters.adset_name && { adset_name: r.filters.adset_name }),
        ...(r.filters.ad_name && { ad_name: r.filters.ad_name }),
        ...(r.filters.launched_at_from && {
          launched_at_from: r.filters.launched_at_from,
        }),
        ...(r.filters.launched_at_to && {
          launched_at_to: r.filters.launched_at_to,
        }),
        ...(r.filters.metric_filters?.length && {
          metric_filters: r.filters.metric_filters.map((f) => ({
            ...f,
            metric: toBackendMetricField(f.metric),
          })),
        }),
      });
      return res.data.creatives as MatrixCreative[];
    },
    enabled: !!selected?.account_id && !!selected_report,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Aggregation utils ─────────────────────────────────────────────────────────

export function aggregateMetrics(
  creatives: MatrixCreative[]
): AggregatedMetrics {
  if (!creatives.length) {
    return {
      spend: 0,
      impressions: 0,
      reach: 0,
      link_clicks: 0,
      purchases: 0,
      roas: 0,
      cpm: 0,
      cpc: 0,
      cpa: 0,
      ctr: 0,
      hook_rate: 0,
      hold_rate: 0,
      atc_rate: 0,
      frequency: 0,
      n: 0,
    };
  }

  // sum raw fields for weighted ratio computation + volume avg
  const s = {
    spend: 0,
    impressions: 0,
    reach: 0,
    link_clicks: 0,
    inline_link_clicks: 0,
    purchases: 0,
    purchase_value: 0,
    views_3s: 0,
    video_plays: 0,
    p100_views: 0,
    atc: 0,
  };
  for (const c of creatives) {
    s.spend += c.spend ?? 0;
    s.impressions += c.impressions ?? 0;
    s.reach += c.reach ?? 0;
    s.link_clicks += c.link_clicks ?? 0;
    s.inline_link_clicks += c.inline_link_clicks ?? 0;
    s.purchases += c.purchases ?? 0;
    s.purchase_value += c.purchase_value ?? 0;
    s.views_3s += c.views_3s ?? 0;
    s.video_plays += c.video_plays ?? 0;
    s.p100_views += c.p100_views ?? 0;
    s.atc += c.atc ?? 0;
  }

  const n = creatives.length;
  return {
    // volume metrics: avg per creative
    spend: s.spend / n,
    impressions: s.impressions / n,
    reach: s.reach / n,
    link_clicks: s.link_clicks / n,
    purchases: s.purchases / n,
    // ratio metrics: weighted avg from summed raw fields
    roas: s.spend > 0 ? s.purchase_value / s.spend : 0,
    cpm: s.impressions > 0 ? (s.spend / s.impressions) * 1000 : 0,
    cpc: s.inline_link_clicks > 0 ? s.spend / s.inline_link_clicks : 0,
    cpa: s.purchases > 0 ? s.spend / s.purchases : 0,
    ctr: s.impressions > 0 ? (s.inline_link_clicks / s.impressions) * 100 : 0,
    hook_rate: s.video_plays > 0 ? (s.views_3s / s.video_plays) * 100 : 0,
    hold_rate: s.views_3s > 0 ? (s.p100_views / s.views_3s) * 100 : 0,
    atc_rate: s.link_clicks > 0 ? (s.atc / s.link_clicks) * 100 : 0,
    frequency: s.reach > 0 ? s.impressions / s.reach : 0,
    n,
  };
}

export function buildCellMap(
  creatives: MatrixCreative[],
  rowCat: string,
  colCat: string
): Map<string, CellData> {
  const map = new Map<string, { creatives: MatrixCreative[] }>();

  for (const c of creatives) {
    const rowTags = c.tags?.[rowCat] ?? [];
    const colTags = c.tags?.[colCat] ?? [];
    for (const rt of rowTags) {
      for (const ct of colTags) {
        const key = `${rt}|||${ct}`;
        if (!map.has(key)) map.set(key, { creatives: [] });
        map.get(key)!.creatives.push(c);
      }
    }
  }

  const result = new Map<string, CellData>();
  for (const [key, { creatives: cs }] of map) {
    result.set(key, { creatives: cs, metrics: aggregateMetrics(cs) });
  }
  return result;
}

export function getCellColor(
  cellValue: number,
  baselineValue: number,
  higherIsBetter = true
): string {
  if (baselineValue === 0) return "bg-muted/30 text-muted-foreground";
  const ratio = higherIsBetter
    ? cellValue / baselineValue
    : baselineValue / cellValue;
  if (ratio >= 1.2) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (ratio >= 1.1) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (ratio >= 0.9) return "bg-muted/50 text-foreground border-border";
  if (ratio >= 0.8) return "bg-red-50 text-red-700 border-red-100";
  return "bg-red-100 text-red-800 border-red-200";
}

// ── Derived data hook ─────────────────────────────────────────────────────────

export function useMatrixDerived(
  creatives: MatrixCreative[],
  library?: { key: string; defaults: string[]; customTags: string[] }[]
) {
  const { row_category, col_category } = useMatrixStore();

  return useMemo(() => {
    if (!row_category || !col_category) {
      return { rowTags: [], colTags: [], cellMap: new Map(), baseline: null };
    }

    // prefer library tags so all account tags show as headers, even if empty in this report
    const libRow = library?.find((c) => c.key === row_category);
    const libCol = library?.find((c) => c.key === col_category);

    const rowTags = libRow
      ? [...libRow?.customTags, ...libRow.defaults]
      : [...new Set(creatives.flatMap((c) => c.tags?.[row_category] ?? []))];

    const colTags = libCol
      ? [...libCol?.customTags, ...libCol.defaults]
      : [...new Set(creatives.flatMap((c) => c.tags?.[col_category] ?? []))];

    const cellMap = buildCellMap(creatives, row_category, col_category);
    const baseline = creatives.length ? aggregateMetrics(creatives) : null;

    return { rowTags, colTags, cellMap, baseline };
  }, [creatives, row_category, col_category, library]);
}
