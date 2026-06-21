"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { deleteAsset } from "@/actions/assets"
import { toast } from "sonner"

export default function DeleteAssetButton({ 
  assetId, 
  projectSlug 
}: { 
  assetId: string
  projectSlug: string 
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors opacity-0 group-hover:opacity-100"
      disabled={isDeleting}
      onClick={async (e) => {
        e.preventDefault() // Prevents the browser from opening the file link!
        e.stopPropagation()
        
        setIsDeleting(true)
        try {
          await deleteAsset(assetId, projectSlug)
          toast.success("File deleted successfully")
        } catch(err) {
          toast.error("Failed to delete file")
        } finally {
          setIsDeleting(false)
        }
      }}
    >
      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
    </Button>
  )
}