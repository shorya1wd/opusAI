import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: {
      include: {
        _count: {
          select: {
            users: true,
            projects:true
          }
        }
      }
    } }
  })

  if (!user?.organization) {
    redirect("/onboarding")
  }

  const org = user.organization

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to {org.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here is what&apos;s happening in your workspace today.
        </p>
      </div>
      
      {/* Dashboard Statistic Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold tracking-tight text-muted-foreground">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">{org._count.projects}</p>
        </div>

        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold tracking-tight text-muted-foreground">Team Members</h3>
          <p className="text-3xl font-bold mt-2">{org._count.users}</p>
        </div>

        {/* 🚀 THE INVITE CODE CARD */}
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
          <h3 className="font-semibold tracking-tight text-primary">Team Invite Code</h3>
          <p className="text-3xl font-mono font-bold mt-2 tracking-widest">{org.inviteCode}</p>
          <p className="text-xs text-muted-foreground mt-2">Share this code with your team</p>
        </div>
      </div>
    </div>
  )
}