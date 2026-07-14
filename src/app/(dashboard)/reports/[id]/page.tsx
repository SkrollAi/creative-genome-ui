import { ReportHeader } from "./ui/report-header";
import { ReportFilterInitializer } from "./ui/report-filter-initializer";
import { ReportActions } from "./ui/report-actions";
import { AdsToolbar } from "@/app/(dashboard)/explore-ads/ui/ads-toolbar";
import { AdsContent } from "@/app/(dashboard)/explore-ads/ui/ads-content";

type Props = { params: Promise<{ id: string }> };

export default async function ReportPage({ params }: Props) {
  const { id } = await params;

  return (
    <div key={id} className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <ReportHeader id={id} />
      <ReportFilterInitializer id={id} />
      <AdsToolbar actions={<ReportActions id={id} />} hideSave reportId={id} />
      <AdsContent reportId={id} />
    </div>
  );
}
