import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Paperclip, Users, Bot, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ManageTeamModal from "./ManageTeamModal"
import ChatCanvas from "./ChatCanvas"
import { UIMessage } from "ai"
import DocumentEditor from "./DocumentEditor"
import AssetDropzone from "./AssetDropzone"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TeamChat from "./TeamChat" 
import { Lock } from "lucide-react"
import DeleteAssetButton from "./DeleteAssetButton"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ docId?: string; action?: string }>
}

export default async function ProjectWorkspacePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true }
  })

  if (!user?.organizationId) redirect("/onboarding")

    const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, role: true } 
  })

  if (!currentUser?.organizationId) redirect("/onboarding")

  const project = await prisma.project.findFirst({
    where: { 
      slug: slug,
      organizationId: user.organizationId,
      OR: [
        { members: { some: { id: userId } } },
        { adminId: userId },
        { ...(currentUser.role === 'admin' ? {} : { id: 'impossible-id' }) } 
      ]
    },
    include: {
      members: true, 
      messages: { orderBy: { createdAt: 'asc' }, include: { user: true } }, 
      documents: { orderBy: { createdAt: 'desc' } }, 
      assets: { orderBy: { createdAt: 'desc' } }, 
      _count: { select: { assets: true, messages: true, documents: true } }
    }
  })

  if (!project) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
      <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <Lock className="h-7 w-7 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Access restricted</h2>
        <p className="text-muted-foreground text-sm mt-1">Access limited to project members only.</p>
      </div>
      <Button asChild><Link href="/dashboard/projects">Back to Projects</Link></Button>
    </div>
  )
}

  const searchParamsResolved = await searchParams
  const docId = searchParamsResolved.docId
  const action = searchParamsResolved.action

  const activeDocument = docId 
    ? await prisma.document.findUnique({ where: { id: docId } })
    : null

  const aiMessages = project.messages.filter(m => m.type === 'ai' || m.role === 'assistant')
  const teamMessages = project.messages.filter(m => m.type === 'team' && m.role !== 'assistant')

  const formattedAiMessages: UIMessage[] = aiMessages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    parts: [{ type: 'text', text: msg.content }], 
  }))

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true, email: true, name: true }
  })
  
  const assignedUserIds = project.members.map(m => m.id)

  const hasAdminPowers = project.adminId === userId || currentUser.role === "admin"

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-8rem)]">

      <div className="flex items-center justify-between pb-4 border-b mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-3 w-3" /> {project.members.length} Members Assigned
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ManageTeamModal 
            projectId={project.id}
            slug={project.slug}
            orgUsers={orgUsers}
            assignedUserIds={assignedUserIds}
            isAdmin={hasAdminPowers}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0 pb-10 lg:pb-0">
        
        <div className="lg:col-span-3 flex flex-col overflow-hidden h-[600px] lg:h-[calc(100vh-12rem)]">
          <Tabs defaultValue="ai" className="flex-1 flex flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-2 z-10 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" /> 
                    Workspace Interface
                  </CardTitle>
                  
                  {!activeDocument && action !== 'create' && (
                    <TabsList className="h-8 bg-slate-200/50 dark:bg-slate-800/50">
                      <TabsTrigger value="ai" className="text-xs flex items-center gap-1.5"><Bot className="h-3.5 w-3.5"/> AI Chat</TabsTrigger>
                      <TabsTrigger value="team" className="text-xs flex items-center gap-1.5"><Users className="h-3.5 w-3.5"/> Team</TabsTrigger>
                    </TabsList>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 relative overflow-hidden"> 
                {activeDocument || action === 'create' ? (
                  <DocumentEditor 
                    initialDoc={activeDocument} 
                    projectId={project.id} 
                    slug={project.slug} 
                    currentUserId={userId}      
                    adminId={project.adminId}
                    currentUserRole={currentUser.role}
                  />
                ) : (
                  <>
                    <TabsContent value="ai" className="m-0 h-full data-[state=inactive]:hidden border-none outline-none">
                      <ChatCanvas 
                        projectId={project.id} 
                        projectSlug={project.slug}
                        initialMessages={formattedAiMessages} 
                      />
                    </TabsContent>
                    <TabsContent value="team" className="m-0 h-full data-[state=inactive]:hidden border-none outline-none">
                      <TeamChat 
                        projectId={project.id}
                        projectSlug={project.slug}
                        messages={teamMessages}
                        currentUserId={userId}
                      />
                    </TabsContent>
                  </>
                )}
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div className="space-y-6 lg:overflow-y-auto lg:h-[calc(100vh-12rem)] lg:pr-2 pb-10">  
          <Card className="shadow-sm">
            <Accordion type="single" collapsible defaultValue="assets" className="w-full">
              <AccordionItem value="assets" className="border-none">
                <CardHeader className="py-4 border-b">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <CardTitle className="text-sm font-medium flex items-center justify-between w-full pr-4">
                      <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Assets</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-muted-foreground">
                        {project._count.assets}
                      </span>
                    </CardTitle>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent>
                  <CardContent className="p-4 space-y-4">
                    <AssetDropzone slug={project.slug} />

                    {project.assets && project.assets.length > 0 && (
                      <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-1">
                        {project.assets.map((asset) => {
                          const canDelete = asset.userId === userId || hasAdminPowers

                          return (
                            <div key={asset.id} className="group relative flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                              
                              <a 
                                href={asset.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 overflow-hidden flex-1"
                              >
                                <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm truncate font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                                  {asset.name}
                                </span>
                              </a>

                              {canDelete && (
                                <DeleteAssetButton assetId={asset.id} projectSlug={project.slug} />
                              )}
                              
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <Accordion type="single" collapsible defaultValue="documents" className="w-full">
              <AccordionItem value="documents" className="border-none">
                <CardHeader className="py-4 border-b bg-slate-50 dark:bg-slate-900 rounded-t-lg">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Documents
                      </CardTitle>
                      <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800">
                        {project.documents.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent>
                  <CardContent className="p-4">
                    {project.documents.length === 0 ? (
                      <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                        No documents yet
                      </div>
                    ) : (
                      <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-1">
                        {project.documents.map((doc) => (
                          <Link 
                            href={`/dashboard/projects/${slug}?docId=${doc.id}`}
                            key={doc.id} 
                            className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary">
                                {doc.title}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" className="w-full text-sm mt-2 border-dashed" asChild>
                      <Link href={`/dashboard/projects/${slug}?action=create`}>
                        + Create Document
                      </Link>
                    </Button>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

        </div>
      </div>
    </div>
  )
}