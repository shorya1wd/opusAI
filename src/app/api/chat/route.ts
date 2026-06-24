 
import { streamText, convertToModelMessages } from 'ai'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { pusherServer } from '@/lib/pusher-server'

export const maxDuration = 30

const openrouter = createOpenRouter({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { messages, projectId } = await req.json()

  const latestUserMessage = messages[messages.length - 1]
  
  const userText = latestUserMessage.parts.find((part: any) => part.type === 'text')?.text || ""

  const savedMessages=await prisma.message.create({
    data: {
      content: userText,
      role: 'user',
      projectId: projectId,
      userId: userId,
      type:"ai"
    },
    include: { user: true }
  })
  await pusherServer.trigger(`project-${projectId}-ai`, 'new-message', savedMessages)

  const result = await streamText({
    model: openrouter('openrouter/free'), 
    system: "You are a helpful project management AI assistant. You help teams brainstorm, write code, and organize assets.",
    messages:await convertToModelMessages(messages),
    async onFinish({ text }) {
      const savedAiMessage=await prisma.message.create({
        data: {
          content: text,
          role: 'assistant',
          projectId: projectId,
          type: "ai"
        },
        include: { user: true }
      })
      await pusherServer.trigger(`project-${projectId}-ai`, 'new-message', savedAiMessage)
    }
  })

  return result.toUIMessageStreamResponse()
}