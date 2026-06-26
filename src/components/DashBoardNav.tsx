"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-2">
      <ThemeToggle />
      {navLinks.map((link) => {
        const Icon = link.icon;
        
      
        const isActive = link.exact 
          ? pathname === link.href 
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? "bg-neutral-200 dark:bg-neutral-800 font-medium text-foreground"
                : "text-muted-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}