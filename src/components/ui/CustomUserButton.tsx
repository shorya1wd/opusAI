"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, User as UserIcon } from "lucide-react"
import Link from "next/link"

export default function CustomUserButton() {
  const { isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  if (!isLoaded || !user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-slate-200 dark:border-slate-800 transition-all hover:ring-2 hover:ring-primary/20 hover:border-primary/50">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user.firstName?.charAt(0) || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 p-2 shadow-xl rounded-xl border-slate-200 dark:border-slate-800" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground tracking-tight">
              {user.fullName}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="p-2.5 cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800/50 rounded-lg transition-colors">
            <Link href="/dashboard/settings" className="flex items-center w-full">
              <Settings className="mr-2.5 h-4 w-4 text-slate-500" />
              <span className="font-medium text-sm">Manage Account</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />
        
        <DropdownMenuItem 
          className="p-2.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-500 dark:focus:bg-red-950/30 dark:focus:text-red-400 rounded-lg transition-colors"
          onClick={() => signOut(() => router.push("/sign-in"))}
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          <span className="font-medium text-sm">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}