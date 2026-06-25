"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, TrendingUp, LayoutGrid, Info, ExternalLink } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getMetricDefs } from "./ads-metrics-store";
import { useAdAccount } from "@/context/ad-account-context";
import type { Creative, AdEntry, AdMetrics } from "./ads-card";

type Props = { creative: Creative | null; open: boolean; onClose: () => void };

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

function MetricsGrid({
  metrics,
  launchedAt,
  currency,
}: {
  metrics: AdMetrics | null;
  launchedAt?: string;
  currency: string;
}) {
  const metricDefs = getMetricDefs(currency);
  if (!metrics)
    return (
      <p className="text-sm text-muted-foreground">No metrics available.</p>
    );
  return (
    <>
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {metricDefs.map((def) => {
          const val =
            def.key === "launched_at"
              ? launchedAt
              : (metrics[def.key as keyof AdMetrics] as
                  | number
                  | null
                  | undefined);
          return (
            <div
              key={def.key}
              className="rounded-lg bg-muted/50 px-3 py-2.5 flex flex-col gap-1"
            >
              <span className="text-[11px] text-muted-foreground">
                {def.label}
              </span>
              <span className="text-base font-bold tracking-tight">
                {def.format(val)}
              </span>
            </div>
          );
        })}
      </div>
      {metrics.date_from && (
        <p className="text-[11px] text-muted-foreground">
          {metrics.date_from} — {metrics.date_to}
        </p>
      )}
    </>
  );
}

function AdTab({
  ad,
  currency,
  accountId,
}: {
  ad: AdEntry;
  currency: string;
  accountId: string;
}) {
  return (
    <div className="flex flex-col gap-0 divide-y divide-border">
      {/* Performance */}
      <div className="px-5 py-4">
        <SectionLabel icon={TrendingUp} label="Performance" />
        <MetricsGrid
          metrics={ad.metrics}
          launchedAt={ad.launched_at}
          currency={currency}
        />
      </div>

      {/* Structure */}
      <div className="px-5 py-4">
        <SectionLabel icon={LayoutGrid} label="Structure" />
        <div className="flex flex-col gap-2.5">
          {[
            ["Campaign", ad.campaign_name],
            ["Ad set", ad.adset_name],
            ["Ad name", ad.ad_name],
          ].map(([label, val]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-xs text-muted-foreground w-20 shrink-0">
                {label}
              </span>
              <span className="text-sm font-semibold text-right break-all">
                {val || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* IDs */}
      <div className="px-5 py-4">
        <SectionLabel icon={Info} label="IDs" />
        <div className="flex flex-col gap-2">
          {[
            ["Account", accountId],
            ["Campaign", ad.campaign_id],
            ["Ad set", ad.adset_id],
            ["Ad", ad.ad_id],
          ].map(([label, val]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-xs text-muted-foreground w-20 shrink-0">
                {label}
              </span>
              <span className="text-sm font-semibold font-mono break-all">
                {val || "—"}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground w-20 shrink-0">
              Launched
            </span>
            <span className="text-sm font-semibold">
              {ad.launched_at
                ? new Date(ad.launched_at).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Ads Manager link */}
      <div className="px-5 py-3">
        <a
          href={`https://www.facebook.com/adsmanager/manage/ads?act=${accountId}&selected_ad_ids=${ad.ad_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="size-3.5" />
          Open in Ads Manager
        </a>
      </div>
    </div>
  );
}

export function AdsSheet({ creative, open, onClose }: Props) {
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { selected: account } = useAdAccount();
  const currency = account?.currency ?? "USD";
  const accountId = account?.account_id ?? "";

  if (!creative) return null;

  const isVideo = creative.creative_type === "video";
  const previewSrc = isVideo
    ? creative.thumbnail_url || creative.url
    : creative.url;
  const rep = creative.ads[0];

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setPlaying(false);
          setActiveTab(0);
          onClose();
        }
      }}
    >
      <SheetContent className="w-150! max-w-150! overflow-y-auto p-0 gap-0 flex flex-col">
        {/* ── Creative media ─────────────────────────────────────── */}
        <div className="relative aspect-video bg-slate-900 w-full shrink-0">
          {playing && isVideo && creative.url ? (
            <video
              src={creative.url}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              controls
              onEnded={() => setPlaying(false)}
            />
          ) : (
            <>
              {previewSrc && (
                <Image
                  src={previewSrc}
                  alt={rep?.headline || rep?.ad_name || ""}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              {isVideo && creative.url && (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/35 transition-colors">
                    <Play className="size-5 text-white fill-white ml-0.5" />
                  </div>
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex flex-col gap-1">
                <p className="text-white text-base font-semibold leading-snug">
                  {rep?.headline || rep?.ad_name || ""}
                </p>
                <div className="flex items-center gap-2">
                  <Chip
                    className={
                      creative.status === "ACTIVE"
                        ? "bg-emerald-500/25 text-emerald-300"
                        : "bg-white/15 text-white/60"
                    }
                  >
                    {creative.status}
                  </Chip>
                  <Chip className="bg-white/15 text-white/70 capitalize">
                    {creative.creative_type}
                  </Chip>
                  {creative.cta && (
                    <Chip className="bg-white/15 text-white/70">
                      {creative.cta.replace(/_/g, " ")}
                    </Chip>
                  )}
                  {creative.ad_count > 1 && (
                    <Chip className="bg-white/15 text-white/70">
                      {creative.ad_count} ads
                    </Chip>
                  )}
                  <Chip className="bg-white/15 text-white/50 font-mono">
                    Creative ID: {creative.creative_id}
                  </Chip>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Aggregated metrics ─────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-border">
          <SectionLabel icon={TrendingUp} label="Total performance" />
          <MetricsGrid metrics={creative.metrics} currency={currency} />
        </div>

        {/* ── Per-ad tabs ────────────────────────────────────────── */}
        {creative.ads.length > 0 && (
          <>
            {/* Tab bar */}
            <div className="flex border-b border-border overflow-x-auto shrink-0">
              {creative.ads.map((ad, i) => (
                <button
                  key={ad.ad_id}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors",
                    activeTab === i
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {creative.ads.length === 1 ? "Ad detail" : `Ad ${i + 1}`}
                </button>
              ))}
            </div>

            {/* Active tab content */}
            <AdTab
              ad={creative.ads[activeTab]}
              currency={currency}
              accountId={accountId}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
