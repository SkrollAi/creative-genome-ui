"use client";

import { cn } from "@/lib/utils";
import { useMatrixStore, useMatrixDerived } from "./use-matrix";
import { MatrixCell } from "./matrix-cell";
import { getMetricDefs } from "@/app/explore-ads/ui/ads-metrics-store";
import { useAdAccount } from "@/context/ad-account-context";
import type { MatrixCreative } from "./use-matrix";

type Props = {
  creatives: MatrixCreative[];
  library?: { key: string; defaults: string[]; custom_tags: string[] }[];
};

export function MatrixGrid({ creatives, library }: Props) {
  const { selected: account } = useAdAccount();
  const {
    row_category,
    col_category,
    color_by,
    display_mode,
    setSelectedCell,
  } = useMatrixStore();
  const { rowTags, colTags, cellMap, baseline } = useMatrixDerived(
    creatives,
    library
  );
  const metricDefs = getMetricDefs(account?.currency ?? "USD");
  const metricDef = metricDefs.find((d) => d.key === color_by) ?? metricDefs[0];

  if (!rowTags.length || !colTags.length || !baseline) {
    return (
      <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground">
        No tag combinations found for the selected categories.
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 min-w-0 overflow-auto">
      <table className="border-separate border-spacing-0">
        <thead>
          <tr>
            {/* top-left corner — sticky both axes */}
            <th
              className="w-36 pt-4 pl-4 pb-2 pr-4 sticky top-0 left-0 z-30 bg-background"
              style={{ boxShadow: "inset -1px -1px 0 hsl(var(--border))" }}
            />
            {colTags.map((ct, i) => (
              <th
                key={ct}
                className={cn(
                  "text-center pt-4 pb-2 px-1 font-normal sticky top-0 z-20 bg-background",
                  i === colTags.length - 1 && "pr-4"
                )}
                style={{ boxShadow: "inset 0 -1px 0 hsl(var(--border))" }}
              >
                <span className="text-xs text-muted-foreground">{ct}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowTags.map((rt, ri) => (
            <tr key={rt}>
              <td
                className={cn(
                  "pl-4 text-right pr-4 text-xs text-muted-foreground whitespace-nowrap align-middle sticky left-0 z-10 bg-background",
                  ri === rowTags.length - 1 && "pb-4"
                )}
                style={{ boxShadow: "inset -1px 0 0 hsl(var(--border))" }}
              >
                {rt}
              </td>
              {colTags.map((ct, ci) => {
                const key = `${rt}|||${ct}`;
                const cell = cellMap.get(key) ?? null;
                return (
                  <MatrixCell
                    key={ct}
                    data={cell?.metrics ?? null}
                    colorBy={color_by}
                    baseline={baseline}
                    displayMode={display_mode}
                    metricDef={metricDef}
                    rowTag={rt}
                    colTag={ct}
                    isLastCol={ci === colTags.length - 1}
                    isLastRow={ri === rowTags.length - 1}
                    onClick={() =>
                      cell && setSelectedCell({ row_tag: rt, col_tag: ct })
                    }
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
