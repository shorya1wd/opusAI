'use client'

import { useState } from "react";
import { useRouter } from 'next/navigation'
import Link from "next/link";
import { useSignUp } from '@clerk/nextjs'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const { signUp, errors: clerkErrors, fetchStatus } = useSignUp()
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [generalError, setGeneralError] = useState("")
  const isLoading = fetchStatus === "fetching"
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)

  if (!signUp) {
    return null
  }

const signUpWithGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      await signUp.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback", 
        redirectUrl: "/dashboard",          
      })
    } catch (err) {
      console.error("Google sign up failed", err)
      setGeneralError("Failed to authenticate with Google.")
      setIsGoogleLoading(false)
    }
  }

  const signUpWithMicrosoft = async () => {
    setIsMicrosoftLoading(true)
    try {
      await signUp.sso({
        strategy: "oauth_microsoft",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/dashboard",
      })
    } catch (err) {
      console.error("Microsoft sign up failed", err)
      setGeneralError("Failed to authenticate with Microsoft.")
      setIsMicrosoftLoading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setGeneralError("")

    try {
      await signUp.create({ 
        firstName,
        lastName,
        emailAddress, 
        password 
      })
      
      await signUp.verifications.sendEmailCode()
      setPendingVerification(true)
    } catch (err: unknown) {
      console.error("Sign up failed", err)
      const error = err as { errors?: Array<{ longMessage: string }> }
      setGeneralError(error.errors?.[0]?.longMessage || "Sign up failed. Please try again.")
    }
  }

  async function onVerification(e: React.FormEvent) {
    e.preventDefault()
    setGeneralError("")

    try {
      const { error } = await signUp.verifications.verifyEmailCode({code})
      if(error) {
        setGeneralError("Verification failed. Please try again.")
        return
      }
      if(signUp.status==='complete'){
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            router.push(decorateUrl('/onboarding'))
          }
        })
      }
    } catch (err: unknown) {
      console.error("Verification failed", err)
      const error = err as { errors?: Array<{ longMessage: string }> }
      setGeneralError(error.errors?.[0]?.longMessage || "Verification failed. Please check the code.")
    }
  }

  const fieldError = clerkErrors?.fields?.emailAddress?.message || clerkErrors?.fields?.password?.message;
  const displayError = generalError || fieldError;
  const isAnyLoading = loading || isGoogleLoading || isMicrosoftLoading

 return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* 🚀 The "Professional Glow" Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-40%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-500/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-500/20 blur-[120px]" />
      </div>

      {/* 🚀 Your Existing Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* ... your Clerk <SignIn /> or existing card code here ... */}
        <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign Up for Opus AI
          </CardTitle>
          <CardDescription className="text-center">
            {pendingVerification ? "Check your email for the verification code" : "Create your workspace to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={signUpWithGoogle}
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
                  Sign up with Google
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={signUpWithMicrosoft}
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
                  Sign up with Microsoft
                </Button>
              </div>
              
              {/* 3. 👇 Added UI for First and Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Chen"
                    required
                  />
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
                <Label htmlFor="password">Password</Label>
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
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerification} className="space-y-4">
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

              {displayError && (
                <Alert variant="destructive">
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        {!pendingVerification && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
      </div>
      
    </main>
  );
}