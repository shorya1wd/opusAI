import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";


export const metadata: Metadata = {
  title: "Opus AI",
  description: "AI-powered project management tool",
};
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning
      lang="en"
      className={cn("h-full", "antialiased")}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ClerkProvider 
          appearance={{
    elements: {
      logoImageUrl: "/opus-logo.png", 
    },
    variables: {
      colorPrimary: "#000000", 
    }
  }}
        >
          
         
          {children}
          <Toaster richColors />
        </ClerkProvider>
      </body>
    </html>
  );
}