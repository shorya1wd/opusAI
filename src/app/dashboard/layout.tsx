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

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 border-r bg-white dark:bg-neutral-950 flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b">
          <span className="font-bold text-base tracking-tight">Opus AI</span>
        </div>
        <DashboardNav />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 bg-white dark:bg-neutral-950 shrink-0">
          {/* Mobile: Hamburger + Title */}
          <div className="flex items-center gap-3 md:hidden">
            <MobileNav />
            <span className="font-bold text-base tracking-tight">Opus AI</span>
          </div>
          {/* Desktop: empty left, user right */}
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <CustomUserButton />
          </div>
        </header>
        {/* Page Content */}
        <div className="p-4 md:p-6 flex-1 overflow-auto bg-neutral-50/50 dark:bg-neutral-900/30">
          {children}
        </div>
      </main>
    </div>
  )
}