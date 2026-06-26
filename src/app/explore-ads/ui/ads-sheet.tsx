"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  TrendingUp,
  LayoutGrid,
  ExternalLink,
  Pencil,
  Tag,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getMetricDefs } from "./ads-metrics-store";
import { useAdAccount } from "@/context/ad-account-context";
import { TAG_COLORS } from "./ads-card";
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
  const allDefs = getMetricDefs(currency);
  const metricDefs =
    launchedAt === undefined
      ? allDefs.filter((d) => d.key !== "launched_at")
      : allDefs;
  if (!metrics)
    return (
      <p className="text-sm text-muted-foreground">No metrics available.</p>
    );
  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-3">
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
              className="rounded-lg bg-muted/50 px-3 py-2.5 flex flex-col gap-0.5"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {def.label}
              </span>
              <span className="text-sm font-bold tracking-tight">
                {def.format(val)}
              </span>
            </div>
          );
        })}
      </div>
      {metrics.date_from && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Period:</span>
          <span className="font-medium text-foreground">
            {new Date(metrics.date_from).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" – "}
            {new Date(metrics.date_to!).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
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
    <div className="flex flex-col divide-y divide-border">
      {/* Performance */}
      <div className="px-5 py-4">
        <SectionLabel icon={TrendingUp} label="Performance" />
        <MetricsGrid
          metrics={ad.metrics}
          launchedAt={ad.launched_at}
          currency={currency}
        />
      </div>

      {/* Creative copy */}
      {(ad.headline || ad.cta || ad.primary_text) && (
        <div className="px-5 py-4">
          <SectionLabel icon={Pencil} label="Creative copy" />
          <div className="flex flex-col gap-3">
            {ad.headline && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Headline
                </p>
                <div className="rounded-md bg-muted/40 px-3 py-2.5">
                  <p className="text-sm font-medium leading-snug">
                    {ad.headline}
                  </p>
                </div>
              </div>
            )}
            {ad.cta && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  CTA
                </p>
                <div className="rounded-md bg-muted/40 px-3 py-2.5 flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    {ad.cta.replace(/_/g, " ")}
                  </p>
                  {ad.cta_url && (
                    <a
                      href={ad.cta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 truncate transition-colors"
                    >
                      {ad.cta_url}
                    </a>
                  )}
                </div>
              </div>
            )}
            {ad.primary_text && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Primary text
                </p>
                <div className="max-h-40 overflow-y-auto rounded-md bg-muted/40 px-3 py-2.5">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                    {ad.primary_text}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
              <span className="text-sm font-medium text-right wrap-break-words min-w-0">
                {val || "—"}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 pt-0.5">
            <span className="text-xs text-muted-foreground w-20 shrink-0">
              Status
            </span>
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded",
                ad.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {ad.status}
            </span>
          </div>
        </div>
      </div>

      {/* Ads Manager */}
      <div className="px-5 py-4">
        <a
          href={`https://www.facebook.com/adsmanager/manage/ads?act=${accountId}&selected_ad_ids=${ad.ad_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
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
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
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
              {/* Bottom overlay — headline + badges */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex flex-col gap-2">
                <p className="text-white text-base font-semibold leading-snug drop-shadow-sm">
                  {rep?.headline || rep?.ad_name || ""}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip
                    className={
                      rep?.status === "ACTIVE"
                        ? "bg-emerald-500/25 text-emerald-300"
                        : "bg-white/15 text-white/60"
                    }
                  >
                    {rep?.status}
                  </Chip>
                  <Chip className="bg-white/15 text-white/70 capitalize">
                    {creative.creative_type}
                  </Chip>
                  {creative.ad_count > 1 && (
                    <Chip className="bg-white/15 text-white/70">
                      {creative.ad_count} ads
                    </Chip>
                  )}
                </div>
                <p className="text-[10px] text-white/40 font-mono">
                  Creative {creative.creative_id}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Tags ───────────────────────────────────────────────── */}
        {creative.is_tagged && Object.keys(creative.tags ?? {}).length > 0 && (
          <div className="px-5 py-4 border-b border-border">
            <SectionLabel icon={Tag} label="Tags" />
            <div className="flex flex-col gap-2 mt-3">
              {Object.entries(creative.tags).map(([key, vals], ci) => (
                <div key={key} className="flex flex-wrap gap-1">
                  {vals.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        TAG_COLORS[ci % TAG_COLORS.length]
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Aggregated metrics ─────────────────────────────────── */}
        <div className="px-5 py-4 border-b border-border">
          <SectionLabel icon={TrendingUp} label="Total performance" />
          <MetricsGrid metrics={creative.metrics} currency={currency} />
        </div>

        {/* ── Per-ad tabs ────────────────────────────────────────── */}
        {creative.ads.length > 0 && (
          <>
            <div className="flex border-b border-border overflow-x-auto shrink-0 bg-muted/30">
              {creative.ads.map((ad, i) => (
                <button
                  key={ad.ad_id}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "px-4 py-3 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors flex flex-col items-start gap-0.5",
                    activeTab === i
                      ? "border-primary text-primary bg-background"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{`Ad ${i + 1}`}</span>
                  <span className="text-[10px] truncate max-w-28 opacity-60">
                    {ad.ad_name}
                  </span>
                </button>
              ))}
            </div>

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
