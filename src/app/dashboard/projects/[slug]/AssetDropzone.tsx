"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner";

export default function AssetDropzone({ slug }: { slug: string }) {
  const router = useRouter()
  
  // 1. Create a mounting state to prevent Next.js hydration errors
  const [isMounted, setIsMounted] = useState(false)

  // 2. Set it to true only once the browser has loaded the component
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 3. Render a blank skeleton box while the server is rendering
  if (!isMounted) {
    return (
      <div className="h-[200px] w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 animate-pulse" />
    )
  }

  // 4. Once safely in the browser, render the real Dropzone
  return (
    <UploadDropzone
      endpoint="projectAsset"
      input={{ slug }}
      config={{ mode: "auto" }}
      onClientUploadComplete={() => {
        toast.success("File uploaded successfully!")
        router.refresh()
      }}
      onUploadError={(e: Error) => toast.error(`Upload failed: ${e.message}`)}
      className="ut-label:text-primary ut-button:bg-primary ut-button:ut-readying:bg-primary/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-4 cursor-pointer"
    />
  )
}