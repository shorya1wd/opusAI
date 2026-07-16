'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, LogOut, Trash2 } from "lucide-react"
import { updateWorkspaceNameAction, leaveOrDeleteWorkspaceAction } from "@/actions/settings"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { syncUserNameToDatabase } from "@/actions/user"
import CustomSettingsBlock from "./CustomSettingBlock"

type SettingsTabsProps = {
    orgName: string,
    role: string
}

export default function SettingsTabs({ orgName, role }: SettingsTabsProps) {

    const [workspaceName, setWorkspaceName] = useState(orgName)
    const [isUpdating, setIsUpdating] = useState(false)

    const [deleteConfirm, setDeleteConfirm] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const { isLoaded, user } = useUser()

    const [firstName, setFirstName] = useState(() => user?.firstName || "")
    const [lastName, setLastName] = useState(() => user?.lastName || "")
    const [isSaving, setIsSaving] = useState(false)

    if (!isLoaded || !user) {
        return <div className="animate-pulse h-64 bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await user.update({ firstName, lastName })
            await syncUserNameToDatabase(firstName, lastName)
            toast.success("Profile updated successfully!")
        } catch (error: unknown) {
            console.error("Error updating profile", error)
            const errorMessage = error && typeof error === 'object' && 'errors' in error
                ? (error as { errors?: Array<{ longMessage?: string }> }).errors?.[0]?.longMessage
                : "Failed to update profile"
            toast.error(errorMessage || "Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    async function handleUpdateName(e: React.FormEvent) {
        e.preventDefault()
        setIsUpdating(true)
        const result = await updateWorkspaceNameAction(workspaceName)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Workspace name updated!")
        }
        setIsUpdating(false)
    }

    async function handleDeleteOrLeave() {
        setIsDeleting(true)
        const result = await leaveOrDeleteWorkspaceAction()
        if (result.error) {
            toast.error(result.error)
            setIsDeleting(false)
        } else {
            toast.success(role === 'admin' ? "Workspace deleted." : "You have left the workspace.")
            window.location.href = "/onboarding"
        }
    }

    return (
        <Tabs defaultValue="workspace" className="w-full max-w-3xl">
            <TabsList className="mb-6 h-10">
                <TabsTrigger value="workspace" className="px-5">Workspace Settings</TabsTrigger>
                <TabsTrigger value="profile" className="px-5">My Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="workspace" className="space-y-5">

                {role === 'admin' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Workspace Name</CardTitle>
                            <CardDescription>Update your company or organization name.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateName} className="flex gap-3 max-w-sm items-center">
                                <Input
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    required
                                    className="flex-1"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isUpdating || workspaceName === orgName || workspaceName.trim() === ''}
                                >
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-destructive/40">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            {role === 'admin'
                                ? "Permanently delete this workspace and all of its data. This cannot be undone."
                                : "Leave this workspace. You will lose access to all projects immediately."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {role === 'admin' ? (
                            <div className="space-y-3 max-w-sm">
                                <Label className="text-sm text-muted-foreground">
                                    Type <span className="font-semibold text-foreground">{orgName}</span> to confirm.
                                </Label>
                                <Input
                                    value={deleteConfirm}
                                    onChange={(e) => setDeleteConfirm(e.target.value)}
                                    placeholder={orgName}
                                />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteOrLeave}
                                    disabled={deleteConfirm !== orgName || isDeleting}
                                    className="gap-2"
                                >
                                    {isDeleting
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <Trash2 className="h-4 w-4" />}
                                    {isDeleting ? "Deleting..." : "Delete Workspace"}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteOrLeave}
                                disabled={isDeleting}
                                className="gap-2"
                            >
                                {isDeleting
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <LogOut className="h-4 w-4" />}
                                {isDeleting ? "Leaving..." : "Leave Workspace"}
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