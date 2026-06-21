'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function sendTeamMessage({
  projectId,
  content,
  projectSlug
}: {
  projectId: string
  content: string
  projectSlug: string
}) {
  // 1. Verify the user is actually logged in
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  // 2. Don't save empty messages
  if (!content.trim()) return { success: false }

  // 3. Save it to the database explicitly as a "team" message
  await prisma.message.create({
    data: {
      content,
      projectId,
      userId,
      type: "team", // 👈 This keeps it safely away from the AI chat!
      role: "user"
    }
  })

  // 4. Tell Next.js to instantly refresh the project page so the new message appears
  revalidatePath(`/dashboard/projects/${projectSlug}`)
  return { success: true }
}