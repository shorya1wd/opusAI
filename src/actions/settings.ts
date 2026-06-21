'use server'

import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function updateWorkspaceNameAction(newName: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized" }

    if (!newName || newName.trim() === '') {
      return { error: "Workspace name cannot be empty." }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.role !== 'admin' || !user.organizationId) {
      return { error: "Only admins can rename the workspace." }
    }

  
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: { name: newName.trim() }
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard') 
    
    return { success: true }

  } catch (error) {
    console.error("Failed to update workspace name:", error)
    return { error: "An error occurred while updating the name." }
  }
}

export async function leaveOrDeleteWorkspaceAction() {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized" }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.organizationId) return { error: "No workspace found." }

    const client = await clerkClient()

    if (user.role === 'admin') {
      await prisma.organization.delete({
        where: { id: user.organizationId }
      })
      
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: null }
      })
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          organizationId: null,
          role: 'member' 
        }
      })
      
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: null }
      })
    }

    return { success: true }

  } catch (error) {
    console.error("Failed to leave/delete workspace:", error)
    return { error: "An unexpected error occurred." }
  }
}