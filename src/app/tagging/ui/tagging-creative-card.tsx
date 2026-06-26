"use client";

import Image from "next/image";
import { VideoIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Creative } from "@/app/explore-ads/ui/ads-card";

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
  const rep = creative.ads[0];
  const isVideo = creative.creative_type === "video";
  const previewSrc = isVideo
    ? creative.thumbnail_url || creative.url
    : creative.url;

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
          {rep?.ad_name || creative.creative_id}
        </p>
        {creative.is_tagged && (
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
            tagged
          </p>
        )}
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
