'use server'

import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function syncUserNameToDatabase(firstName: string, lastName: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
  
  console.log(`🚀 Attempting to sync name for ${userId} to: ${fullName}`)

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name: fullName !== "" ? fullName : "Unknown User" }
  })

  console.log(`✅ Prisma update successful! New name in DB: ${updatedUser.name}`)

  revalidatePath('/dashboard', 'layout')
  
  return { success: true }
}