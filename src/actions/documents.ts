'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function saveDocument({
  id,
  title,
  content,
  projectId,
  projectSlug
}: {
  id?: string 
  title: string
  content: string
  projectId: string
  projectSlug: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized. Please log in." }

    const currentUser = await prisma.user.findUnique({ where: { id: userId } })
    const isOrgAdmin = currentUser?.role === "admin"
    
    let document;

    if (id) {
      const existingDoc = await prisma.document.findUnique({
        where: { id },
        include: { project: true }
      })

      if (!existingDoc) return { error: "Document not found." }

      if (!isOrgAdmin && existingDoc.userId !== userId && existingDoc.project.adminId !== userId) {
        return { error: "You do not have permission to edit this document." }
      }

      document = await prisma.document.update({
        where: { id },
        data: { title, content }
      })
    } else {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true }
      })
      
      const isMember = project?.members.some(member => member.id === userId)
      
      if (!isOrgAdmin && !isMember && project?.adminId !== userId) {
        return { error: "You must be a member of this project to create a document." }
      }

      document = await prisma.document.create({
        data: {
          title: title || "Untitled Document",
          content,
          projectId,
          userId
        }
      })
    }

    revalidatePath(`/dashboard/projects/${projectSlug}`)
    return { success: true, documentId: document.id }
    
  } catch (error) {
    console.error("Error saving document:", error)
    return { error: "An unexpected error occurred while saving." }
  }
}

export async function deleteDocument({
  id,
  projectSlug
}: {
  id: string
  projectSlug: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized. Please log in." }

    const currentUser = await prisma.user.findUnique({ where: { id: userId } })
    const isOrgAdmin = currentUser?.role === "admin"

    const existingDoc = await prisma.document.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!existingDoc) return { error: "Document not found." }
    
    if (!isOrgAdmin && existingDoc.userId !== userId && existingDoc.project.adminId !== userId) {
      return { error: "You do not have permission to delete this document." }
    }

    await prisma.document.delete({
      where: { id }
    })

    revalidatePath(`/dashboard/projects/${projectSlug}`)
    return { success: true }
    
  } catch (error) {
    console.error("Error deleting document:", error)
    return { error: "An unexpected error occurred while deleting." }
  }
}

export async function createDocumentFromChat({
  projectId,
  content,
  projectSlug
}: {
  projectId: string
  content: string
  projectSlug: string
}) {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized. Please log in." }

    const cleanTitle = content
      .trim()
      .split("\n")[0]
      .replace(/[#*`]/g, "")
      .substring(0, 40) || "AI Exported Note"

    const newDoc = await prisma.document.create({
      data: {
        title: cleanTitle.endsWith("...") ? cleanTitle : `${cleanTitle}...`,
        content: content,
        projectId: projectId,
        userId: userId
      }
    })

    revalidatePath(`/dashboard/projects/${projectSlug}`)
    return { success: true, documentId: newDoc.id }
    
  } catch (error) {
    console.error("Error creating document from chat:", error)
    return { error: "Failed to generate document." }
  }
}