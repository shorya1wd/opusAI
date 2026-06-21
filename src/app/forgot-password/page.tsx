"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"

export default function ForgotPasswordPage() {
  const { signIn } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [successfulCreation, setSuccessfulCreation] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (!signIn) return null

  // Step 1: Request the password reset code
  async function requestReset(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Initialize sign-in with email
      await signIn?.create({
        identifier: email,
      })
      // Send password reset code
      await signIn?.resetPasswordEmailCode.sendCode()
      setSuccessfulCreation(true)
    } catch (err: unknown) {
      console.error("Error requesting reset:", err)
      const errorMessage = err && typeof err === 'object' && 'errors' in err
        ? (err as { errors?: Array<{ longMessage?: string }> }).errors?.[0]?.longMessage
        : undefined
      setError(errorMessage || "Failed to send reset code. Please check your email.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify the code and set the new password
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Verify the code
      await signIn?.resetPasswordEmailCode.verifyCode({
        code,
      })

      // Submit the new password
      await signIn?.resetPasswordEmailCode.submitPassword({
        password,
      })
      
      // Activate the new session and redirect to the dashboard!
      await signIn?.finalize({
        navigate: ({ decorateUrl }) => {
          router.push(decorateUrl('/dashboard'))
        }
      })
    } catch (err: unknown) {
      console.error("Error resetting password:", err)
      const errorMessage = err && typeof err === 'object' && 'errors' in err
        ? (err as { errors?: Array<{ longMessage?: string }> }).errors?.[0]?.longMessage
        : undefined
      setError(errorMessage || "Invalid code or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {successfulCreation 
              ? "Enter the code sent to your email and your new password." 
              : "Enter your email address and we'll send you a reset code."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!successfulCreation ? (
            <form onSubmit={requestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@nexusstudios.com"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}