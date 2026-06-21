'use client'

import { useState } from "react"
import { UserProfile } from "@clerk/nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { updateWorkspaceNameAction, leaveOrDeleteWorkspaceAction } from "@/actions/settings"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { syncUserNameToDatabase } from "@/actions/user"
import CustomSettingsBlock from "./CustomSettingBlock"

type SettingsTabsProps = {
    orgName:string,
    role:string
}

export default function SettingsTabs({orgName, role}: SettingsTabsProps) {

    const [workspaceName, setWorkspaceName] = useState(orgName)
    const [isUpdating, setIsUpdating] = useState(false)

    const [deleteConfirm, setDeleteConfirm] = useState("")
    const [isDeleting,setIsDeleting] = useState(false)
    const [updateSuccess, setUpdateSuccess] = useState(false)
    const { isLoaded, user } = useUser()
  
  const [firstName, setFirstName] = useState(() => user?.firstName || "")
  const [lastName, setLastName] = useState(() => user?.lastName || "")
  const [isSaving, setIsSaving] = useState(false)

  if (!isLoaded || !user) {
    return <div className="animate-pulse h-64 bg-slate-100 dark:bg-slate-900 rounded-xl" />
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await user.update({
        firstName,
        lastName,
      })
      await syncUserNameToDatabase(firstName, lastName)
      
      toast.success("Profile updated successfully!")
    } catch (error: unknown) {
      console.error("Error updating profile", error)
      const errorMessage = error && typeof error === 'object' && 'errors' in error
        ? (error as { errors?: Array<{ longMessage?: string }> }).errors?.[0]?.longMessage
        : "Failed to update profile"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }


    async function handleUpdateName(e:React.FormEvent) {
        e.preventDefault()
        setIsUpdating(true)
       setUpdateSuccess(false)

        const result = await updateWorkspaceNameAction(workspaceName)
    
        if (result.error) {
            alert(result.error)
        } else {
            setUpdateSuccess(true)
            setTimeout(() => setUpdateSuccess(false), 3000) 
        } 
        setIsUpdating(false)      
    }

    async function handleDeleteOrLeave() {
        setIsDeleting(true)
        const result = await leaveOrDeleteWorkspaceAction()
    
        if (result.error) {
            alert(result.error)
            setIsDeleting(false)
        } else {          
            window.location.href = "/onboarding"
        }
    }

 return (
    <Tabs defaultValue="workspace" className="w-full max-w-4xl">
      <TabsList className="mb-4">
        <TabsTrigger value="workspace">Workspace Settings</TabsTrigger>
        <TabsTrigger value="profile">My Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="workspace" className="space-y-6">
        
        {role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Workspace Name</CardTitle>
              <CardDescription>Update your company or organization name.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateName} className="flex gap-4 max-w-md items-center">
                <Input 
                  value={workspaceName} 
                  onChange={(e) => setWorkspaceName(e.target.value)} 
                  required
                />
                <Button type="submit" disabled={isUpdating || workspaceName === orgName}>
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
                {updateSuccess && <CheckCircle2 className="h-5 w-5 text-green-500 animate-in fade-in" />}
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription>
              {role === 'admin' 
                ? "Permanently delete this workspace and all of its data. This cannot be undone."
                : "Leave this workspace. You will lose access to all projects immediately."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'admin' ? (
              <div className="space-y-4 max-w-md">
                <Label className="text-muted-foreground">
                  Type <span className="font-bold text-foreground">{orgName}</span> to confirm.
                </Label>
                <Input 
                  value={deleteConfirm} 
                  onChange={(e) => setDeleteConfirm(e.target.value)} 
                  placeholder={orgName}
                />
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteOrLeave}
                  disabled={deleteConfirm !== orgName || isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete Workspace
                </Button>
              </div>
            ) : (
              <Button variant="destructive" onClick={handleDeleteOrLeave} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Leave Workspace
              </Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="profile">
        <CustomSettingsBlock />
      </TabsContent>
    </Tabs>
  )
}