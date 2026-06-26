"use client"

import { Download } from "lucide-react"

interface DownloadAssetButtonProps {
  url: string;
  name: string;
}

export default function DownloadAssetButton({ url, name }: DownloadAssetButtonProps) {
  
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, '_blank'); 
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
      title="Download file"
    >
      <Download className="h-4 w-4" />
    </button>
  )
}