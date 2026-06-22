"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, TrendingUp, LayoutGrid, Pencil, Info } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { METRIC_DEFS } from "./ads-metrics-store";
import type { Ad, AdMetrics } from "./ads-card";

type Props = { ad: Ad | null; open: boolean; onClose: () => void };

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", className)}>
      {children}
    </span>
  );
}

export function AdsSheet({ ad, open, onClose }: Props) {
  const [playing, setPlaying] = useState(false);

  if (!ad) return null;

  const isVideo = ad.creative_type === "video";
  const previewSrc = isVideo ? (ad.thumbnail_url || ad.url) : ad.url;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { setPlaying(false); onClose(); } }}>
      <SheetContent className="!w-[600px] !max-w-[600px] overflow-y-auto p-0 gap-0 flex flex-col">

        {/* ── Creative ───────────────────────────────────────────── */}
        <div className="relative aspect-video bg-slate-900 w-full shrink-0">
          {playing && isVideo && ad.url ? (
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
                <Image src={previewSrc} alt={ad.headline || ad.ad_name} fill className="object-cover" unoptimized />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              {isVideo && ad.url && (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-white/35 transition-colors">
                    <Play className="size-5 text-white fill-white ml-0.5" />
                  </div>
                </button>
              )}
              {/* Bottom overlay: name + status */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex flex-col gap-1">
                <p className="text-white text-base font-semibold leading-snug">{ad.headline || ad.ad_name}</p>
                <div className="flex items-center gap-2">
                  <Chip className={ad.status === "ACTIVE" ? "bg-emerald-500/25 text-emerald-300" : "bg-white/15 text-white/60"}>
                    {ad.status}
                  </Chip>
                  <Chip className="bg-white/15 text-white/70 capitalize">{ad.creative_type}</Chip>
                  {ad.cta && (
                    <Chip className="bg-white/15 text-white/70">{ad.cta.replace(/_/g, " ")}</Chip>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Ad name + ID ───────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <p className="text-sm font-semibold break-all">{ad.ad_name}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{ad.ad_id}</p>
        </div>

        <div className="flex flex-col gap-0 divide-y divide-border">

          {/* ── Key metrics ────────────────────────────────────────── */}
          <div className="px-5 py-4">
            <SectionLabel icon={TrendingUp} label="Performance" />
            {ad.metrics ? (
              <>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {METRIC_DEFS.map((def) => {
                    const val = ad.metrics?.[def.key as keyof AdMetrics] as number | null | undefined;
                    return (
                      <div key={def.key} className="rounded-lg bg-muted/50 px-3 py-2.5 flex flex-col gap-1">
                        <span className="text-[11px] text-muted-foreground">{def.label}</span>
                        <span className="text-base font-bold tracking-tight">{def.format(val)}</span>
                      </div>
                    );
                  })}
                </div>
                {ad.metrics.date_from && (
                  <p className="text-[11px] text-muted-foreground">
                    {ad.metrics.date_from} — {ad.metrics.date_to}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No metrics available.</p>
            )}
          </div>

          {/* ── Creative copy ──────────────────────────────────────── */}
          <div className="px-5 py-4">
            <SectionLabel icon={Pencil} label="Creative" />
            <div className="flex flex-col gap-3">
              {ad.headline && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Headline</p>
                  <p className="text-sm font-semibold break-all">{ad.headline}</p>
                </div>
              )}
              {ad.cta && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">CTA</p>
                  <p className="text-sm font-semibold">{ad.cta.replace(/_/g, " ")}</p>
                </div>
              )}
              {ad.primary_text && (
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Primary text</p>
                  <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed break-all">{ad.primary_text}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Structure ──────────────────────────────────────────── */}
          <div className="px-5 py-4">
            <SectionLabel icon={LayoutGrid} label="Structure" />
            <div className="flex flex-col gap-2.5">
              {[
                ["Campaign", ad.campaign_name],
                ["Ad set", ad.adset_name],
                ["Ad name", ad.ad_name],
              ].map(([label, val]) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <span className="text-sm font-semibold text-right break-all">{val || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── IDs ────────────────────────────────────────────────── */}
          <div className="px-5 py-4">
            <SectionLabel icon={Info} label="IDs" />
            <div className="flex flex-col gap-2">
              {[
                ["Account", ad.ad_account_id],
                ["Campaign", ad.campaign_id],
                ["Ad set", ad.adset_id],
                ["Ad", ad.ad_id],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <span className="text-sm font-semibold font-mono break-all">{val || "—"}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-border mt-1">
                <span className="text-xs text-muted-foreground w-20 shrink-0">Synced</span>
                <span className="text-sm font-semibold">
                  {ad.synced_at ? new Date(ad.synced_at.includes("Z") ? ad.synced_at : ad.synced_at.replace(" ", "T") + "Z").toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
