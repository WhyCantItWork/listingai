'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    setLoading(true)
    setError(null)

    // Check if email exists in our system
    const checkRes = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const checkData = await checkRes.json()

    if (!checkData.exists) {
      setError("No account found with that email. Sign up first.")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      setError("Enter the 6-digit code from your email.")
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    })

    if (verifyError) {
      setError("Invalid or expired code. Try again or request a new one.")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a 6-digit code and a sign-in link to <strong>{email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Enter the 6-digit code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={loading}
                  autoFocus
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading || code.length !== 6} className="w-full" size="lg">
                {loading ? "Verifying..." : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
              Or click the link in the email to sign in instantly. Either works.
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Wrong email?{" "}
              <button onClick={() => { setSent(false); setCode(""); setError(null) }} className="text-primary underline">
                Try again
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            We&apos;ll email you a code and a sign-in link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading || !email} className="w-full" size="lg">
              {loading ? "Sending..." : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Tenancy?{" "}
            <Link href="/auth/signup" className="text-primary underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
