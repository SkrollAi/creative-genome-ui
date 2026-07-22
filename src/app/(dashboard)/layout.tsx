import { AppSidebar } from "@/app/(dashboard)/ui/app-sidebar";
import { MaintenanceScreen } from "@/app/(dashboard)/ui/maintenance-screen";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const MAINTENANCE_MODE = false;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (MAINTENANCE_MODE) {
    return <MaintenanceScreen />;
  }

  return (
    <SidebarProvider className="h-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen min-w-0 overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
