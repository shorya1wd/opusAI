import { Suspense } from "react"
import DashboardData from "./DashboardData" // Import the new component

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* This shell is sent to the browser in under 100ms */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Here is what&apos;s happening in your workspace today.
        </p>
      </div>
      
      {/* Next.js streams the fallback to the browser, while the server waits for Prisma */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  )
}

// A simple loading placeholder that matches the shape of your cards
function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
       <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
       <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
       <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
    </div>
  )
}