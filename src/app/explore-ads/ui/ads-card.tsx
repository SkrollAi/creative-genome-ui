"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, VideoIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { METRIC_DEFS, useAdsMetrics } from "./ads-metrics-store";

export type AdMetrics = {
  ad_id: string;
  date_from: string;
  date_to: string;
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
};

export type Ad = {
  id: string;
  ad_id: string;
  ad_account_id: string;
  ad_name: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  creative_type: "video" | "image";
  url: string;
  thumbnail_url: string;
  headline: string;
  cta: string;
  primary_text: string;
  status: "ACTIVE" | "PAUSED";
  synced_at: string;
  metrics: AdMetrics | null;
};

type Props = { ad: Ad; onSelect: (ad: Ad) => void };

export function AdsCard({ ad, onSelect }: Props) {
  const { selected } = useAdsMetrics();
  const selectedDefs = METRIC_DEFS.filter((d) => selected.includes(d.key));
  const [playing, setPlaying] = useState(false);

  const previewSrc =
    ad.creative_type === "video" ? ad.thumbnail_url || ad.url : ad.url;
  const isVideo = ad.creative_type === "video";
  const hasVideoUrl = isVideo && !!ad.url;

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(ad)}
    >
      {/* Creative area */}
      <div className="relative aspect-4/3 bg-linear-to-br from-slate-800 to-slate-900 overflow-hidden">
        {playing && hasVideoUrl ? (
          <video
            src={ad.url}
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
                alt={ad.headline || ad.ad_name}
                fill
                className="object-cover"
                unoptimized
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

            {/* Type badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/55 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
              {isVideo ? <VideoIcon className="size-3" /> : <ImageIcon className="size-3" />}
              {isVideo ? "Video" : "Image"}
            </div>

            {/* Play button overlay */}
            {hasVideoUrl && (
              <button
                onClick={(e) => { e.stopPropagation(); setPlaying(true); }}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="size-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-colors">
                  <Play className="size-5 text-white fill-white ml-0.5" />
                </div>
              </button>
            )}

            {/* Headline overlay */}
            <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold leading-snug">
              {ad.headline || ad.ad_name}
            </p>
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-3">
        {/* Ad name + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate min-w-0">
            {ad.ad_name}
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

        {/* Metrics grid */}
        {selectedDefs.length > 0 && (
          <>
            <div className="w-full h-px bg-border" />
            <div className="grid grid-cols-3 gap-x-2 gap-y-3">
              {selectedDefs.map((def) => {
                const val = ad.metrics?.[def.key as keyof AdMetrics] as number | null | undefined;
                return (
                  <div key={def.key} className="flex flex-col items-center gap-0.5">
                    <span className="text-[11px] text-muted-foreground">{def.label}</span>
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
