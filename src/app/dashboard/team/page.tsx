import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import TeamList from "./Teamlist"

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true }
  })

  if (!currentUser?.organizationId) redirect("/onboarding")

  const teamMembers = await prisma.user.findMany({
    where: { organizationId: currentUser.organizationId },
    orderBy: { role: 'asc' } 
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground mt-2">
          View your team members and manage their access to the workspace.
        </p>
      </div>

      <TeamList 
        members={teamMembers} 
        currentUserId={userId} 
        currentUserRole={currentUser.role} 
      />
    </div>
  )
}