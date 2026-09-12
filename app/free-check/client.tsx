"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight, Loader2, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface Finding {
  phrase: string
  category: string
  severity: "high" | "medium" | "low"
  reason: string
}

function isFinding(value: unknown): value is Finding {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.phrase === "string" && typeof item.category === "string" &&
    typeof item.reason === "string" &&
    (item.severity === "high" || item.severity === "medium" || item.severity === "low")
}

export function FreeCheckClient() {
  const [text, setText] = useState("")
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tier, setTier] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadTier() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from("profiles").select("tier").eq("id", user.id).single()
        if (active) setTier(data?.tier ?? "free")
      } catch {
        // The public checker remains usable if account details cannot load.
      }
    }
    void loadTier()
    return () => { active = false }
  }, [])

  const isPaid = tier === "pro" || tier === "lister"

  async function runCheck() {
    if (scanning || text.trim().length < 20 || text.length > 4000) return
    setScanning(true)
    setError(null)
    setFindings(null)
    try {
      const res = await fetch("/api/free-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || "The check could not finish. Please try again.")
      if (!Array.isArray(data.findings) || !data.findings.every(isFinding)) {
        throw new Error("The checker returned an unexpected result. Please try again; no conclusion was reached.")
      }
      setFindings(data.findings)
    } catch (err) {
      setError(err instanceof Error ? err.message : "The check could not finish. Please try again.")
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-primary/10 to-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-center">
          <p className="mb-4 text-sm font-medium text-primary">Free wording check - no sign-up required to start</p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Give your rental advert a second look.</h1>
          <p className="mt-5 text-lg text-muted-foreground">Paste your advert to flag wording that may need review. This is AI assistance, not a decision about whether your advert is legal.</p>
        </header>

        <aside className="mt-8 rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Before you paste:</strong> use public advert text only. Remove tenant names, contact details and confidential information. Submitted text is processed by an AI service.</p>
          <p className="mt-2">Requirements depend on the property location, tenancy type and current law. Verify suggestions before acting on them.</p>
          <Link href="/privacy" className="mt-2 inline-block underline underline-offset-4">Privacy policy</Link>
        </aside>

        <Card className="mt-6 border-border bg-card">
          <CardContent className="space-y-4 p-5">
            <label htmlFor="rental-advert" className="block text-sm font-semibold text-foreground">Rental advert text</label>
            <Textarea
              id="rental-advert"
              placeholder="Paste the public wording of your rental advert here..."
              value={text}
              disabled={scanning}
              onChange={(event) => { setText(event.target.value); setFindings(null); setError(null) }}
              rows={9}
              aria-describedby="advert-length checker-limits"
              className="text-sm"
            />
            <p id="advert-length" className="text-xs text-muted-foreground">
              {text.length} / 4,000 characters. At least 20 characters required.
              {text.length > 4000 && " Please shorten the text to continue."}
            </p>
            <Button onClick={runCheck} disabled={scanning || text.trim().length < 20 || text.length > 4000} size="lg" className="w-full">
              {scanning ? <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine aria-hidden="true" className="mr-2 h-4 w-4" />}
              {scanning ? "Reviewing your advert..." : "Check my advert free"}
            </Button>
            <p id="checker-limits" className="text-xs text-muted-foreground">Usage limits apply. This free check flags wording; suggested rewrites require an eligible paid plan. <Link href="/pricing" className="underline">Compare plans</Link>.</p>
            {error && <p role="alert" className="rounded-md border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        <section aria-live="polite" aria-busy={scanning} className="mt-6 space-y-4">
          {scanning && <p role="status" className="text-sm text-muted-foreground">Checking the wording. Results will appear here.</p>}
          {findings !== null && !scanning && (
            <>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-lg font-semibold text-foreground">{findings.length === 0 ? "No wording was flagged by this check" : `${findings.length} item${findings.length === 1 ? "" : "s"} to review`}</h2>
                <p className="mt-2 text-sm text-muted-foreground">This does not confirm legal compliance or completeness. The checker can miss issues or flag acceptable wording. Treat explanations and priority labels as AI suggestions, not legal findings.</p>
              </div>
              {findings.map((finding, index) => (
                <Card key={`${index}-${finding.phrase}`} className="border-border bg-card">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                      <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-500" />
                      <h3>{finding.category}</h3>
                      <span className="text-xs text-muted-foreground">AI review priority: {finding.severity}</span>
                    </div>
                    <blockquote className="border-l-2 border-primary/40 pl-3 text-sm text-foreground">{finding.phrase}</blockquote>
                    <p className="text-sm text-muted-foreground">{finding.reason}</p>
                  </CardContent>
                </Card>
              ))}
              <div className="rounded-xl border border-border bg-secondary/30 p-5">
                <h3 className="font-semibold text-foreground">{isPaid ? "Continue your review" : "Need help rewriting?"}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{isPaid ? "Use the full checker for suggested edits. Verify the wording before publishing." : "The free check flags wording. Review paid plans for suggested edits; creating a free account alone does not unlock them."}</p>
                <Button asChild className="mt-4">
                  <Link href={isPaid ? "/compliance" : "/pricing"}>{isPaid ? "Open full checker" : "Compare paid plans"}<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Was this useful, confusing or incorrect? <a href="mailto:vr047836@gmail.com?subject=Tenancy%20checker%20feedback" className="underline">Send feedback</a>. Do not send confidential information.</p>
            </>
          )}
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">Not legal advice. Consult a qualified professional where needed and check current official guidance for the relevant UK nation.</p>
      </div>
    </div>
  )
}
