"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2, User, Users } from "lucide-react"
import { sendTeamMessage } from "@/actions/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { pusherClient } from "@/lib/pusher-client"

type TeamMessage = {
  id: string
  content: string
  createdAt: Date
  userId: string | null
  user: { name: string | null; email: string } | null
}

function getInitials(name?: string | null, email?: string | null) {
  if (name && name !== 'Unknown User' && name !== 'New User') {
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  if (email) {
    return email.substring(0, 2).toUpperCase()
  }
  return "U"
}

export default function TeamChat({
  projectId,
  projectSlug,
  messages,
  currentUserId
}: {
  projectId: string
  projectSlug: string
  messages: TeamMessage[]
  currentUserId: string
}) {
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [chatMessages,setChatMessages]=useState(messages)

  useEffect(() => {
    setChatMessages(messages)
  }, [messages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  useEffect(() => {
    pusherClient.subscribe(`project-${projectId}`)

    pusherClient.bind('new-message', (incomingMessage: any) => {
      
      setChatMessages((currentMessages) => {
        if (currentMessages.some((msg) => msg.id === incomingMessage.id)) {
          return currentMessages;
        }
        return [...currentMessages, incomingMessage];
      })
    })

    return () => {
      pusherClient.unsubscribe(`project-${projectId}`)
    }
  }, [projectId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    setIsSending(true)
    const textToSend = content
    setContent("") 

    try {
      await sendTeamMessage({
        projectId,
        content: textToSend,
        projectSlug
      })
    } catch (error) {
      console.error("Failed to send:", error)
      setContent(textToSend) 
    } finally {
      setIsSending(false)
    }
  }
  

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30">
      <ScrollArea className="flex-1 overflow-y-auto p-4 pr-6">
        <div className="space-y-6 pb-6">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground animate-in fade-in zoom-in duration-500">
              <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Team Chat</h3>
              <p className="max-w-md text-center text-sm">
                This is the beginning of your team&apos;s conversation. Say hello!
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe = msg.userId === currentUserId
              return (
                <div key={msg.id} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 mt-1 shrink-0">
                    <AvatarImage src={(msg.user as unknown as { imageUrl?: string })?.imageUrl || ""} alt={msg.user?.name || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {getInitials(msg.user?.name, msg.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <span className="text-[10px] text-muted-foreground mb-1 px-1">
                      {isMe ? "You" : msg.user?.name || msg.user?.email || "Unknown Member"}
                    </span>
                    <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-tl-sm text-foreground'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-t">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-center gap-2 bg-white dark:bg-slate-950 border shadow-sm rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-blue-500/50 transition-all p-1.5">
          <Input 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Message the team..."
            className="border-none shadow-none focus-visible:ring-0 bg-transparent h-10"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!content.trim() || isSending}
            className="h-10 w-10 shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}