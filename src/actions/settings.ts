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

    // 1. Update the database
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: { name: newName.trim() }
    })

    // 2. Refresh the page data
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard') // Also refreshes the sidebar!
    
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
      // 💥 ADMIN ACTION: Destroy the entire organization
      await prisma.organization.delete({
        where: { id: user.organizationId }
      })
      
      // Strip Admin role from Clerk token
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: null }
      })
    } else {
      // 🚶 MEMBER ACTION: Just leave the organization
      await prisma.user.update({
        where: { id: userId },
        data: { 
          organizationId: null,
          role: 'member' // Keep as member, but unassigned
        }
      })
      
      // Strip Member role from Clerk token
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