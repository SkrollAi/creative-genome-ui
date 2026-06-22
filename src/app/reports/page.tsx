import { ReportsList } from "./ui/reports-list";

export default function ReportsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Saved reports to view you can come back to, or share with your team.
        </p>
      </div>

      <ReportsList />
    </div>
  );
}
