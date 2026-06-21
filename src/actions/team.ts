'use server'

import prisma from "@/lib/prisma"
import { auth ,clerkClient} from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function kickMemberAction(targetUserId:string){
    try {
        const { userId: requestingUserId } = await auth()
        if (!requestingUserId) return { error: "Unauthorized" }

        const requestingUser=await prisma.user.findUnique({
            where: { id: requestingUserId }
        })
        if (!requestingUser) return { error: "User not found" }

        if(requestingUser.role !== "admin") return { error: "Unauthorized" }

        if(requestingUser.id === targetUserId) return { error: "You cannot kick yourself" }

        await prisma.user.update({
            where: { id: targetUserId },
            data: { organizationId: null ,role:"member"}
        })

        const client=await clerkClient()
        await client.users.updateUserMetadata(targetUserId, {
            publicMetadata: {
                role: "member"
            }
        })

        revalidatePath("/dashboard/team")
        return { success: true }
        
        
    } catch (error) {
        console.error("Error kicking member:", error)
        return { error: "Failed to kick member" }
    }
}


export async function updateRoleAction(targetUserId: string, newRole: "admin" | "member") {
    try {
        const { userId: requestingUserId } = await auth()
        if (!requestingUserId) return { error: "Unauthorized" }

        const requestingUser = await prisma.user.findUnique({
            where: { id: requestingUserId }
        })
        
        if (!requestingUser) return { error: "User not found" }
        if (requestingUser.role !== "admin") return { error: "Only admins can change roles" }
        
        if (requestingUser.id === targetUserId) {
            return { error: "You cannot change your own role" }
        }

        await prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole }
        })

        const client = await clerkClient()
        await client.users.updateUserMetadata(targetUserId, {
            publicMetadata: {
                role: newRole
            }
        })

        revalidatePath("/dashboard/team")
        return { success: true }
        
    } catch (error) {
        console.error("Error updating role:", error)
        return { error: "Failed to update role" }
    }
}