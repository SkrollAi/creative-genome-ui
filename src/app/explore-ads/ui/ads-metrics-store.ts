import { create } from "zustand";
import { currencySymbol } from "@/lib/currency";

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
  | "frequency"
  | "launched_at";

export type MetricDef = {
  key: MetricKey;
  label: string;
  unit: "$" | "%" | "×" | "#" | "date";
  format: (v: number | string | null | undefined, sym?: string) => string;
};

type V = number | string | null | undefined;
const n = (v: V) => (v == null ? null : Number(v));
const fmtPct = (v: V) => {
  const x = n(v);
  return x == null ? "—" : `${x.toFixed(2)}%`;
};
const fmtPct1 = (v: V) => {
  const x = n(v);
  return x == null ? "—" : `${x.toFixed(1)}%`;
};
const fmtNum = (v: V) => {
  const x = n(v);
  return x == null ? "—" : x >= 1000 ? `${(x / 1000).toFixed(1)}k` : `${x}`;
};
const fmt$ = (v: V, sym = "$") => {
  const x = n(v);
  return x == null
    ? "—"
    : `${sym}${x >= 1000 ? `${(x / 1000).toFixed(1)}k` : x.toFixed(0)}`;
};
const fmt$2 = (v: V, sym = "$") => {
  const x = n(v);
  return x == null ? "—" : `${sym}${x.toFixed(2)}`;
};

export const METRIC_DEFS: MetricDef[] = [
  { key: "spend", label: "Spend", unit: "$", format: fmt$ },
  {
    key: "roas",
    label: "ROAS",
    unit: "×",
    format: (v) => {
      const x = n(v);
      return x == null ? "—" : `${x.toFixed(2)}×`;
    },
  },
  { key: "cpa", label: "CPA", unit: "$", format: fmt$ },
  { key: "ctr", label: "CTR", unit: "%", format: fmtPct },
  { key: "cpm", label: "CPM", unit: "$", format: fmt$2 },
  { key: "cpc", label: "CPC", unit: "$", format: fmt$2 },
  { key: "hook_rate", label: "Hook rate", unit: "%", format: fmtPct1 },
  { key: "hold_rate", label: "Hold rate", unit: "%", format: fmtPct1 },
  { key: "atc_rate", label: "ATC rate", unit: "%", format: fmtPct1 },
  { key: "purchases", label: "Purchases", unit: "#", format: fmtNum },
  { key: "impressions", label: "Impressions", unit: "#", format: fmtNum },
  { key: "reach", label: "Reach", unit: "#", format: fmtNum },
  { key: "link_clicks", label: "Link clicks", unit: "#", format: fmtNum },
  {
    key: "frequency",
    label: "Frequency",
    unit: "#",
    format: (v) => {
      const x = n(v);
      return x == null ? "—" : x.toFixed(2);
    },
  },
  {
    key: "launched_at",
    label: "Launched",
    unit: "date",
    format: (v) => {
      if (v == null || v === "") return "—";
      const d = new Date(v as string);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = String(d.getFullYear()).slice(2);
      return `${dd}/${mm}/${yy}`;
    },
  },
];

// Bind currency symbol at render time
export function getMetricDefs(currency: string): MetricDef[] {
  const sym = currencySymbol(currency);
  return METRIC_DEFS.map((d) =>
    d.unit === "$" ? { ...d, format: (v: V) => d.format(v, sym) } : d
  );
}

const DEFAULT_SELECTED: MetricKey[] = [
  "spend",
  "roas",
  "cpa",
  "ctr",
  "cpm",
  "cpc",
];

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
