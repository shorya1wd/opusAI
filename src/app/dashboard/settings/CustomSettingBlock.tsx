"use client"

import { UserProfile } from "@clerk/nextjs"

export default function CustomSettingsBlock() {
  return (
    <div className="flex justify-start w-full">
      <UserProfile routing="hash" />
    </div>
  )
}