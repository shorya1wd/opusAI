'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { UTApi } from "uploadthing/server"


const utapi = new UTApi()

export async function deleteAsset(assetId: string, projectSlug: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const currentUser = await prisma.user.findUnique({ where: { id: userId } })
  const isOrgAdmin = currentUser?.role === "admin"

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { project: true }
  })

  if (!asset) throw new Error("Asset not found")

  if (!isOrgAdmin && asset.userId !== userId && asset.project.adminId !== userId) {
    throw new Error("You do not have permission to delete this file.")
  }

  await utapi.deleteFiles(asset.publicId) 

  await prisma.asset.delete({
    where: { id: assetId }
  })

  revalidatePath(`/dashboard/projects/${projectSlug}`)
  return { success: true }
}