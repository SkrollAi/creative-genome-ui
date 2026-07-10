"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AccountSelector } from "@/app/(dashboard)/ui/account-selector";
import { UserMenu } from "@/app/(dashboard)/ui/user-menu";
import { useReports } from "@/app/(dashboard)/reports/ui/use-reports";

function ReportsSection() {
  const pathname = usePathname();
  const { data: reports, isLoading } = useReports();
  const [open, setOpen] = useState(true);

  return (
    <SidebarGroup>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-2 mb-1 group-data-[collapsible=icon]:hidden"
      >
        <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase p-0">
          Reports
        </SidebarGroupLabel>
        <ChevronDown
          className={cn(
            "size-3 text-muted-foreground transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>

      {open && (
        <SidebarGroupContent>
          <SidebarMenu>
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                <Loader2 className="size-3 animate-spin" /> Loading…
              </div>
            ) : !reports?.length ? (
              <p className="px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                No reports yet
              </p>
            ) : (
              reports.map((report) => {
                const active = pathname === `/reports/${report.id}`;
                return (
                  <SidebarMenuItem key={report.id}>
                    <Link
                      href={`/reports/${report.id}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg h-8 px-3 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <FileText className="size-3.5 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {report.name}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                );
              })
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="px-4 py-4 border-b border-border gap-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs font-bold">
              CG
            </span>
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sm leading-tight truncate">
              Creative Genome
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              Analyze what works
            </span>
          </div>
        </div>
        <AccountSelector />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 flex flex-col gap-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase px-2 mb-1 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg h-9 px-3 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <ReportsSection />
      </SidebarContent>

      <SidebarFooter className="border-t border-border px-2 py-3">
        <UserMenu />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
