import { MatrixContent } from "./ui/matrix-content";

export default function MatrixPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-lg font-semibold">Matrix</h1>
        <p className="text-sm text-muted-foreground">
          Cross any two of your tag categories and color by a metric.
        </p>
      </div>
      <MatrixContent />
    </div>
  );
}
