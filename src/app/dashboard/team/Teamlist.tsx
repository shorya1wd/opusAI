"use client"

import { useState } from "react"
import { kickMemberAction, updateRoleAction } from "@/actions/team"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldAlert, Shield, UserMinus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
  id: string
  name: string | null
  email: string
  role: string
}

function getDisplayName(name: string | null, email: string) {
  if (name && name !== 'New User' && name.trim() !== '') return name
  const emailPrefix = email.split('@')[0]
  return emailPrefix
    .split('.')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function TeamList({
  members,
  currentUserId,
  currentUserRole,
}: {
  members: TeamMember[]
  currentUserId: string
  currentUserRole: string
}) {
  const router = useRouter()
  const [kickingId, setKickingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (targetId: string, currentRole: string) => {
    setLoadingId(targetId)
    const newRole = currentRole === "admin" ? "member" : "admin"
    const result = await updateRoleAction(targetId, newRole)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`Role updated to ${newRole}.`)
      router.refresh()
    }
    setLoadingId(null)
  }

  async function handleKick(targetId: string) {
    setKickingId(targetId)
    const result = await kickMemberAction(targetId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Member removed from workspace.")
      router.refresh()
    }
    setKickingId(null)
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
          <tr>
            <th className="px-5 py-3 font-medium text-muted-foreground">Name</th>
            <th className="px-5 py-3 font-medium text-muted-foreground hidden sm:table-cell">Email</th>
            <th className="px-5 py-3 font-medium text-muted-foreground">Role</th>
            <th className="px-5 py-3 font-medium text-right text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member) => (
            <tr key={member.id} className="bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
              <td className="px-5 py-3.5 font-medium">
                {getDisplayName(member.name, member.email)}
              </td>
              <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{member.email}</td>
              <td className="px-5 py-3.5">
                {member.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <ShieldAlert className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    Member
                  </span>
                )}
              </td>
              <td className="px-5 py-3.5 text-right">
                {currentUserRole === 'admin' && member.id !== currentUserId ? (
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleChange(member.id, member.role)}
                      disabled={loadingId === member.id || kickingId === member.id}
                      className="h-7 text-xs"
                    >
                      {loadingId === member.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : member.role === "admin" ? (
                        "Demote"
                      ) : (
                        <><Shield className="h-3 w-3 mr-1.5" /> Make Admin</>
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={kickingId === member.id || loadingId === member.id}
                          className="h-7 text-xs"
                        >
                          {kickingId === member.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <><UserMinus className="h-3 w-3 mr-1.5" /> Remove</>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {getDisplayName(member.name, member.email)}?</AlertDialogTitle>
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
                            Yes, remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}