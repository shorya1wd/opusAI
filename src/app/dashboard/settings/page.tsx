import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import SettingsTabs from "./SettingsTabs"

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true }
  })

  if (!user?.organization) redirect("/onboarding")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your workspace preferences and personal profile.
        </p>
      </div>

      <SettingsTabs 
        orgName={user.organization.name} 
        role={user.role} 
      />
    </div>
  )
}