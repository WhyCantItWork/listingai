"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, AlertTriangle, Check, Loader2, Sparkles, Lock, ArrowRight, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Finding {
  phrase: string
  category: string
  severity: "high" | "medium" | "low"
  reason: string
}

export function FreeCheckClient() {
  const [text, setText] = useState("")
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runCheck = async () => {
    if (text.trim().length < 20) {
      setError("Paste at least a sentence to scan.")
      return
    }
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
      if (!res.ok) throw new Error(data.message || data.error || "Failed to run check")
      setFindings(data.findings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setScanning(false)
    }
  }

  const severityColor = (s: Finding["severity"]) => {
    if (s === "high") return "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400"
    if (s === "medium") return "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    return "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
  }

  return (
    <div className="relative isolate overflow-hidden">
      {/* Animated gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(55% 55% at 25% 15%, var(--color-primary) 0%, transparent 60%), radial-gradient(45% 45% at 80% 10%, color-mix(in oklch, var(--color-primary) 50%, transparent) 0%, transparent 55%)",
          backgroundSize: "200% 200%",
          animation: "tenancy-drift 18s ease-in-out infinite",
          filter: "blur(70px)",
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center">
          <div className="tenancy-rise mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            Free · No sign-up · Updated for the Renters&apos; Rights Act 2025
          </div>
          <h1 className="tenancy-rise tenancy-rise-1 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Is your rental advert{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              still legal?
            </span>
          </h1>
          <p className="tenancy-rise tenancy-rise-2 mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
            Paste any UK rental listing below. Tenancy instantly flags the phrases that now breach the Renters&apos; Rights Act, Equality Act, and Tenant Fees Act — before they cost you a fine.
          </p>
        </div>

        {/* Scanner */}
        <Card className="tenancy-rise tenancy-rise-3 mt-10 border-border bg-card/80 backdrop-blur">
          <CardContent className="p-5 space-y-4">
            <Textarea
              placeholder="Paste your property advert here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              className="resize-none text-sm transition-colors focus-visible:border-primary"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{text.length} / 4000 characters</span>
              {text.length > 4000 && <span className="text-rose-500">Too long for the free checker</span>}
            </div>
            <Button
              onClick={runCheck}
              disabled={scanning || text.trim().length < 20 || text.length > 4000}
              size="lg"
              className="w-full transition-transform active:scale-[0.98]"
            >
              {scanning ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning your advert…</>
              ) : (
                <><ScanLine className="mr-2 h-4 w-4" /> Check my advert free</>
              )}
            </Button>
            {error && (
              <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500 animate-[tenancy-rise_0.3s_ease-out]">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Scanning skeleton */}
        {scanning && (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card/60 p-4 space-y-2">
                <div className="tenancy-shimmer h-4 w-28 rounded-full" />
                <div className="tenancy-shimmer h-4 w-3/4 rounded" />
                <div className="tenancy-shimmer h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* All clear */}
        {findings !== null && findings.length === 0 && !scanning && (
          <Card className="mt-6 border-green-500/40 bg-green-500/5 animate-[tenancy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-lg font-semibold text-foreground">No obvious breaches found</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                This advert looks clean on the common red flags. For a deeper scan with auto-fixes, full Material Information checks, and unlimited listings, create a free account.
              </p>
              <Button asChild className="mt-2">
                <Link href="/auth/signup">Create free account <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Findings — flags shown free, fixes gated */}
        {findings !== null && findings.length > 0 && !scanning && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 animate-[tenancy-rise_0.4s_ease-out]">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">
                {findings.length} issue{findings.length !== 1 ? "s" : ""} found
              </h2>
            </div>

            {findings.map((f, i) => (
              <Card
                key={i}
                style={{ animationDelay: `${i * 70}ms` }}
                className="border-border bg-card opacity-0 animate-[tenancy-rise_0.4s_ease-out_forwards]"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", severityColor(f.severity))}>
                      {f.category}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      f.severity === "high" ? "text-rose-500" : f.severity === "medium" ? "text-amber-500" : "text-blue-500"
                    )}>
                      {f.severity} risk
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">&ldquo;{f.phrase}&rdquo;</p>
                  <p className="text-sm text-muted-foreground">{f.reason}</p>

                  {/* Gated fix — blurred teaser */}
                  <div className="relative overflow-hidden rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
                    <div className="select-none blur-[5px]" aria-hidden>
                      <p className="text-xs font-semibold text-primary">Suggested compliant replacement</p>
                      <p className="text-sm text-foreground">Replace with safe, RRA-compliant wording that keeps the listing strong.</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-medium text-primary">
                      <Lock className="h-3.5 w-3.5" />
                      Sign up free to reveal the fix
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Conversion card */}
            <Card className="border-2 border-primary bg-primary/5 animate-[tenancy-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Fix every issue in one click</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Create a free Tenancy account to reveal a safe, drop-in replacement for each flagged phrase — plus generate fully compliant listings and Material Information packs from scratch.
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="transition-transform active:scale-[0.98]">
                    <Link href="/auth/signup">Sign up free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/pricing">See plans</Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">No credit card · 5 free listings/month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trust footer */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          This free checker flags common breaches and is not legal advice. For complex cases, consult a solicitor, the{" "}
          <a href="[nrla.org.uk](https://nrla.org.uk)" target="_blank" rel="noopener" className="underline">NRLA</a>, or{" "}
          <a href="[gov.uk](https://gov.uk)" target="_blank" rel="noopener" className="underline">gov.uk</a>.
        </p>
      </div>
    </div>
  )
}
