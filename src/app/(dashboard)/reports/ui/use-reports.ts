"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAdAccount } from "@/context/ad-account-context";

export type Report = {
  id: string;
  ad_account_id: string;
  name: string;
  filters: {
    search?: string;
    ad_name?: string;
    adset_name?: string;
    campaign_name?: string;
    creative_type?: string;
    status?: string;
    sort?: string;
    order?: string;
    limit?: number;
    date_from?: string;
    date_to?: string;
    launched_at_from?: string;
    launched_at_to?: string;
    metric_filters?: { metric: string; operator: string; value: number }[];
  };
  last_rerun_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useReports() {
  const { selected } = useAdAccount();
  return useQuery<Report[]>({
    queryKey: ["reports", selected?.account_id],
    queryFn: async () => {
      const res = await api.post("/creative_genome/reports/list", {
        account_id: selected?.account_id,
      });
      return res.data.reports ?? [];
    },
    enabled: !!selected?.account_id,
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  const { selected } = useAdAccount();
  return useMutation({
    mutationFn: (report_id: string) =>
      api.post("/creative_genome/reports/delete", { report_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", selected?.account_id] });
      toast.success("Report deleted");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to delete report"),
  });
}
