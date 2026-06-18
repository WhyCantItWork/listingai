"use client"

import { useState, useEffect } from "react"
import { Shield, AlertTriangle, Check, RefreshCw, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Finding {
  phrase: string
  category: string
  severity: "high" | "medium" | "low"
  reason: string
  alternative: string
}

export function ComplianceClient() {
  const [text, setText] = useState("")
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const pending = localStorage.getItem("tenancy-pending-compliance")
    if (pending) {
      setText(pending)
      localStorage.removeItem("tenancy-pending-compliance")
    }
  }, [])

  const runCheck = async () => {
    if (text.trim().length < 20) {
      setError("Please paste at least a sentence to scan.")
      return
    }

    setScanning(true)
    setError(null)
    setFindings(null)

    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to run check")
      }

      setFindings(data.findings || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
    } finally {
      setScanning(false)
    }
  }

  const handleReplace = (finding: Finding) => {
    let idx = text.toLowerCase().indexOf(finding.phrase.toLowerCase())

    if (idx === -1) {
      // Strip markdown (asterisks, underscores, pipes) and punctuation for fuzzy matching
      const stripMarkdown = (s: string) =>
        s.toLowerCase()
          .replace(/[*_|`]/g, "")
          .replace(/[.,;:!?'"]/g, "")
          .replace(/\s+/g, " ")
          .trim()

      const fuzzyPhrase = stripMarkdown(finding.phrase)
      const fuzzyText = stripMarkdown(text)
      const fuzzyIdx = fuzzyText.indexOf(fuzzyPhrase)
      if (fuzzyIdx === -1) {
        toast.error("Couldn't locate that phrase", { description: "It may have been edited or already replaced." })
        return
      }

      const significantWords = finding.phrase.replace(/[*_|`]/g, "").trim().split(/\s+/).filter(w => w.length > 2)
      const anchor = significantWords[0] || finding.phrase.split(/\s+/)[0]
      idx = text.toLowerCase().indexOf(anchor.toLowerCase())
      if (idx === -1) {
        toast.error("Couldn't locate that phrase", { description: "Try editing it manually." })
        return
      }
    }

    const isRemoval = finding.alternative.trim().toLowerCase() === "[remove this phrase]"
    const replacement = isRemoval ? "" : finding.alternative

    let endIdx = idx + finding.phrase.length
    if (endIdx > text.length || text.toLowerCase().slice(idx, endIdx) !== finding.phrase.toLowerCase()) {
      const after = text.slice(idx)
      const match = after.match(/^[^.!?]*[.!?]?/)
      endIdx = match ? idx + match[0].length : idx + finding.phrase.length
    }

    const before = text.slice(0, idx)
    const after = text.slice(endIdx)
    let newText = before + replacement + after

    if (isRemoval) {
      newText = newText.replace(/\s+([.,;:!?])\s+/g, "$1 ")
      newText = newText.replace(/([.!?])\s*[,;:]\s*/g, "$1 ")
      newText = newText.replace(/([.,;:!?])\s*[.,;:!?]+/g, "$1")
      newText = newText.replace(/([.!?])\s+([.,;:])/g, "$1")
      newText = newText.replace(/,\s*\./g, ".")
      newText = newText.replace(/\s+([.,;:!?])/g, "$1")
    }

    newText = newText.replace(/  +/g, " ").replace(/\n /g, "\n").replace(/ \n/g, "\n")
    newText = newText.replace(/(?:^|[.!?]\s+)\.\s+/g, " ")
    newText = newText.trim()

    setText(newText)
    setFindings((prev) => prev?.filter((f) => f !== finding) ?? null)
    toast.success(isRemoval ? "Phrase removed" : "Phrase replaced")
  }

  const handleReplaceAll = () => {
    if (!findings) return
    let newText = text
    findings.forEach((f) => {
      let idx = newText.toLowerCase().indexOf(f.phrase.toLowerCase())
      if (idx === -1) {
        const anchor = f.phrase.replace(/[*_|`]/g, "").trim().split(/\s+/).filter(w => w.length > 2)[0]
        if (!anchor) return
        idx = newText.toLowerCase().indexOf(anchor.toLowerCase())
        if (idx === -1) return
      }

      const isRemoval = f.alternative.trim().toLowerCase() === "[remove this phrase]"
      const replacement = isRemoval ? "" : f.alternative
      newText = newText.slice(0, idx) + replacement + newText.slice(idx + f.phrase.length)
    })

    newText = newText.replace(/\s+([.,;:!?])\s+/g, "$1 ")
    newText = newText.replace(/([.!?])\s*[,;:]\s*/g, "$1 ")
    newText = newText.replace(/([.,;:!?])\s*[.,;:!?]+/g, "$1")
    newText = newText.replace(/([.!?])\s+([.,;:])/g, "$1")
    newText = newText.replace(/,\s*\./g, ".")
    newText = newText.replace(/\s+([.,;:!?])/g, "$1")
    newText = newText.replace(/  +/g, " ").replace(/\n /g, "\n").replace(/ \n/g, "\n")
    newText = newText.replace(/(?:^|[.!?]\s+)\.\s+/g, " ")
    newText = newText.trim()

    setText(newText)
    setFindings([])
  }

  const severityColor = (s: Finding["severity"]) => {
    if (s === "high") return "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400"
    if (s === "medium") return "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    return "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-all duration-500 ease-out",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Shield className="h-8 w-8 text-primary" />
          Compliance Checker
        </h1>
        <p className="mt-2 text-muted-foreground">
          AI-powered UK lettings compliance scan. Paste your listing, click <strong>Run check</strong>, and Tenancy will flag risky language with explanations and safer alternatives.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Listing
            </CardTitle>
            <CardDescription>Paste the full listing description below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="listing-text" className="sr-only">Listing text</Label>
            <Textarea
              id="listing-text"
              placeholder="Paste your property listing here to scan for compliance issues..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
              className="resize-none text-sm transition-colors focus-visible:border-primary"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{text.length} characters · {text.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span className={text.length > 8000 ? "text-rose-500" : ""}>
                {text.length > 8000 ? "Too long (max 8,000)" : ""}
              </span>
            </div>
            <Button
              onClick={runCheck}
              disabled={scanning || text.trim().length < 20 || text.length > 8000}
              className="w-full transition-transform active:scale-[0.98]"
              size="lg"
            >
              {scanning ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysing with AI...</>
              ) : (
                <><Shield className="mr-2 h-4 w-4" /> Run check</>
              )}
            </Button>
            {error && (
              <p className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md p-3 animate-[tenancy-rise_0.3s_ease-out]">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  {findings === null ? (
                    <><Shield className="h-5 w-5 text-muted-foreground" /> Results</>
                  ) : findings.length === 0 ? (
                    <><Check className="h-5 w-5 text-green-500" /> All Clear</>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      {findings.length} issue{findings.length !== 1 ? "s" : ""} found
                    </>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {findings === null && !scanning && "Click Run check to analyse your listing."}
                  {scanning && "Scanning your listing…"}
                  {findings !== null && findings.length === 0 && "No compliance risks detected."}
                  {findings !== null && findings.length > 0 && "Review and replace problematic phrases."}
                </CardDescription>
              </div>
              {findings && findings.length > 1 && (
                <Button size="sm" onClick={handleReplaceAll} variant="outline" className="transition-transform active:scale-[0.97]">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Fix all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {findings === null && !scanning && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-[tenancy-rise_0.4s_ease-out]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your scan results will appear here.
                </p>
              </div>
            )}

            {/* Shimmer skeleton while scanning */}
            {scanning && (
              <div className="space-y-3">
                <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Tenancy is reading your listing carefully…
                </p>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-card/50 p-4 space-y-3"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="tenancy-shimmer h-5 w-28 rounded-full" />
                      <div className="tenancy-shimmer h-3 w-16 rounded" />
                    </div>
                    <div className="tenancy-shimmer h-4 w-3/4 rounded" />
                    <div className="tenancy-shimmer h-4 w-1/2 rounded" />
                    <div className="tenancy-shimmer h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
            )}

            {findings !== null && findings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-[tenancy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  Your listing looks compliant.
                </p>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  No UK lettings compliance risks detected. You can publish this listing.
                </p>
                <p className="mt-3 text-xs text-muted-foreground/70 max-w-xs">
                  💡 No need to run further checks — this listing is good to go.
                </p>
              </div>
            )}

            {findings !== null && findings.length > 0 && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {findings.map((f, i) => (
                  <div
                    key={`${f.phrase}-${i}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="rounded-lg border border-border bg-card/50 p-4 space-y-3 opacity-0 animate-[tenancy-rise_0.4s_ease-out_forwards] transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={severityColor(f.severity)}>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {f.category}
                      </Badge>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        f.severity === "high" ? "text-rose-500" :
                        f.severity === "medium" ? "text-amber-500" : "text-blue-500"
                      }`}>
                        {f.severity} risk
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        &ldquo;{f.phrase}&rdquo;
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{f.reason}</p>
                    </div>
                    <Button
                      onClick={() => handleReplace(f)}
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 transition-transform active:scale-[0.98]"
                    >
                      <RefreshCw className="mr-2 h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {f.alternative.trim().toLowerCase() === "[remove this phrase]"
                          ? "Remove this phrase"
                          : `Replace with: "${f.alternative}"`}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">About this scan</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            This tool uses AI to flag common breaches in UK lettings listings — including the <strong>Renters&apos; Rights Act 2025</strong>, <strong>Equality Act 2010</strong>, <strong>Tenant Fees Act 2019</strong>, and <strong>Tenancy Deposit Scheme</strong> rules. It catches frequent issues like DSS/benefits discrimination, rental bidding language, banned admin fees, and deposit cap violations.
          </p>
          <p>
            <strong>This is not legal advice.</strong> Tenancy is a writing checker, not a solicitor. For complex situations or genuine uncertainty, consult a qualified property law professional or check official guidance from <a href="[gov.uk](https://gov.uk)" target="_blank" rel="noopener" className="underline">gov.uk</a>, <a href="[england.shelter.org.uk](https://england.shelter.org.uk)" target="_blank" rel="noopener" className="underline">Shelter</a>, or the <a href="[nrla.org.uk](https://nrla.org.uk)" target="_blank" rel="noopener" className="underline">NRLA</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
