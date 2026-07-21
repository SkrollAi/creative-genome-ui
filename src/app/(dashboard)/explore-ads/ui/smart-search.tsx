"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdsFilters } from "./use-ads-filters";

const FIELDS = [
  { label: "Ad Name", key: "ad_name" },
  { label: "Ad Set", key: "adset_name" },
  { label: "Campaign", key: "campaign_name" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function SmartSearch() {
  const { filters, setFilters } = useAdsFilters();
  const [field, setField] = useState<FieldKey>("ad_name");
  const [input, setInput] = useState("");

  const fieldLabel = FIELDS.find((f) => f.key === field)?.label ?? "Ad Name";

  // One chip per value, not per field — a field can have several active
  // values, OR-matched on the backend.
  const chips = FIELDS.flatMap((f) =>
    (filters[f.key] as string[]).map((value, i) => ({
      key: f.key,
      label: f.label,
      value,
      index: i,
    }))
  );

  function addChip() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const existing = filters[field] as string[];
    if (existing.includes(trimmed)) {
      setInput("");
      return;
    }
    setFilters({ [field]: [...existing, trimmed], page: 1 });
    setInput("");
  }

  function removeChip(key: FieldKey, index: number) {
    const existing = filters[key] as string[];
    setFilters({ [key]: existing.filter((_, i) => i !== index), page: 1 });
  }

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <div className="flex items-center h-9 rounded-lg border border-input bg-background px-2 gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors shrink-0 whitespace-nowrap">
              {fieldLabel}
              <ChevronDown className="size-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuRadioGroup
              value={field}
              onValueChange={(v) => setField(v as FieldKey)}
            >
              {FIELDS.map((f) => (
                <DropdownMenuRadioItem key={f.key} value={f.key}>
                  {f.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-xs text-muted-foreground shrink-0">contains</span>

        <input
          className="flex-1 h-full text-sm bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
          placeholder={`Search ${fieldLabel.toLowerCase()}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addChip();
            }
          }}
        />
      </div>

      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {chips.map((chip) => (
            <span
              key={`${chip.key}-${chip.index}`}
              className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-md px-2 py-1 font-medium"
            >
              <span className="text-muted-foreground">{chip.label}:</span>
              {chip.value}
              <button
                onClick={() => removeChip(chip.key as FieldKey, chip.index)}
                className="hover:text-destructive ml-0.5"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
