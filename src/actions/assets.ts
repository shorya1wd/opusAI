'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { UTApi } from "uploadthing/server"

// Initialize UploadThing's server-side API
const utapi = new UTApi()

export async function deleteAsset(assetId: string, projectSlug: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const currentUser = await prisma.user.findUnique({ where: { id: userId } })
  const isOrgAdmin = currentUser?.role === "admin"

  // 1. Find the asset and verify ownership
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: { project: true }
  })

  if (!asset) throw new Error("Asset not found")

  // 2. SECURITY CHECK: Only Uploader or Project Admin can delete
  if (!isOrgAdmin && asset.userId !== userId && asset.project.adminId !== userId) {
    throw new Error("You do not have permission to delete this file.")
  }

  // 3. Delete the file physically from UploadThing's servers
  await utapi.deleteFiles(asset.publicId) 

  // 4. Delete the record from your PostgreSQL database
  await prisma.asset.delete({
    where: { id: assetId }
  })

  // 5. Refresh the page to remove it from the UI
  revalidatePath(`/dashboard/projects/${projectSlug}`)
  return { success: true }
}