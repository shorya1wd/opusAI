'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Download, Loader2, Trash2, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveDocument, deleteDocument } from "@/actions/documents"

export default function DocumentEditor({
  initialDoc,
  projectId,
  slug,
  currentUserId, // 👈 New prop
  adminId,        // 👈 New prop
  currentUserRole
}: {
  initialDoc: { id: string; title: string; content: string; userId: string | null } | null
  projectId: string
  slug: string
  currentUserId: string
  adminId: string
  currentUserRole: string
}) {
  const router = useRouter()
  const [title, setTitle] = useState(initialDoc?.title || "Untitled Document")
  const [content, setContent] = useState(initialDoc?.content || "")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 🔒 Calculate Permissions
  const isCreator = initialDoc?.userId === currentUserId
  const isAdmin = currentUserId === adminId
  const isOrgAdmin = currentUserRole === "admin" // 🚀 Add this check
  const isNewDoc = !initialDoc?.id
  
  // 🚀 Grant access if: They created it, they are Project Admin, or they are Org Admin
  const canEdit = isCreator || isAdmin || isOrgAdmin || isNewDoc

  useEffect(() => {
    setTitle(initialDoc?.title || "Untitled Document")
    setContent(initialDoc?.content || "")
  }, [initialDoc])

  const handleDownload = () => {
    // ... exactly the same as before ...
    const element = document.createElement("a")
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${title.replace(/\s+/g, '_').toLowerCase()}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSave = async () => {
    if (!canEdit) return // Double check on the frontend!
    setSaving(true)
    try {
      const res = await saveDocument({
        id: initialDoc?.id,
        title,
        content,
        projectId,
        projectSlug: slug
      })
      if (!initialDoc?.id && res.documentId) {
        router.push(`/dashboard/projects/${slug}?docId=${res.documentId}`)
      }
    } catch (e: any) {
      alert(e.message) // Show the unauthorized error if they bypass UI
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!canEdit || !initialDoc?.id) return
    if (!confirm("Are you sure you want to delete this document permanently?")) return

    setDeleting(true)
    try {
      await deleteDocument({ id: initialDoc.id, projectSlug: slug })
      router.push(`/dashboard/projects/${slug}`)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-3 border-b shrink-0 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href={`/dashboard/projects/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            readOnly={!canEdit} // 🔒 Lock title input
            className={`font-semibold text-sm border-none bg-transparent focus-visible:ring-0 max-w-[300px] h-8 p-0 px-2 rounded ${!canEdit ? 'opacity-70 cursor-not-allowed' : 'focus:bg-white dark:focus:bg-slate-950'}`}
          />
          {!canEdit && <Badge variant="secondary" className=" text-[10px] h-5 gap-1"><Lock className="h-3 w-6"/> View Only</Badge>}
        </div>
        <div className="flex items-center gap-2">
          {initialDoc?.id && canEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDelete} 
              disabled={deleting}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          
          {canEdit && (
            <Button size="sm" onClick={handleSave} disabled={saving || deleting} className="h-8 gap-1.5 text-xs">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} 
              {initialDoc?.id ? "Save Changes" : "Create Note"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          readOnly={!canEdit} // 🔒 Lock content input
          placeholder={canEdit ? "Start typing your documents or notes right here..." : "This document is empty."}
          className={`w-full h-full resize-none bg-transparent outline-none border-none text-sm leading-relaxed font-sans prose dark:prose-invert max-w-none focus:ring-0 ${!canEdit ? 'opacity-80' : ''}`}
        />
      </div>
    </div>
  )
}