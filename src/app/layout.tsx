import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

// 1. Initialize the font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Opus AI",
  description: "AI-powered project management tool",
  icons: {
    icon: "/opus-logo.png", // This explicitly forces the browser to fetch the logo
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en" className={cn("h-full", "antialiased")}>
      {/* 2. Add inter.className right here */}
      <body suppressHydrationWarning className={cn("min-h-full flex flex-col", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

        <ClerkProvider 
          appearance={{
            elements: { logoImageUrl: "/opus-logo.png" },
            variables: { colorPrimary: "#000000" }
          }}
        >
          {children}
          <Toaster richColors />
        </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}