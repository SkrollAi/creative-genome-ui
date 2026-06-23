import { AdsToolbar } from "./ui/ads-toolbar";
import { AdsContent } from "./ui/ads-content";
import { FiltersReset } from "./ui/filters-reset";
import { RerunAdsButton } from "./ui/rerun-ads-button";

export default function ExploreAdsPage() {
  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-border px-6 py-5">
        <h1 className="text-xl font-semibold tracking-tight">Explore Ads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your top-spending ads, ready to slice — save any view as a report.
        </p>
      </div>
      <FiltersReset />
      <AdsToolbar actions={<RerunAdsButton />} />
      <AdsContent />
    </div>
  );
}
