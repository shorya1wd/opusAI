"use client"

import { UserProfile } from "@clerk/nextjs"
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function CustomSettingsBlock() {
  const { resolvedTheme } = useTheme();
  return (
    <div className="flex justify-start w-full">
      <UserProfile routing="hash" appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
         variables:resolvedTheme==="dark" ? { colorPrimary: "#6366f1" } : undefined,
      } as any} />
    </div>
  )
}