'use server'

import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'

export async function createWorkspaceAction(formData: FormData) {
  try {
    // 1. Verify the user is securely logged in
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized" }

    // 2. Extract the data from the form
    const workspaceName = formData.get('workspaceName') as string
    if (!workspaceName) return { error: "Workspace name is required" }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!existingUser) {
      console.log("Webhook delayed! Manually creating user as fallback...")
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      
      await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
        }
      })
    }

    // Generate a clean URL slug (e.g., "Nexus Studios" -> "nexus-studios")
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const generatedInviteCode = randomBytes(4).toString('hex') // Generates something like "a1b2c3d4"

    // 3. Create the Organization in Prisma
    const organization = await prisma.organization.create({
      data: {
        name: workspaceName,
        slug: slug,
        ownerId: userId,
        inviteCode: generatedInviteCode,
      }
    })

    // 4. Link the User to this new Organization and upgrade them to Admin
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: organization.id,
        role: 'admin'
      }
    })

    // 5. Tell Clerk to bake this new "admin" role into their session cookie!
    // This is what makes your middleware routing work instantly.
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin'
      }
    })

    return { success: true }
    
  } catch (error: unknown) {
    console.error("Failed to create workspace:", error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
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

    // 1. Find the workspace using the invite code
    const organization = await prisma.organization.findUnique({
      where: { inviteCode: inviteCode }
    })

    if (!organization) {
      return { error: "Invalid invite code. Please check and try again." }
    }

    // 🛡️ SAFETY NET: In case the webhook lagged for this new user too!
    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!existingUser) {
      console.log("Webhook delayed! Manually creating member user...")
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      
      await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
        }
      })
    }

    // 2. Link the User to the Organization and set role to 'member'
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: organization.id,
        role: 'member' // 👈 Notice this is 'member', not 'admin'!
      }
    })

    // 3. Update Clerk Session Token so middleware knows they are a member
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
