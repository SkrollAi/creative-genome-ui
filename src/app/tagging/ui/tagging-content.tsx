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
  SlidersHorizontal,
  ChevronDown,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAdAccount } from "@/context/ad-account-context";
import {
  useTaggingCreatives,
  useTagLibrary,
  useSaveTags,
  useTaggingFiltersStore,
} from "./use-tagging";

import { SORT_OPTIONS } from "@/app/explore-ads/ui/use-ads-filters";

const TAGGING_SORT_OPTIONS = [
  { label: "Untagged first", value: "is_tagged" },
  ...SORT_OPTIONS,
];
import { TaggingCreativeCard } from "./tagging-creative-card";
import { TagCategorySection } from "./tag-category-section";
import { TaggingDatePicker } from "./tagging-date-picker";
import { AdsSheet } from "@/app/explore-ads/ui/ads-sheet";
import type { Creative } from "@/app/explore-ads/ui/ads-card";

export function TaggingContent() {
  const { selected: account } = useAdAccount();
  const { data, isLoading, isFetching } = useTaggingCreatives();
  const { data: library } = useTagLibrary();
  const { mutate: saveTags, isPending: isSaving } = useSaveTags();
  const { filters, setFilters, reset } = useTaggingFiltersStore();

  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(
    null
  );
  const [sheetCreative, setSheetCreative] = useState<Creative | null>(null);
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const creatives = data?.creatives ?? [];
  const pagination = data?.pagination;

  // reset filters on unmount
  useEffect(() => {
    return () => reset();
  }, []);

  // clear right panel on filter change
  useEffect(() => {
    setSelectedCreative(null);
  }, [filters.date_from, filters.date_to, filters.sort, filters.page]);

  // when creative changes, prefill existing tags
  useEffect(() => {
    if (selectedCreative) {
      setTags(selectedCreative.tags ?? {});
      setPlaying(false);
      setSaved(false);
    }
  }, [selectedCreative?.creative_id]);

  function handleSave() {
    if (!selectedCreative) return;
    saveTags(
      { creative_id: selectedCreative.creative_id, tags },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
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

  const isVideo = selectedCreative?.creative_type === "video";
  const previewSrc = selectedCreative
    ? isVideo
      ? selectedCreative.thumbnail_url || selectedCreative.url
      : selectedCreative.url
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
          <div className="px-3 py-3 border-b border-border flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9 flex-1 justify-between"
                >
                  <SlidersHorizontal className="size-3.5 shrink-0" />
                  <span className="truncate font-semibold">
                    {TAGGING_SORT_OPTIONS.find((o) => o.value === filters.sort)
                      ?.label ?? "Sort"}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuRadioGroup
                  value={filters.sort}
                  onValueChange={(v) => setFilters({ sort: v, page: 1 })}
                >
                  {TAGGING_SORT_OPTIONS.map((o) => (
                    <DropdownMenuRadioItem key={o.value} value={o.value}>
                      {o.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <TaggingDatePicker />
          </div>

          {/* List — scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto py-2 px-2">
            {isLoading || isFetching ? (
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
                  key={c.creative_id}
                  creative={c}
                  selected={selectedCreative?.creative_id === c.creative_id}
                  onSelect={() => setSelectedCreative(c)}
                  onDetail={() => setSheetCreative(c)}
                />
              ))
            )}
          </div>

          {/* Pagination — fixed at bottom */}
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
        </div>

        {/* ── Right: creative detail + categories ──────────────────────── */}
        {selectedCreative ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex gap-6 p-6 min-h-full">
              {/* Creative preview — sticky */}
              <div className="w-64 shrink-0">
                <div className="sticky top-6 flex flex-col gap-4">
                  <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-muted">
                    {playing && isVideo && selectedCreative.url ? (
                      <video
                        src={selectedCreative.url}
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
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                            loading="eager"
                          />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                        {/* type badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/55 text-white text-xs px-2 py-1 rounded-full">
                          {isVideo ? (
                            <VideoIcon className="size-3" />
                          ) : (
                            <ImageIcon className="size-3" />
                          )}
                          {isVideo ? "Video" : "Image"}
                        </div>
                        {isVideo && selectedCreative.url && (
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
                          {selectedCreative.ads[0]?.headline ||
                            selectedCreative.ads[0]?.ad_name ||
                            ""}
                        </p>
                      </>
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
                            ? `$${(s / 1000).toFixed(1)}k`
                            : `$${s.toFixed(0)}`;
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
                          Object.values(selectedCreative.tags ?? {}).flat()
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
