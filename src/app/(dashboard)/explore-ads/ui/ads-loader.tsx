"use client";

import { useEffect, useRef, useState } from "react";

const FILL_DURATION_MS = 15_000;
const TICK_MS = 80;

function easeProgress(t: number): number {
  return 90 * (1 - Math.exp(-4 * t));
}

type Props = { visible: boolean };

export function AdsLoader({ visible }: Props) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (visible) {
      setProgress(0);
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startRef.current!) / FILL_DURATION_MS;
        setProgress(easeProgress(Math.min(elapsed, 1)));
      }, TICK_MS);
    } else {
      setProgress(100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="flex flex-col items-center pt-20 gap-3">
      <p className="text-sm text-muted-foreground">Loading ads…</p>
      <div className="w-64 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
