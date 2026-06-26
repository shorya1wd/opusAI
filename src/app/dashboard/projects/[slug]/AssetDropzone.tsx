"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner";
import { type UploadThingError } from "@uploadthing/shared";

export default function AssetDropzone({ slug }: { slug: string }) {
  const router = useRouter()
  
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="h-[200px] w-full border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/50 animate-pulse" />
    )
  }

  return (
    <UploadDropzone
      endpoint="projectAsset"
      input={{ slug }}
      config={{ mode: "auto" }}
      onClientUploadComplete={() => {
        toast.success("File uploaded successfully!")
        router.refresh()
      }}
      onUploadError={(e: UploadThingError<any>) => {
        toast.error(`Upload failed: ${e.message}`)
      }}
      className="ut-label:text-primary ut-button:bg-primary ut-button:ut-readying:bg-primary/50 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-4 cursor-pointer"
    />
  )
}