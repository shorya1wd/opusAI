import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";


export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }


  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true }
  })

  if (user?.organizationId) {
    redirect("/dashboard")
  }


  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}