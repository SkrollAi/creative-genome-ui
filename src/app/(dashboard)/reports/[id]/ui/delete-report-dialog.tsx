"use client";

import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteReport } from "@/app/(dashboard)/reports/ui/use-reports";
import type { Report } from "@/app/(dashboard)/reports/ui/use-reports";

type Props = {
  report: Report;
  open: boolean;
  onClose: () => void;
};

export function DeleteReportDialog({ report, open, onClose }: Props) {
  const router = useRouter();
  const { mutate: deleteReport, isPending } = useDeleteReport();

  function handleConfirm() {
    deleteReport(report.id, {
      onSuccess: () => {
        onClose();
        router.push("/explore-ads");
      },
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{report.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This report will be permanently deleted. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            <Trash2 className="size-3.5 mr-1.5" />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
