'use server'

import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createProjectAction(formData:FormData){
    try {

        const {userId}=await auth()

        if(!userId){
            return{error:"Unauthorized"}
        }

        const name=formData.get("name") as string

        if(!name || name.trim()===""){
            return{error:"Name is required"}
        }

        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
        const user=await prisma.user.findUnique({where:{id:userId}})

        if(!user){
            return{error:"User not found"}
        }

        await prisma.project.create({
            data:{
                title:name.trim(),
                slug:uniqueSlug,
                organizationId:user.organizationId!,
                adminId:userId,
                members: {
                  connect: [{ id: userId }] 
                }
            }
        })

        revalidatePath("/dashboard/projects")
        revalidatePath("/dashboard")
        
    } catch (error) {
        console.error("Error creating project:", error)
        return{error:"Failed to create project"}
    }
}


export async function deleteProjectAction(projectId:string){
    try {

        const {userId}=await auth()

        if(!userId){
            return{error:"Unauthorized"}
        }

        const currentUser = await prisma.user.findUnique({ where: { id: userId } })
        const isOrgAdmin = currentUser?.role === "admin"

        const project=await prisma.project.findUnique({where:{id:projectId}})

        if(project?.adminId!==userId && !isOrgAdmin){
            return{error:"Unauthorized"}
        }

        await prisma.project.delete({where:{id:projectId}})


        revalidatePath("/dashboard/projects")
        revalidatePath("/dashboard")
        return {success:true}
    } catch (error) {
        console.error("Error deleting project:", error)
        return{error:"Failed to delete project"}
    }
}

export async function updateProjectAction(projectId:string,formData:FormData){

   try {

     const { userId } = await auth()
     if (!userId) return { error: "Unauthorized" }

     const title=formData.get('title') as string
     if (!title || title.trim() === '') return { error: "Title is required." }

     const currentUser = await prisma.user.findUnique({ where: { id: userId } })
     const isOrgAdmin = currentUser?.role === "admin"

     const project = await prisma.project.findUnique({ where: { id: projectId } })
     if (project?.adminId !== userId && !isOrgAdmin) {
        return { error: "Only the project admin can edit this project." }
     }

     await prisma.project.update({
        where:{id:projectId},
        data:{title:title.trim()}
     })
     revalidatePath('/dashboard/projects')
     return { success: true }
  } catch (error) {
    console.error("Failed to update project:", error)
    return { error: "An error occurred while updating." }
  }
}


export async function toggleProjectMemberAction(
  projectId: string, 
  targetUserId: string, 
  action: 'add' | 'remove',
  slug: string
) {
  try {
    const { userId } = await auth()
    if (!userId) return { error: "Unauthorized" }

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (project?.adminId !== userId) {
      return { error: "Only the project admin can manage team access." }
    }

    if (action === 'remove' && targetUserId === userId) {
      return { error: "You cannot remove yourself from your own project." }
    }

    if (action === 'add') {
      await prisma.project.update({
        where: { id: projectId },
        data: { members: { connect: { id: targetUserId } } }
      })
    } else {
      await prisma.project.update({
        where: { id: projectId },
        data: { members: { disconnect: { id: targetUserId } } }
      })
    }

    revalidatePath(`/dashboard/projects/${slug}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to manage project team:", error)
    return { error: "An error occurred while updating the team." }
  }
}