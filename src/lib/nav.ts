import { LayoutGrid, Tag, Grid2x2 } from "lucide-react";

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
    title: "Tagging",
    href: "/tagging",
    icon: Tag,
  },
  {
    title: "Matrix",
    href: "/matrix",
    icon: Grid2x2,
  },
];
