import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

import CustomUserButton from "@/components/ui/CustomUserButton";
import DashboardNav from "@/components/DashBoardNav";
import MobileNav from "@/components/MobileNav"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />

      {/* ⬅️ Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-neutral-50 dark:bg-neutral-950 flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl tracking-tight">
          Opus AI
        </div>
        <DashboardNav />
      </aside>

      {/* ➡️ Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navigation */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-white dark:bg-neutral-900 shrink-0">
          
          {/* 📱 Mobile Header Left Side (Hamburger + Title) */}
          <div className="flex items-center gap-3 md:hidden">
            <MobileNav /> {/* 🚀 Simply drop it right here! */}
            <span className="font-bold text-lg tracking-tight">Opus AI</span>
          </div>

          {/* 💻 Desktop Header Left Side */}
          <div className="hidden md:block text-sm font-medium text-muted-foreground">
            Workspace Overview
          </div>

          {/* Right Side (Avatar) */}
          <div className="flex items-center gap-4">
            <CustomUserButton />
          </div>
        </header>
        
        {/* Actual Page Content */}
        <div className="p-4 md:p-6 flex-1 overflow-auto bg-neutral-50/50 dark:bg-neutral-900">
          {children}
        </div>
      </main>
    </div>
  )
}