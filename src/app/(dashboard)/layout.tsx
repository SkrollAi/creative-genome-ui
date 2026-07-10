import { AppSidebar } from "@/app/(dashboard)/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="h-full">
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen min-w-0 overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
