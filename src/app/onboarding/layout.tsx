import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";


export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  // 1. Fetch the user and their connected organization
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true }
  })

  // 2. If the user has an organization, redirect to dashboard
  if (user?.organizationId) {
    redirect("/dashboard")
  }

  // 3. If the user doesn't have an organization, show the onboarding page
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}