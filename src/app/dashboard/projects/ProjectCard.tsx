'use client'

import { useState } from "react"
import { updateProjectAction, deleteProjectAction } from "@/actions/projects"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MoreVertical, Clock, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type ProjectCardProps = {
  project: {
    id: string
    title: string
    slug:string
    createdAt: Date
    adminId: string
  }
  currentUserId: string
  currentUserRole: string
}

export default function ProjectCard({ project, currentUserId, currentUserRole }: ProjectCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  

  const isOwnerOrAdmin = project.adminId === currentUserId || currentUserRole === "admin"

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateProjectAction(project.id, formData)
    
    if (result.error) toast.error(result.error)
    else setIsEditDialogOpen(false)
    setIsSubmitting(false)
  }

  async function handleDelete() {
    setIsSubmitting(true)
    const result = await deleteProjectAction(project.id)
    if (result.error) toast.error(result.error)
    setIsSubmitting(false)
    setIsDeleteDialogOpen(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow relative group">
        <CardHeader className="pb-3 pr-12">
          <Link href={`/dashboard/projects/${project.slug}`} className="hover:underline">
            <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
          </Link>
          <CardDescription>Workspace Project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </CardContent>

        {/* ⚙️ Only show the menu if the current user created this project */}
        {isOwnerOrAdmin && (
          <div className="absolute top-4 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </Card>

      {/* ✏️ EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" name="title" defaultValue={project.title} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🗑️ DELETE ALERT */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {project.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project, along with all associated messages, assets, and documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}