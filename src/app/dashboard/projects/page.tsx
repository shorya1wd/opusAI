import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import CreateProjectModal from "./CreateProjectModal"
import { FolderKanban} from "lucide-react"
import ProjectCard from "./ProjectCard"

export default async function ProjectsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true ,role:true}
  })

  if (!user?.organizationId) redirect("/onboarding")

  const projects = await prisma.project.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your team&apos;s active projects.
          </p>
        </div>
        
        <CreateProjectModal />
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first project.</p>
          <CreateProjectModal />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} currentUserId={userId} currentUserRole={user.role} />
          ))}
        </div>
      )}
    </div>
  )
}