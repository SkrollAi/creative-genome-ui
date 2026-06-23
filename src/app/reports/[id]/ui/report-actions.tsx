"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RerunDialog } from "@/app/reports/ui/rerun-dialog";
import { useRerunReport } from "@/app/reports/ui/use-reports";
import { useReport } from "./use-report";
import { UpdateReportDialog } from "./update-report-dialog";
import { DeleteReportDialog } from "./delete-report-dialog";

export function ReportActions({ id }: { id: string }) {
  const { data: report } = useReport(id);
  const { mutate: rerun, isPending: rerunning } = useRerunReport();
  const [rerunOpen, setRerunOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!report) return null;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-9 text-sm shrink-0"
        onClick={() => setRerunOpen(true)}
        disabled={rerunning}
      >
        {rerunning ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Rerun
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-9 text-sm shrink-0"
        onClick={() => setUpdateOpen(true)}
      >
        <Save className="size-4" />
        Update report
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 h-9 text-sm shrink-0 text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>

      <UpdateReportDialog
        report={report}
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
      />

      <RerunDialog
        report={report}
        open={rerunOpen}
        onClose={() => setRerunOpen(false)}
        isPending={rerunning}
        onConfirm={(report_id, date_range) =>
          rerun(
            { report_id, date_range },
            { onSuccess: () => setRerunOpen(false) }
          )
        }
      />

      <DeleteReportDialog
        report={report}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
