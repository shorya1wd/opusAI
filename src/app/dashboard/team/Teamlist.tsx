"use client"

import { useState } from "react"
import { kickMemberAction, updateRoleAction } from "@/actions/team"
import { Button } from "@/components/ui/button"
// 🚀 Added 'Shield' to the imports for the Make Admin button
import { Loader2, ShieldAlert, Shield, UserMinus } from "lucide-react" 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TeamMember = {
    id: string,
    name: string | null,
    email: string,
    role: string,
}

function getDisplayName(name: string | null, email: string) {
  if (name && name !== 'New User' && name.trim() !== '') {
    return name;
  }
  // Extract "john.doe" from "john.doe@gmail.com"
  const emailPrefix = email.split('@')[0];
  // Convert "john.doe" to "John Doe"
  return emailPrefix
    .split('.')
    .slice(0,2)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function TeamList({ 
  members, 
  currentUserId, 
  currentUserRole 
}: { 
  members: TeamMember[]
  currentUserId: string
  currentUserRole: string
}) {

  const [kickingId, setKickingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (targetId: string, currentRole: string) => {
    setLoadingId(targetId)
    const newRole = currentRole === "admin" ? "member" : "admin"
    
    const result = await updateRoleAction(targetId, newRole)
    if (result?.error) {
      alert(result.error) // Or use toast() if you have shadcn toasts installed!
    }
    
    setLoadingId(null)
  }

  async function handleKick(targetId: string) {
    setKickingId(targetId)
    const result = await kickMemberAction(targetId)
    
    if (result?.error) {
      alert(result.error)
    }
    setKickingId(null)
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b dark:bg-slate-900">
          <tr>
            <th className="px-6 py-4 font-medium text-muted-foreground">Name</th>
            <th className="px-6 py-4 font-medium text-muted-foreground">Email</th>
            <th className="px-6 py-4 font-medium text-muted-foreground">Role</th>
            <th className="px-6 py-4 font-medium text-right text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member) => (
            <tr key={member.id} className="bg-white dark:bg-slate-950">
              <td className="px-6 py-4 font-medium">
                {getDisplayName(member.name, member.email)}
              </td>
              <td className="px-6 py-4 text-muted-foreground">{member.email}</td>
              <td className="px-6 py-4">
                {member.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <ShieldAlert className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Member
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {currentUserRole === 'admin' && member.id !== currentUserId ? (
                  
                  /* 🚀 Added flex container to align both buttons side-by-side on the right */
                  <div className="flex justify-end items-center gap-2">
                    
                    {/* 🚀 The Promote/Demote Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRoleChange(member.id, member.role)}
                      disabled={loadingId === member.id || kickingId === member.id}
                    >
                      {loadingId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : member.role === "admin" ? (
                        <>Demote</>
                      ) : (
                        <><Shield className="h-4 w-4 mr-2" /> Make Admin</>
                      )}
                    </Button>

                    {/* Existing Remove Button (AlertDialog) */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={kickingId === member.id || loadingId === member.id}>
                          {kickingId === member.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><UserMinus className="h-4 w-4 mr-2"/> Remove</>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove <strong>{getDisplayName(member.name, member.email)}</strong> from the workspace. They will lose all access to team projects immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleKick(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, remove user
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </div>
                ) : (
                  <span className="text-muted-foreground italic">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}