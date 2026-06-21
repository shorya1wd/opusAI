 
import { streamText, convertToModelMessages } from 'ai'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const maxDuration = 30

const openrouter = createOpenRouter({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  // projectId comes through the v5 prepareSendMessagesRequest
  const { messages, projectId } = await req.json()

  // 1. Save the USER'S message to the database immediately
  const latestUserMessage = messages[messages.length - 1]
  
  // v5 arrays store the text inside 'parts'
  const userText = latestUserMessage.parts.find((part: any) => part.type === 'text')?.text || ""

  await prisma.message.create({
    data: {
      content: userText,
      role: 'user',
      projectId: projectId,
      userId: userId,
      type:"ai"
    }
  })

  const result = await streamText({
    model: openrouter('openrouter/free'), 
    system: "You are a helpful project management AI assistant. You help teams brainstorm, write code, and organize assets.",
    messages:await convertToModelMessages(messages),
    // 2. Save the AI'S message to the database when it finishes streaming!
    async onFinish({ text }) {
      await prisma.message.create({
        data: {
          content: text,
          role: 'assistant',
          projectId: projectId,
          type: "ai"
        }
      })
    }
  })

  // 3. 🚨 v5 REQUIREMENT: Must use the new UI Message stream response!
  return result.toUIMessageStreamResponse()
}