'use client'

import { useState } from "react"
import { toggleProjectMemberAction } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Users, Loader2, UserPlus, UserMinus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

type UserProps = {
  id: string
  email: string
  name: string | null
}

export default function ManageTeamModal({
  projectId,
  slug,
  orgUsers,
  assignedUserIds,
  isAdmin
}: {
  projectId: string
  slug: string
  orgUsers: UserProps[]
  assignedUserIds: string[]
  isAdmin: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleToggle(targetUserId: string, isAssigned: boolean) {
    setLoadingId(targetUserId)
    const action = isAssigned ? 'remove' : 'add'
    const result = await toggleProjectMemberAction(projectId, targetUserId, action, slug)
    
    if (result?.error) {
      toast.error(result.error)
    }
    setLoadingId(null)
  }

  // Helper to format names nicely
  const getDisplayName = (name: string | null, email: string) => 
    name && name !== 'New User' ? name : email.split('@')[0]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" /> Manage Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Access</DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? "Assign workspace members to this project." 
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {orgUsers.map((user) => {
            const isAssigned = assignedUserIds.includes(user.id)
            const isLoading = loadingId === user.id

            return (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                <div>
                  <p className="text-sm font-medium">{getDisplayName(user.name, user.email)}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                
                {/* Only show Add/Remove controls if the current viewer is the Admin */}
                {isAdmin ? (
                  <Button
                    variant={isAssigned ? "destructive" : "secondary"}
                    size="sm"
                    onClick={() => handleToggle(user.id, isAssigned)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isAssigned ? (
                      <><UserMinus className="h-3 w-3 mr-1" /> Remove</>
                    ) : (
                      <><UserPlus className="h-3 w-3 mr-1" /> Add</>
                    )}
                  </Button>
                ) : (
                  // If they aren't the admin, just show a badge
                  isAssigned && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                       Access Granted
                    </span>
                  )
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}