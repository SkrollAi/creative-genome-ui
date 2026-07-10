"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TagCategory } from "./use-tagging";

const CATEGORY_COLORS = ["bg-muted-foreground/40"];

type Props = {
  category: TagCategory;
  colorIndex: number;
  selected: string[];
  onChange: (tags: string[]) => void;
};

export function TagCategorySection({
  category,
  colorIndex,
  selected,
  onChange,
}: Props) {
  const [inputVal, setInputVal] = useState("");
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const allTags = [...category.custom_tags, ...category.defaults];
  const dotColor = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  function addCustom() {
    const val = inputVal.trim();
    if (!val) return;
    if (!selected.includes(val)) onChange([...selected, val]);
    setInputVal("");
    setShowInput(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addCustom();
    if (e.key === "Escape") {
      setShowInput(false);
      setInputVal("");
    }
  }

  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className={cn("size-2.5 rounded-full shrink-0", dotColor)} />
        <span className="font-semibold text-sm">{category.label}</span>
        <span className="text-xs text-muted-foreground">
          {category.description}
        </span>
      </div>

      {/* Selected chips */}
      <div className="flex flex-wrap gap-1.5 min-h-7">
        {selected.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {tag}
            <button
              onClick={() => toggle(tag)}
              className="hover:text-destructive transition-colors"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {showInput ? (
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={addCustom}
            placeholder="type & enter"
            className="text-xs px-2.5 py-1 rounded-full border border-dashed border-primary bg-transparent outline-none w-28"
          />
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="size-3" /> add tag
          </button>
        )}
      </div>

      {/* Library */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mr-1">
          Your library
        </span>
        {allTags.map((tag) => {
          const isApplied = selected.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                isApplied
                  ? "line-through text-muted-foreground/50 border-border/50 cursor-default"
                  : "text-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
