import { streamText, convertToModelMessages } from 'ai'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createGroq } from '@ai-sdk/groq'
import { pusherServer } from '@/lib/pusher-server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

const openrouter = createOpenRouter({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const MODEL_CHAIN = [
  { model: () => groq('llama-3.3-70b-versatile'), label: 'groq/llama-3.3-70b' },
  { model: () => groq('llama-3.1-8b-instant'),    label: 'groq/llama-3.1-8b'  },
  { model: () => openrouter('google/gemma-4-31b-it:free'),             label: 'openrouter/gemma-4-31b:free' },
  { model: () => openrouter('openai/gpt-oss-20b:free'),                label: 'openrouter/gpt-oss-20b:free' },
  { model: () => openrouter('meta-llama/llama-3.3-70b-instruct:free'), label: 'openrouter/llama-3.3:free'   },
]

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { messages, projectId, projectSlug } = await req.json()

  const latestUserMessage = messages[messages.length - 1]
  const userText = latestUserMessage.parts.find((part: any) => part.type === 'text')?.text || ""

  // Fetch full project context
  const project = projectId
    ? await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: { select: { id: true, name: true, email: true, role: true } },
          documents: { select: { id: true, title: true, type: true }, take: 20 },
          assets: { select: { id: true, name: true, fileType: true }, take: 20 },
          organization: { select: { name: true } },
        },
      })
    : null

  const currentUser = await prisma.user.findUnique({ where: { id: userId } })

  const projectContext = project ? `
CURRENT PROJECT CONTEXT:
- Project name: "${project.title}"
- Organization: "${project.organization?.name ?? 'Unknown'}"
- Team members (${project.members.length}): ${project.members.map(m => `${m.name ?? m.email} (${m.role})`).join(', ') || 'None yet'}
- Documents (${project.documents.length}): ${project.documents.map(d => `"${d.title}"`).join(', ') || 'None yet'}
- Assets (${project.assets.length}): ${project.assets.map(a => `"${a.name}" (${a.fileType})`).join(', ') || 'None yet'}

CURRENT USER:
- Name: "${currentUser?.name ?? 'Unknown'}"
- Role: "${currentUser?.role ?? 'member'}"
` : 'No specific project context available.'

  const systemPrompt = `You are the Opus AI assistant — a helpful AI built into Opus AI, a project management platform created by Shorya Bhushan (shoryabhushan.com).

WHO BUILT YOU:
Shorya Bhushan, a full-stack developer. Portfolio: shoryabhushan.com.

${projectContext}

WHAT YOU CAN DO:
- Answer questions about the project, team members, documents, and assets shown above
- Help draft content, summarize, brainstorm, or advise on project decisions
- Provide information based on the project context you have been given

WHAT YOU CANNOT DO:
- You CANNOT create, edit, or delete documents
- You CANNOT add or remove team members
- You CANNOT read file contents
- Do NOT claim you have performed any action. Do NOT pretend to create or modify anything.
- If asked to take an action you cannot do, say clearly: "I'm not able to do that directly, but you can do it manually in the project."

RESPONSE FORMAT:
Plain text only. No Markdown asterisks, hashtags, or backticks. Keep responses concise and honest.`

  const savedMessage = await prisma.message.create({
    data: { content: userText, role: 'user', projectId, userId, type: "ai" },
    include: { user: true }
  })
  await pusherServer.trigger(`project-${projectId}-ai`, 'new-message', savedMessage)

  // Only keep text parts in history (strips any old tool-call parts)
  const sanitizedMessages = messages.map((msg: any) => {
    if (msg.role === 'assistant' && Array.isArray(msg.parts)) {
      const textParts = msg.parts.filter((p: any) => p.type === 'text')
      return { ...msg, parts: textParts.length > 0 ? textParts : msg.parts }
    }
    return msg
  })

  const convertedMessages = await convertToModelMessages(sanitizedMessages)

  for (const { model, label } of MODEL_CHAIN) {
    try {
      console.log(`[Chat] Trying: ${label}`)
      const result = await streamText({
        model: model(),
        system: systemPrompt,
        messages: convertedMessages,
        maxRetries: 0,
        async onFinish({ text }) {
          if (text) {
            const savedAiMessage = await prisma.message.create({
              data: { content: text, role: 'assistant', projectId, type: "ai", userId },
              include: { user: true }
            })
            await pusherServer.trigger(`project-${projectId}-ai`, 'new-message', savedAiMessage)
          }
        }
      })
      console.log(`[Chat] Success with: ${label}`)
      return result.toUIMessageStreamResponse({
        headers: {
          'X-Accel-Buffering': 'no',
          'Cache-Control': 'no-cache, no-transform',
        }
      })
    } catch (err: any) {
      const status = err?.statusCode ?? err?.lastError?.statusCode ?? err?.status
      if (status === 429 || status === 404 || status === 503) {
        console.warn(`[Chat] ${label} unavailable (${status}), trying next...`)
        continue
      }
      console.error(`[Chat] Non-retryable error from ${label}:`, err?.message)
      return new Response(
        JSON.stringify({ error: 'The AI failed to respond. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  console.error('[Chat] All providers exhausted.')
  return new Response(
    JSON.stringify({ error: 'All AI models are currently busy. Please try again in 30 seconds.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  )
}