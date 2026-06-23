'use server'

import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'

export async function createWorkspaceAction(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized" }

    const workspaceName = formData.get('workspaceName') as string
    if (!workspaceName) return { error: "Workspace name is required" }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!existingUser) {
      console.log("Webhook delayed! Safely upserting user as fallback...")
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      
      // Upsert fixes the race condition. If the webhook beats us to it, it just updates nothing.
      await prisma.user.upsert({
        where: { id: userId },
        update: {}, 
        create: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || `test-${userId}@example.com`,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
        }
      })
    }

    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const generatedInviteCode = randomBytes(4).toString('hex') 

    const organization = await prisma.organization.create({
      data: {
        name: workspaceName,
        slug: slug,
        ownerId: userId,
        inviteCode: generatedInviteCode,
      }
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: organization.id,
        role: 'admin'
      }
    })

    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin'
      }
    })

    return { success: true }
    
  } catch (error: any) {
    console.error("Failed to create workspace:", error)
    
    // We only want to show the "name taken" error if the constraint failed explicitly on the SLUG
    if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
      return { error: "That workspace name is already taken. Try another." }
    }
    
    return { error: "An unexpected error occurred while creating your workspace." }
  }
}

export async function joinWorkspaceAction(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized" }

    const inviteCode = formData.get('inviteCode') as string
    if (!inviteCode) return { error: "Invite code is required" }

    const organization = await prisma.organization.findUnique({
      where: { inviteCode: inviteCode }
    })

    if (!organization) {
      return { error: "Invalid invite code. Please check and try again." }
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!existingUser) {
      console.log("Webhook delayed! Safely upserting member user...")
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || `test-${userId}@example.com`,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
        }
      })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: organization.id,
        role: 'member'
      }
    })

    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'member' }
    })

    return { success: true }
    
  } catch (error: unknown) {
    console.error("Failed to join workspace:", error)
    return { error: "An unexpected error occurred while joining the workspace." }
  }
}