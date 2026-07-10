"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReport } from "./use-report";
import { UpdateReportDialog } from "./update-report-dialog";
import { DeleteReportDialog } from "./delete-report-dialog";

export function ReportActions({ id }: { id: string }) {
  const { data: report } = useReport(id);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!report) return null;

  return (
    <>
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

      <DeleteReportDialog
        report={report}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
