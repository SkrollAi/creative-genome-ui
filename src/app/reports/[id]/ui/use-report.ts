"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Report } from "@/app/reports/ui/use-reports";

export function useReport(id: string) {
  return useQuery<Report>({
    queryKey: ["report", id],
    queryFn: async () => {
      const res = await api.post("/creative_genome/reports/get", {
        report_id: id,
      });
      return res.data.data;
    },
    enabled: !!id,
  });
}
