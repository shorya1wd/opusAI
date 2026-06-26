import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CustomUserButton from "@/components/ui/CustomUserButton";
import { ThemeToggle } from "@/components/theme-toggle";


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
    <main className="flex-1 flex flex-col min-w-0">
            
            <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-white dark:bg-neutral-900 shrink-0">
                <ThemeToggle />
                            
              
              <div className="flex items-center gap-3 md:hidden"> 
                <span className="font-bold text-lg tracking-tight">Opus AI</span>
              </div>
    
              <div className="flex items-center gap-4">
                <CustomUserButton />
              </div>
            </header>
            
            <div className="min-h-screen bg-background">
      {children}
    </div>
          </main>
    
  )
}