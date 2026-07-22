"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  VideoIcon,
  ImageIcon,
  Loader2,
  Check,
  Tag,
  ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdAccount } from "@/context/ad-account-context";
import { currencySymbol } from "@/lib/currency";
import {
  useTaggingCreatives,
  useTagLibrary,
  useSaveTags,
  useTaggingFiltersStore,
} from "./use-tagging";

import { TaggingCreativeCard } from "./tagging-creative-card";
import { TagCategorySection } from "./tag-category-section";
import { AdsSheet } from "@/app/(dashboard)/explore-ads/ui/ads-sheet";
import type { Creative } from "@/app/(dashboard)/explore-ads/ui/ads-card";
import { useReports } from "@/app/(dashboard)/reports/ui/use-reports";
import type { Report } from "@/app/(dashboard)/reports/ui/use-reports";

export function TaggingContent() {
  const { selected: account } = useAdAccount();
  const sym = currencySymbol(account?.currency ?? "INR");
  const { data, isLoading, isFetching } = useTaggingCreatives();
  const { data: library } = useTagLibrary();
  const { mutate: saveTags, isPending: isSaving } = useSaveTags();
  const { filters, setFilters, reset } = useTaggingFiltersStore();
  const { data: reports, isLoading: reportsLoading } = useReports();

  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(
    null
  );
  const [sheetCreative, setSheetCreative] = useState<Creative | null>(null);
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const creatives = data?.creatives ?? [];
  const pagination = data?.pagination;

  // reset filters on unmount
  useEffect(() => {
    return () => reset();
  }, []);

  // clear right panel on filter change
  useEffect(() => {
    setSelectedCreative(null);
  }, [filters.creative_type, filters.page, filters.selected_report?.id]);

  // when creative changes, prefill existing tags
  useEffect(() => {
    if (selectedCreative) {
      setTags(selectedCreative.creative.tags ?? {});
      setPlaying(false);
      setSaved(false);
    }
  }, [selectedCreative?.creative.creative_id]);

  function handleSave() {
    if (!selectedCreative) return;
    saveTags(
      { creative_id: selectedCreative.creative.creative_id, tags },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to save tags");
        },
      }
    );
  }

  if (!account) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Select an ad account to get started.
      </div>
    );
  }

  const selectedInfo = selectedCreative?.creative;
  const selectedAd = selectedCreative?.representative_ad;
  const selectedAsset = selectedInfo?.assets[0];
  const isVideo = selectedInfo?.creative_type === "video";
  const previewSrc = selectedInfo
    ? isVideo
      ? selectedInfo.thumbnail_url || selectedAsset?.url
      : selectedAsset?.url
    : null;

  return (
    <>
      <AdsSheet
        creative={sheetCreative}
        open={!!sheetCreative}
        onClose={() => setSheetCreative(null)}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left: creative list ───────────────────────────────────────── */}
        <div className="w-80 shrink-0 border-r border-border flex flex-col min-h-0">
          {/* Filters — fixed */}
          <div className="px-3 pt-3 pb-2 border-b border-border flex flex-col gap-2 shrink-0">
            {/* Report picker */}
            <Popover open={reportOpen} onOpenChange={setReportOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  role="combobox"
                  className="w-full justify-between h-8 text-xs font-normal"
                >
                  <span className="truncate">
                    {filters.selected_report?.name ?? "Select a report…"}
                  </span>
                  <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search reports…"
                    className="h-8 text-xs"
                  />
                  <CommandList>
                    <CommandEmpty className="py-4 text-xs text-center text-muted-foreground">
                      No reports found.
                    </CommandEmpty>
                    <CommandGroup>
                      {reports?.map((r: Report) => (
                        <CommandItem
                          key={r.id}
                          value={r.name}
                          onSelect={() => {
                            setFilters({ selected_report: r, page: 1 });
                            setReportOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "size-3.5 mr-2 shrink-0",
                              filters.selected_report?.id === r.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm truncate">{r.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {r.filters.date_from
                                ? new Date(
                                    r.filters.date_from
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : ""}
                              {" – "}
                              {r.filters.date_to
                                ? new Date(
                                    r.filters.date_to
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : ""}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Type segmented control */}
            <div className="flex items-center rounded-md border border-border overflow-hidden bg-muted/40">
              {(["all", "video", "image"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilters({ creative_type: t, page: 1 })}
                  className={cn(
                    "flex-1 text-xs py-1.5 capitalize transition-colors border-r border-border last:border-r-0",
                    filters.creative_type === t
                      ? "bg-background text-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* List — scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto py-2 px-2">
            {!filters.selected_report ? (
              <p className="text-center text-xs text-muted-foreground py-8 px-3">
                Select a report to load creatives.
              </p>
            ) : isLoading || isFetching ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm gap-2">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            ) : creatives.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No creatives found.
              </p>
            ) : (
              creatives.map((c) => (
                <TaggingCreativeCard
                  key={c.creative.creative_id}
                  creative={c}
                  selected={
                    selectedCreative?.creative.creative_id ===
                    c.creative.creative_id
                  }
                  onSelect={() => setSelectedCreative(c)}
                  onDetail={() => setSheetCreative(c)}
                />
              ))
            )}
          </div>

          {/* Pagination — fixed at bottom */}
          {filters.selected_report && (
            <div className="border-t border-border px-3 py-2 flex items-center justify-between gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">
                {pagination
                  ? `${pagination.current_page}/${pagination.total_pages} · ${pagination.total_items} creatives`
                  : "—"}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={!pagination?.has_prev || isFetching}
                  onClick={() => setFilters({ page: filters.page - 1 })}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={!pagination?.has_next || isFetching}
                  onClick={() => setFilters({ page: filters.page + 1 })}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: creative detail + categories ──────────────────────── */}
        {selectedCreative ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex gap-6 p-6 min-h-full">
              {/* Creative preview — sticky */}
              <div className="w-64 shrink-0">
                <div className="sticky top-6 flex flex-col gap-4">
                  <div className="relative rounded-xl overflow-hidden bg-muted">
                    {playing && isVideo && selectedAsset?.url ? (
                      <div className="relative w-full aspect-3/4">
                        <video
                          src={selectedAsset.url}
                          className="absolute inset-0 size-full object-contain"
                          autoPlay
                          controls
                          onEnded={() => setPlaying(false)}
                        />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-3/4">
                        {previewSrc && (
                          <Image
                            src={previewSrc}
                            alt=""
                            fill
                            className="object-contain"
                            unoptimized
                            loading="eager"
                          />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        {/* type badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/55 text-white text-xs px-2 py-1 rounded-full">
                          {isVideo ? (
                            <VideoIcon className="size-3" />
                          ) : (
                            <ImageIcon className="size-3" />
                          )}
                          {isVideo ? "Video" : "Image"}
                        </div>
                        {/* +N more badge */}
                        {selectedCreative.ad_count > 1 && (
                          <div className="absolute top-3 right-3 bg-black/55 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                            +{selectedCreative.ad_count - 1} more
                          </div>
                        )}
                        {isVideo && selectedAsset?.url && (
                          <button
                            onClick={() => setPlaying(true)}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="size-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                              <Play className="size-5 text-white fill-white ml-0.5" />
                            </div>
                          </button>
                        )}
                        <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold leading-snug line-clamp-2">
                          {selectedInfo?.headline[0] || selectedAd?.ad_name || ""}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* See details */}
                  <button
                    onClick={() => setSheetCreative(selectedCreative)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg py-2 transition-colors"
                  >
                    See more
                  </button>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Spend",
                        value: (() => {
                          const s = selectedCreative.metrics?.spend ?? 0;
                          return s >= 1000
                            ? `${sym}${(s / 1000).toFixed(1)}k`
                            : `${sym}${s.toFixed(0)}`;
                        })(),
                      },
                      {
                        label: "ROAS",
                        value: `${(selectedCreative.metrics?.roas ?? 0).toFixed(
                          2
                        )}×`,
                      },
                      {
                        label: "Tags",
                        value: String(
                          Object.values(selectedInfo?.tags ?? {}).flat()
                            .length
                        ),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-0.5 bg-muted/50 rounded-lg py-2 px-1"
                      >
                        <span className="text-sm font-bold">{value}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {data?.fetched_at && (
                    <p className="text-[10px] text-muted-foreground text-center -mt-2">
                      Metrics as of{" "}
                      {new Date(data.fetched_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="flex-1 flex flex-col gap-3">
                {!library ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="size-4 animate-spin" /> Loading library…
                  </div>
                ) : (
                  library.map((cat, i) => (
                    <TagCategorySection
                      key={cat.key}
                      category={cat}
                      colorIndex={i}
                      selected={tags[cat.key] ?? []}
                      onChange={(val) =>
                        setTags((prev) => ({ ...prev, [cat.key]: val }))
                      }
                    />
                  ))
                )}

                <Button
                  onClick={handleSave}
                  disabled={isSaving || Object.values(tags).flat().length === 0}
                  className={cn(
                    "mt-2 w-full",
                    saved && "bg-emerald-600 hover:bg-emerald-600"
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" /> Saving…
                    </>
                  ) : saved ? (
                    <>
                      <Check className="size-4 mr-2" /> Saved
                    </>
                  ) : (
                    "Save tags"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
              <Tag className="size-7 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Pick a creative
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Select from the list to start tagging
              </p>
            </div>
            {!isFetching && creatives.length > 0 && (
              <button
                onClick={() => setSelectedCreative(creatives[0])}
                className="text-xs text-primary hover:underline"
              >
                Start with first creative →
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
