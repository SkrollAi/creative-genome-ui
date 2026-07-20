import { Construction } from "lucide-react";

export function MaintenanceScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <Construction className="size-10 text-muted-foreground" strokeWidth={1.5} />
      <div className="space-y-1.5">
        <h1 className="text-lg font-medium">This service is down</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;re making some improvements. It will be back up shortly — please check back in a while.
        </p>
      </div>
    </div>
  );
}
