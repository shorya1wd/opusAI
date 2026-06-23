
'use client'

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import Link from "next/link";
import { useAuth, useSignIn } from '@clerk/nextjs'

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function SignInPage() {
  const { signIn, errors: clerkErrors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  
  const [generalError, setGeneralError] = useState("")

const { isSignedIn,isLoaded } = useAuth()

  const isLoading = fetchStatus === "fetching"

  useEffect(() => {
  if (isLoaded && isSignedIn) router.replace("/dashboard")
}, [isLoaded, isSignedIn, router])

  if (!signIn) {
    return null
  }
const signInWithGoogle = async () => {
    setIsGoogleLoading(true)
    setGeneralError("")
    
    try {
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/dashboard",
      })

      if (error) {
        console.error("Google sign in returned an error:", error)
        setGeneralError(error.longMessage || "Failed to authenticate with Google.")
        setIsGoogleLoading(false)
      }
    } catch (err: any) {
      console.error("Google sign in crashed:", err)
      setGeneralError(err.errors?.[0]?.longMessage || "An unexpected error occurred.")
      setIsGoogleLoading(false) 
    }
  }

  const signInWithMicrosoft = async () => {
    setIsMicrosoftLoading(true)
    setGeneralError("")
    
    try {
      const { error } = await signIn.sso({
        strategy: "oauth_microsoft",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/dashboard",
      })

      if (error) {
        console.error("Microsoft sign in returned an error:", error)
        setGeneralError(error.longMessage || "Failed to authenticate with Microsoft.")
        setIsMicrosoftLoading(false)
      }
    } catch (err: any) {
      console.error("Microsoft sign in crashed:", err)
      setGeneralError(err.errors?.[0]?.longMessage || "An unexpected error occurred.")
      setIsMicrosoftLoading(false)
    }
  }

 async function submit(e: React.FormEvent) {
    e.preventDefault()
    setGeneralError("")

    try {
      await signIn.password({
        emailAddress, 
        password
      })

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.push(decorateUrl('/dashboard'))
          }
        })
      } else {
        console.log("Sign in incomplete. Status:", signIn.status)
        setGeneralError(`Wrong credentials`)
      }

    } catch (err: unknown) {
      console.error("Sign in failed", err)
      const error = err as { errors?: Array<{ longMessage?: string }> }
      setGeneralError(error.errors?.[0]?.longMessage || "Sign in failed. Please check your credentials.")
    }
  }

  const fieldError = clerkErrors?.fields?.identifier?.message || clerkErrors?.fields?.password?.message;
  const displayError = generalError || fieldError;
  const isAnyLoading = isLoading || isGoogleLoading || isMicrosoftLoading

 return (
  <main className="relative flex h-dvh min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-40%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your Opus AI workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={signInWithGoogle}
                disabled={isAnyLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={signInWithMicrosoft}
                disabled={isAnyLoading}
              >
                {isMicrosoftLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                )}
                Continue with Microsoft
              </Button>
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="alex@nexusstudios.com"
                  required
                />
              </div>
              <div className="space-y-2">
            
                <div className="flex items-center justify-between">
    <Label htmlFor="password">Password</Label>
    {/* 👇 Add this link so users can reset their password! */}
    <Link 
      href="/forgot-password" 
      className="text-xs font-medium text-primary hover:underline"
    >
      Forgot password?
    </Link>
  </div>
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {displayError && (
                <Alert variant="destructive">
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}
              
              <div id="clerk-captcha"></div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
      </div>
      
    </main>
   
  );
}