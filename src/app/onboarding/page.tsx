"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2, KeyRound } from "lucide-react"
import { createWorkspaceAction ,joinWorkspaceAction} from "@/actions/workspace"
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  const [workspaceName, setWorkspaceName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState("")

  async function createOrganization(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setCreateError("")
   
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      formData.append('workspaceName', workspaceName)
      
      const result = await createWorkspaceAction(formData)
      if (result.success) {
      
        router.push("/dashboard")
        console.log('Workspace created successfully', result)
      } else {
        setCreateError(result.error || "Failed to create workspace. Please try again")
      }
    } catch (err) {
      setCreateError("Failed to create workspace. Please try again")
      console.log(err)
    }finally{
      setIsCreating(false)
    }
  }

  async function joinOrganization(e: React.FormEvent) {
    e.preventDefault()
    setIsJoining(true)
    setJoinError("")

    try {
      const formData = new FormData()
      formData.append('inviteCode', inviteCode)

      const result = await joinWorkspaceAction(formData)

      if (result.error) {
        setJoinError(result.error)
      } else {
     
        router.push("/dashboard")
      }
    } catch (err) {
      setJoinError("Failed to connect to the server. Please try again.")
      console.log(err)
    } finally {
      setIsJoining(false)
    }
  }

return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Opus AI</CardTitle>
          <CardDescription>
            Let&apos;s get you set up so you can start creating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create">Create Workspace</TabsTrigger>
              <TabsTrigger value="join">Join Existing</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form onSubmit={createOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="workspaceName"
                      placeholder="e.g. Nexus Studios"
                      className="pl-10"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>
                </div>

                {createError && (
                  <Alert variant="destructive">
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Workspace...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={joinOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="inviteCode"
                      placeholder="Paste your 8-character code"
                      className="pl-10"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      required
                      disabled={isJoining}
                    />
                  </div>
                </div>

                {joinError && (
                  <Alert variant="destructive">
                    <AlertDescription>{joinError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" variant="secondary" disabled={isJoining}>
                  {isJoining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Code...
                    </>
                  ) : (
                    "Join Workspace"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}