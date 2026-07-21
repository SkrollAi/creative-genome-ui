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

export type CreativeAsset = { kind: "image" | "video" | ""; url: string };

// Fields owned by cg_creatives — shared by every ad using this creative.
// Mirrors the backend's actual logical split; never re-flatten this into
// the parent Creative object.
export type CreativeInfo = {
  creative_id: string;
  creative_type: "video" | "image";
  assets: CreativeAsset[];
  thumbnail_url: string;
  headline: string[];
  primary_text: string[];
  cta: string;
  cta_url: string;
  cta_app_link: string;
  tags: Record<string, string[]>;
  is_tagged: boolean;
};

// Fields owned by cg_ads — specific to the single representative (highest-
// spend) ad. The full list of every ad sharing this creative is in `ads`
// below (explore-ads) or fetched live (reports/tagging — see ads-sheet.tsx).
export type RepresentativeAd = {
  ad_id: string;
  ad_name: string;
  status: "ACTIVE" | "PAUSED" | "";
  launched_at: string;
};

export type SharedAd = {
  ad_id: string;
  ad_name: string;
  adset_name: string;
  campaign_name: string;
  status: "ACTIVE" | "PAUSED" | "";
  launched_at: string;
  metrics: AdMetrics | null;
};

export type Creative = {
  creative: CreativeInfo;
  representative_ad: RepresentativeAd;
  ad_count: number;
  window_date_from: string;
  window_date_to: string;
  metrics: AdMetrics | null;
  // Every ad sharing this creative, with its own metrics — embedded by the
  // backend for explore-ads, reports, and tagging alike (see
  // serialize_creative), so the sheet never needs a separate fetch.
  ads: SharedAd[];
};

type Props = { creative: Creative; onSelect: (creative: Creative) => void };

export function AdsCard({ creative, onSelect }: Props) {
  const { selected } = useAdsMetrics();
  const { selected: account } = useAdAccount();
  const metricDefs = getMetricDefs(account?.currency ?? "INR");
  const selectedDefs = metricDefs.filter((d) => selected.includes(d.key));
  const [playing, setPlaying] = useState(false);

  const info = creative.creative;
  const ad = creative.representative_ad;
  const primaryAsset = info.assets[0];
  const isVideo = info.creative_type === "video";
  const previewSrc = isVideo
    ? info.thumbnail_url || primaryAsset?.url
    : primaryAsset?.url;
  const hasVideoUrl = isVideo && !!primaryAsset?.url;
  const extraAds = creative.ad_count - 1;
  const headline = info.headline[0] || "";

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(creative)}
    >
      {/* Creative area — natural aspect ratio, not stretched/cropped into a
          fixed box (we don't store asset width/height, so the container
          lets the media size itself instead of forcing a crop). */}
      <div className="relative bg-linear-to-br from-slate-800 to-slate-900 overflow-hidden">
        {playing && hasVideoUrl ? (
          <video
            src={primaryAsset?.url}
            className="w-full max-h-100 object-contain mx-auto"
            autoPlay
            controls
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <div className="relative w-full aspect-3/4">
            {previewSrc && (
              <Image
                src={previewSrc}
                alt={headline || ad.ad_name || ""}
                fill
                className="object-contain"
                unoptimized
                loading="eager"
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

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
              {headline || ad.ad_name || ""}
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-3">
        {/* Ad name + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate min-w-0">
            {ad.ad_name || "—"}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0",
              ad.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground"
            )}
          >
            {ad.status}
          </span>
        </div>

        {/* Tag chips */}
        {info.is_tagged ? (
          <TagChips tags={info.tags} />
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
                    ? ad.launched_at
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
