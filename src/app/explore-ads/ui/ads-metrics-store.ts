import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MetricKey =
  | "spend"
  | "roas"
  | "cpa"
  | "ctr"
  | "cpm"
  | "cpc"
  | "hook_rate"
  | "hold_rate"
  | "atc_rate"
  | "impressions"
  | "reach"
  | "purchases"
  | "link_clicks"
  | "frequency";

export type MetricDef = {
  key: MetricKey;
  label: string;
  unit: "$" | "%" | "×" | "#";
  format: (v: number | null | undefined) => string;
};

const fmt$ = (v: number | null | undefined) =>
  v == null ? "—" : `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}`;
const fmtPct = (v: number | null | undefined) =>
  v == null ? "—" : `${v.toFixed(2)}%`;
const fmtPct1 = (v: number | null | undefined) =>
  v == null ? "—" : `${v.toFixed(1)}%`;
const fmtNum = (v: number | null | undefined) =>
  v == null ? "—" : v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;

export const METRIC_DEFS: MetricDef[] = [
  { key: "spend",       label: "Spend",          unit: "$", format: fmt$ },
  { key: "roas",        label: "ROAS",           unit: "×", format: (v) => v == null ? "—" : `${v.toFixed(2)}×` },
  { key: "cpa",         label: "CPA",            unit: "$", format: fmt$ },
  { key: "ctr",         label: "CTR",            unit: "%", format: fmtPct },
  { key: "cpm",         label: "CPM",            unit: "$", format: (v) => v == null ? "—" : `$${v.toFixed(2)}` },
  { key: "cpc",         label: "CPC",            unit: "$", format: (v) => v == null ? "—" : `$${v.toFixed(2)}` },
  { key: "hook_rate",   label: "Hook rate",      unit: "%", format: fmtPct1 },
  { key: "hold_rate",   label: "Hold rate",      unit: "%", format: fmtPct1 },
  { key: "atc_rate",    label: "ATC rate",       unit: "%", format: fmtPct1 },
  { key: "purchases",   label: "Purchases",      unit: "#", format: fmtNum },
  { key: "impressions", label: "Impressions",    unit: "#", format: fmtNum },
  { key: "reach",       label: "Reach",          unit: "#", format: fmtNum },
  { key: "link_clicks", label: "Link clicks",    unit: "#", format: fmtNum },
  { key: "frequency",   label: "Frequency",      unit: "#", format: (v) => v == null ? "—" : v.toFixed(2) },
];

const DEFAULT_SELECTED: MetricKey[] = ["spend", "roas", "cpa", "ctr", "cpm", "cpc"];

type MetricsStore = {
  selected: MetricKey[];
  toggle: (key: MetricKey) => void;
};

export const useAdsMetrics = create<MetricsStore>()((set, get) => ({
  selected: DEFAULT_SELECTED,
  toggle: (key) => {
    const current = get().selected;
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    set({ selected: next });
  },
}));
