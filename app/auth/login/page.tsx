'use client'

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false, // login only — don't create new accounts
      },
    })

    if (authError) {
      // If user doesn't exist, give a helpful message rather than the raw error
      if (authError.message.toLowerCase().includes("not found") || authError.message.toLowerCase().includes("signups not allowed")) {
        setError("No account found with that email. Sign up first.")
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
              We've sent a magic link to <strong>{email}</strong>. Click it to sign in — no password needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground text-center">
            <p>The link expires in 1 hour.</p>
            <p>
              Didn't get it?{" "}
              <button onClick={() => setSent(false)} className="text-primary underline">
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
            Enter your email and we'll send you a sign-in link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? "Sending magic link..." : <>Send magic link <ArrowRight className="ml-2 h-4 w-4" /></>}
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
