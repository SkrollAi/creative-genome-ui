"use client";

import Image from "next/image";
import { VideoIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creative } from "@/app/(dashboard)/explore-ads/ui/ads-card";

type Props = {
  creative: Creative;
  selected: boolean;
  onSelect: () => void;
  onDetail: () => void;
};

export function TaggingCreativeCard({
  creative,
  selected,
  onSelect,
  onDetail,
}: Props) {
  const info = creative.creative;
  const ad = creative.representative_ad;
  const primaryAsset = info.assets[0];
  const isVideo = info.creative_type === "video";
  const previewSrc = isVideo
    ? info.thumbnail_url || primaryAsset?.url
    : primaryAsset?.url;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border hover:bg-muted/40"
      )}
    >
      {/* Thumbnail */}
      <div className="relative size-12 rounded-md overflow-hidden bg-muted shrink-0">
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt=""
            fill
            className="object-cover"
            unoptimized
            loading="eager"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {isVideo ? (
              <VideoIcon className="size-4 text-muted-foreground" />
            ) : (
              <ImageIcon className="size-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Name + tagged status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {ad.ad_name || info.creative_id}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {info.is_tagged && (
            <p className="text-[10px] text-emerald-600 font-medium">tagged</p>
          )}
          {creative.ad_count > 1 && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              +{creative.ad_count - 1} more
            </span>
          )}
        </div>
      </div>

      {/* Detail button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetail();
        }}
        className="text-[10px] text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 shrink-0 transition-colors"
      >
        see more
      </button>
    </div>
  );
}
