import { create } from "zustand";
import { formatDistanceToNow } from "date-fns";
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
  higherIsBetter: boolean;
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
  return x == null
    ? "—"
    : x >= 1000
    ? `${(x / 1000).toFixed(1)}k`
    : `${Math.round(x)}`;
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
  {
    key: "spend",
    label: "Spend",
    unit: "$",
    higherIsBetter: true,
    format: fmt$,
  },
  {
    key: "roas",
    label: "ROAS",
    unit: "×",
    higherIsBetter: true,
    format: (v) => {
      const x = n(v);
      return x == null ? "—" : `${x.toFixed(2)}×`;
    },
  },
  { key: "cpa", label: "CPA", unit: "$", higherIsBetter: false, format: fmt$ },
  { key: "ctr", label: "CTR", unit: "%", higherIsBetter: true, format: fmtPct },
  { key: "cpm", label: "CPM", unit: "$", higherIsBetter: false, format: fmt$2 },
  { key: "cpc", label: "CPC", unit: "$", higherIsBetter: false, format: fmt$2 },
  {
    key: "hook_rate",
    label: "Hook rate",
    unit: "%",
    higherIsBetter: true,
    format: fmtPct1,
  },
  {
    key: "hold_rate",
    label: "Hold rate",
    unit: "%",
    higherIsBetter: true,
    format: fmtPct1,
  },
  {
    key: "atc_rate",
    label: "ATC rate",
    unit: "%",
    higherIsBetter: true,
    format: fmtPct1,
  },
  {
    key: "purchases",
    label: "Purchases",
    unit: "#",
    higherIsBetter: true,
    format: fmtNum,
  },
  {
    key: "impressions",
    label: "Impressions",
    unit: "#",
    higherIsBetter: true,
    format: fmtNum,
  },
  {
    key: "reach",
    label: "Reach",
    unit: "#",
    higherIsBetter: true,
    format: fmtNum,
  },
  {
    key: "link_clicks",
    label: "Link clicks",
    unit: "#",
    higherIsBetter: true,
    format: fmtNum,
  },
  {
    key: "frequency",
    label: "Frequency",
    unit: "#",
    higherIsBetter: false,
    format: (v) => {
      const x = n(v);
      return x == null ? "—" : x.toFixed(2);
    },
  },
  {
    key: "launched_at",
    label: "Launched",
    unit: "date",
    higherIsBetter: false,
    format: (v) => {
      if (v == null || v === "") return "—";
      return formatDistanceToNow(new Date(v as string), { addSuffix: true });
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
