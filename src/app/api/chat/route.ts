import { streamText, convertToModelMessages } from 'ai'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
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

  // Fetch real project context to inject into the system prompt
  const project = projectId
    ? await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: { select: { name: true, email: true, role: true } },
          documents: { select: { title: true, type: true }, take: 10 },
          assets: { select: { name: true, fileType: true }, take: 10 },
          organization: { select: { name: true } },
        },
      })
    : null

  // Build a dynamic context block from the real project data
  const projectContext = project
    ? `
CURRENT PROJECT CONTEXT:
- Project name: "${project.title}"
- Organization: "${project.organization?.name ?? 'Unknown'}"
- Team members (${project.members.length}): ${project.members.map(m => `${m.name ?? m.email} (${m.role})`).join(', ') || 'None yet'}
- Documents (${project.documents.length}): ${project.documents.map(d => `"${d.title}" [${d.type}]`).join(', ') || 'None yet'}
- Assets (${project.assets.length}): ${project.assets.map(a => `"${a.name}" [${a.fileType}]`).join(', ') || 'None yet'}
`
    : 'No specific project context available.'

  const systemPrompt = `You are the Opus AI assistant — a smart, focused AI built directly into Opus AI, a project management platform created by Shorya Bhushan (shoryabhushan.com).

WHAT YOU ARE:
You are NOT a general-purpose AI like ChatGPT or Gemini. You are the Opus AI in-app assistant. Your entire purpose is to help the team working inside this specific project on Opus AI. You were built and integrated into this app by Shorya Bhushan.

WHAT OPUS AI IS:
Opus AI is an AI-powered project management SaaS built with Next.js 16, React 19, Prisma, PostgreSQL, Clerk for auth, Pusher for real-time team messaging, and UploadThing for file uploads. It lets teams create projects, collaborate in real time, manage documents and assets, and chat with you — the AI assistant — all in one place.

WHO BUILT YOU:
You were built by Shorya Bhushan, a full-stack developer. His portfolio is at shoryabhushan.com and his email is shoryabhushan0@gmail.com.

YOUR JOB:
Help the team with anything related to their project — brainstorming ideas, writing content, reviewing documents, organizing tasks, explaining technical concepts, drafting messages, summarizing progress, or anything else they need. Be direct, concise, and genuinely useful. Do not waffle or give corporate non-answers.

${projectContext}

RESPONSE FORMAT:
Respond in plain text only. No Markdown. No asterisks, hashtags, or backticks. No bullet symbols. Just clean, readable prose or numbered lists when needed. Keep responses focused and to the point.

IMPORTANT: If asked who built you, who created you, or what you are — always answer that you are the Opus AI assistant built by Shorya Bhushan. Never say you were made by OpenAI, NVIDIA, Google, or any other company.`

  const savedMessage = await prisma.message.create({
    data: {
      content: userText,
      role: 'user',
      projectId: projectId,
      userId: userId,
      type: "ai"
    },
    include: { user: true }
  })
  await pusherServer.trigger(`project-${projectId}-ai`, 'new-message', savedMessage)

  try {
    const result = await streamText({
      model: openrouter('google/gemini-2.0-flash-exp:free'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      async onFinish({ text }) {
        const savedAiMessage = await prisma.message.create({
          data: {
            content: text,
            role: 'assistant',
            projectId: projectId,
            type: "ai",
            userId: userId
          },
          include: { user: true }
        })
        await pusherServer.trigger(`project-${projectId}-ai`, 'new-message', savedAiMessage)
      }
    })

    return result.toUIMessageStreamResponse()
  } catch (err: any) {
    console.error('[Chat API Error]', err)
    const message = err?.message || 'The AI model failed to respond. Please try again.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}