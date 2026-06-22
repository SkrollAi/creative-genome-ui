"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Report } from "./use-reports";

const PRESETS = [
  { label: "Last 7 days",  value: "last_7d" },
  { label: "Last 14 days", value: "last_14d" },
  { label: "Last 30 days", value: "last_30d" },
  { label: "Last 90 days", value: "last_90d" },
  { label: "Last year",    value: "last_year" },
  { label: "Maximum",      value: "maximum" },
];

type Mode = "preset" | "custom";

type Props = {
  report: Report | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reportId: string, dateRange?: string | { from: string; to: string }) => void;
  isPending: boolean;
};

export function RerunDialog({ report, open, onClose, onConfirm, isPending }: Props) {
  const [mode, setMode] = useState<Mode>("preset");
  const [preset, setPreset] = useState("last_14d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function handleConfirm() {
    if (!report) return;
    if (mode === "preset") {
      onConfirm(report.id, preset);
    } else {
      if (!from || !to) return;
      onConfirm(report.id, { from, to });
    }
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setMode("preset");
      setPreset("last_14d");
      setFrom("");
      setTo("");
      onClose();
    }
  }

  const canConfirm = mode === "preset" || (!!from && !!to);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="size-4" />
            Rerun report
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <p className="text-sm font-semibold">{report?.name}</p>

          {/* Presets */}
          <div
            className={cn("flex flex-col gap-2 rounded-lg border p-3 cursor-pointer transition-colors",
              mode === "preset" ? "border-primary bg-primary/5" : "border-border"
            )}
            onClick={() => setMode("preset")}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preset</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMode("preset"); setPreset(p.value); }}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-md border transition-colors text-left",
                    mode === "preset" && preset === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Custom range */}
          <div
            className={cn("flex flex-col gap-2 rounded-lg border p-3 cursor-pointer transition-colors",
              mode === "custom" ? "border-primary bg-primary/5" : "border-border"
            )}
            onClick={() => setMode("custom")}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom range</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={from}
                  max={to || undefined}
                  onClick={(e) => { e.stopPropagation(); setMode("custom"); }}
                  onChange={(e) => { setMode("custom"); setFrom(e.target.value); }}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={to}
                  min={from || undefined}
                  max={new Date().toISOString().split("T")[0]}
                  onClick={(e) => { e.stopPropagation(); setMode("custom"); }}
                  onChange={(e) => { setMode("custom"); setTo(e.target.value); }}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || isPending}>
            {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            Rerun
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
