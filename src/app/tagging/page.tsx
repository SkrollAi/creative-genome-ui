import { TaggingContent } from "./ui/tagging-content";

export default function TaggingPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-lg font-semibold">Tagging</h1>
        <p className="text-sm text-muted-foreground">
          Add your own tags to each ad — no fixed taxonomy.
        </p>
      </div>
      <TaggingContent />
    </div>
  );
}
