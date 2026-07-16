import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { FolderKanban, Users, KeyRound } from "lucide-react"

export default async function DashboardData() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        include: {
          _count: { select: { users: true, projects: true } }
        }
      }
    }
  })

  if (!user?.organization) redirect("/onboarding")

  const org = user.organization

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm flex items-start gap-4">
        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <FolderKanban className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">Active Projects</p>
          <p className="text-3xl font-bold mt-1">{org._count.projects}</p>
        </div>
      </div>

      <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm flex items-start gap-4">
        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Users className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">Team Members</p>
          <p className="text-3xl font-bold mt-1">{org._count.users}</p>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 shadow-sm flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-primary font-medium">Team Invite Code</p>
          <p className="text-2xl font-mono font-bold mt-1 tracking-widest">{org.inviteCode}</p>
          <p className="text-xs text-muted-foreground mt-1">Share with your team</p>
        </div>
      </div>
    </div>
  )
}