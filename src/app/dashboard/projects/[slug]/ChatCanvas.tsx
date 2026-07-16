'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { Button } from "@/components/ui/button"
import { Bot, User, Send, Loader2, Sparkles, AlertCircle, FilePlus, Check, FileText, Users, Trash2, PenLine, Eye } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createDocumentFromChat } from "@/actions/documents"
import { useRouter } from "next/navigation"
import ReactMarkdown from 'react-markdown'

export default function ChatCanvas({ 
  projectId,
  projectSlug,
  initialMessages
}: { 
  projectId: string
  projectSlug: string
  initialMessages: UIMessage[]
}) {
  const router = useRouter()

  // Simple lock: true from the moment user sends until AI fully finishes (onFinish/onError).
  // This is more reliable than checking status/messages because multi-step tool calls
  // briefly add intermediate assistant messages that would wrongly unlock the input.
  const [isLocked, setIsLocked] = useState(false)

  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      prepareSendMessagesRequest: ({ messages }) => {
        return {
          body: { messages, projectId, projectSlug } 
        }
      }
    }),
    onFinish: () => {
      setIsLocked(false)
      router.refresh()
    },
    onError: () => {
      setIsLocked(false)
    }
  })

  const [input, setInput] = useState('')
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [exportedId, setExportedId] = useState<string | null>(null)

  // isLoading: show spinner on send button while streaming
  const isLoading = isLocked || status === 'submitted' || status === 'streaming'

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const submit = () => {
    const text = input.trim()
    if (!text || isLocked) return
    setIsLocked(true)   // Lock immediately — unlocks in onFinish or onError
    sendMessage({ text })
    setInput('')
  }

  const handleExport = async (messageId: string, content: string) => {
    try {
      setExportingId(messageId)
      await createDocumentFromChat({ projectId, content, projectSlug })
      setExportedId(messageId)
      setTimeout(() => setExportedId(null), 2000) 
    } catch (err) {
      console.error("Failed to export document", err)
    } finally {
      setExportingId(null)
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const getMessageText = (message: UIMessage) =>
    message.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part as any).text as string)
      .join('')

  // Returns tool invocation parts from a message
  const getToolInvocations = (message: UIMessage) =>
    message.parts.filter((part) => part.type === 'tool-invocation') as any[]

  // Human-readable tool labels and icons
  const toolMeta: Record<string, { label: string; icon: React.ReactNode }> = {
    create_document: { label: 'Creating document', icon: <FileText className="h-3.5 w-3.5" /> },
    edit_document:   { label: 'Editing document',  icon: <PenLine  className="h-3.5 w-3.5" /> },
    delete_document: { label: 'Deleting document', icon: <Trash2   className="h-3.5 w-3.5" /> },
    read_asset:      { label: 'Reading file',      icon: <Eye      className="h-3.5 w-3.5" /> },
    add_member:      { label: 'Adding member',     icon: <Users    className="h-3.5 w-3.5" /> },
    remove_member:   { label: 'Removing member',   icon: <Users    className="h-3.5 w-3.5" /> },
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50/50 dark:bg-neutral-900/30">

      {/* 💬 CHAT HISTORY AREA */}
      <ScrollArea className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="space-y-6 pb-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground animate-in fade-in zoom-in duration-500">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Project AI Assistant</h3>
              <p className="max-w-md text-center text-sm">
                Ask me to create documents, read files, manage team members, or anything else for this project.
              </p>
            </div>
          ) : (
            messages.map((message: UIMessage, index: number) => {
              const text = getMessageText(message)
              const toolInvocations = getToolInvocations(message)
              const isLastMessage = index === messages.length - 1
              
              // Hide assistant messages that have zero content (shouldn't happen, but safety net)
              if (message.role === 'assistant' && !text.trim() && toolInvocations.length === 0) return null

              return (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* AI Avatar */}
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div className="relative max-w-[85%] group flex flex-col gap-2">

                    {/* Tool activity pills — shown for each tool call in this message */}
                    {toolInvocations.map((inv: any, i: number) => {
                      const meta = toolMeta[inv.toolName] ?? { label: inv.toolName, icon: <Sparkles className="h-3.5 w-3.5" /> }
                      const isDone = inv.state === 'result'
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-muted-foreground bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 w-fit"
                        >
                          {isDone
                            ? <Check className="h-3.5 w-3.5 text-green-500" />
                            : <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          }
                          {meta.icon}
                          <span>{meta.label}{isDone ? ' — done' : '...'}</span>
                        </div>
                      )
                    })}

                    {/* Text bubble — only shown if there is text */}
                    {text.trim() && (
                      <div className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-tl-sm text-foreground'
                      }`}>
                        <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word whitespace-pre-wrap leading-relaxed pr-6">
                          <ReactMarkdown>
                            {text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Export button — only for assistant text messages */}
                    {message.role === 'assistant' && text.trim() && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground"
                          onClick={() => handleExport(message.id, text)}
                          disabled={exportingId === message.id}
                          title="Convert to workspace document"
                        >
                          {exportedId === message.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : exportingId === message.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FilePlus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </div>
                  )}
                </div>
              )
            })
          )}

          {/* Typing indicator — shown while waiting for first tokens from AI */}
          {isLocked && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl px-5 py-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-tl-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-4 rounded-lg text-sm mt-4">
              <AlertCircle className="h-4 w-4" />
              <p>{error.message || "Failed to connect to the AI model. Please try again."}</p>
            </div>
          )}

          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* ✍️ INPUT AREA */}
      <div className="p-4 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md border-t">
        <form
          onSubmit={handleFormSubmit}
          className="relative max-w-4xl mx-auto flex items-end gap-2 bg-white dark:bg-neutral-950 border shadow-sm rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 transition-all"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI anything... (Press Enter to send, Shift+Enter for new line)"
            className="w-full max-h-32 min-h-[56px] resize-none bg-transparent p-4 outline-none text-sm disabled:opacity-50"
            disabled={isLoading}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`
            }}
          />
          <div className="p-2 shrink-0">
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 rounded-lg transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
            </Button>
          </div>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          AI can make mistakes. Consider verifying important information.
        </p>
      </div>
    </div>
  )
}
