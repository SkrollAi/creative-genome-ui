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
    creative_type?: string;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
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
      return res.data.data ?? [];
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
    onError: () => toast.error("Failed to delete report"),
  });
}

type RerunArgs = { report_id: string; date_range?: string | { from: string; to: string } };

export function useRerunReport() {
  const qc = useQueryClient();
  const { selected } = useAdAccount();
  return useMutation({
    mutationFn: ({ report_id, date_range }: RerunArgs) =>
      api.post("/creative_genome/reports/rerun", { report_id, ...(date_range ? { date_range } : {}) }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["reports", selected?.account_id] });
      const { metrics_saved, ads_queried } = res.data.data ?? {};
      toast.success(`Synced — ${metrics_saved ?? 0} metrics updated across ${ads_queried ?? 0} ads`);
    },
    onError: (err: any) => toast.error(err?.response?.data?.error ?? "Failed to rerun report"),
  });
}
