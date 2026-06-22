import { LayoutGrid, FileText } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  {
    title: "Explore Ads",
    href: "/explore-ads",
    icon: LayoutGrid,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
];
