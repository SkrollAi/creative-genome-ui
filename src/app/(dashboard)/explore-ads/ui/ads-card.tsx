"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, VideoIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMetricDefs, useAdsMetrics } from "./ads-metrics-store";
import { useAdAccount } from "@/context/ad-account-context";

export const TAG_COLORS = ["bg-muted text-muted-foreground"];

function TagChips({ tags }: { tags: Record<string, string[]> }) {
  const MAX = 2;
  const entries = Object.entries(tags);
  const flat: { tag: string; colorIdx: number }[] = entries.flatMap(
    ([, vals], ci) => vals.map((tag) => ({ tag, colorIdx: ci }))
  );
  const visible = flat.slice(0, MAX);
  const overflow = flat.length - MAX;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map(({ tag, colorIdx }) => (
        <span
          key={tag}
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            TAG_COLORS[colorIdx % TAG_COLORS.length]
          )}
        >
          {tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

export type AdMetrics = {
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  cpm: number;
  cpc: number;
  ctr: number;
  link_clicks: number;
  purchases: number;
  roas: number;
  cpa: number;
  hook_rate: number;
  hold_rate: number;
  atc_rate: number;
  date_from?: string;
  date_to?: string;
};

export type AdEntry = {
  ad_id: string;
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  status: "ACTIVE" | "PAUSED";
  launched_at: string;
  headline: string;
  primary_text: string;
  cta: string;
  cta_url: string;
  metrics: AdMetrics | null;
};

export type Creative = {
  creative_id: string;
  creative_type: "video" | "image";
  url: string | null;
  thumbnail_url: string | null;
  ad_count: number;
  tags: Record<string, string[]>;
  is_tagged: boolean;
  tagged_at: string | null;
  metrics: AdMetrics | null;
  ads: AdEntry[];
};

type Props = { creative: Creative; onSelect: (creative: Creative) => void };

export function AdsCard({ creative, onSelect }: Props) {
  const { selected } = useAdsMetrics();
  const { selected: account } = useAdAccount();
  const metricDefs = getMetricDefs(account?.currency ?? "USD");
  const selectedDefs = metricDefs.filter((d) => selected.includes(d.key));
  const [playing, setPlaying] = useState(false);

  const rep = creative.ads[0]; // representative ad — highest spend
  const previewSrc =
    creative.creative_type === "video"
      ? creative.thumbnail_url || creative.url
      : creative.url;
  const isVideo = creative.creative_type === "video";
  const hasVideoUrl = isVideo && !!creative.url;
  const extraAds = creative.ad_count - 1;

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(creative)}
    >
      {/* Creative area */}
      <div className="relative aspect-3/4 bg-linear-to-br from-slate-800 to-slate-900 overflow-hidden">
        {playing && hasVideoUrl ? (
          <video
            src={creative.url ?? undefined}
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
                loading="eager"
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

            {/* Type badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/55 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
              {isVideo ? (
                <VideoIcon className="size-3" />
              ) : (
                <ImageIcon className="size-3" />
              )}
              {isVideo ? "Video" : "Image"}
            </div>

            {/* +N more badge */}
            {extraAds > 0 && (
              <div className="absolute top-3 right-3 bg-black/55 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                +{extraAds} more
              </div>
            )}

            {/* Play button overlay */}
            {hasVideoUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPlaying(true);
                }}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="size-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-colors">
                  <Play className="size-5 text-white fill-white ml-0.5" />
                </div>
              </button>
            )}

            {/* Headline overlay */}
            <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold leading-snug">
              {rep?.headline || rep?.ad_name || ""}
            </p>
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-3">
        {/* Ad name + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate min-w-0">
            {rep?.ad_name || "—"}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0",
              rep?.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground"
            )}
          >
            {rep?.status}
          </span>
        </div>

        {/* Tag chips */}
        {creative.is_tagged ? (
          <TagChips tags={creative.tags} />
        ) : (
          <span className="text-[10px] text-muted-foreground/60 border border-dashed border-muted-foreground/30 rounded-full px-2 py-0.5 w-fit">
            untagged
          </span>
        )}

        {/* Metrics grid */}
        {selectedDefs.length > 0 && (
          <>
            <div className="w-full h-px bg-border" />
            <div className="grid grid-cols-3 gap-x-2 gap-y-3">
              {selectedDefs.map((def) => {
                const val =
                  def.key === "launched_at"
                    ? creative.ads[0]?.launched_at
                    : (creative.metrics?.[def.key as keyof AdMetrics] as
                        | number
                        | null
                        | undefined);
                return (
                  <div
                    key={def.key}
                    className="flex flex-col items-center gap-0.5"
                  >
                    <span className="text-[11px] text-muted-foreground">
                      {def.label}
                    </span>
                    <span className="text-sm font-bold">{def.format(val)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
