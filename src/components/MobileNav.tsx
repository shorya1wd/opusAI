"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import DashboardNav from "@/components/DashBoardNav";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 🚀 The magic: whenever the pathname changes, close the sheet!
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl tracking-tight">
          Opus AI
        </div>
        {/* We reuse the same nav links here */}
        <DashboardNav />
      </SheetContent>
    </Sheet>
  );
}