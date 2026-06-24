'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { pusherServer } from "@/lib/pusher-server" 

export async function sendTeamMessage({
  projectId,
  content,
  projectSlug
}: {
  projectId: string
  content: string
  projectSlug: string
}) {

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  if (!content.trim()) return { success: false }

  const savedMessage=await prisma.message.create({
    data: {
      content,
      projectId,
      userId,
      type: "team",
      role: "user"
    },
    include: { user: true }
  })

  await pusherServer.trigger(`project-${projectId}`, 'new-message', savedMessage)

  revalidatePath(`/dashboard/projects/${projectSlug}`)
  return { success: true }
}