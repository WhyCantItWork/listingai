"use client"

import { useState, useEffect } from "react"
import { Shield, AlertTriangle, Check, RefreshCw, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  useEffect(() => {
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
  // Try exact match first
  let idx = text.toLowerCase().indexOf(finding.phrase.toLowerCase())

  // If exact fails, try fuzzy match (collapse whitespace, ignore punctuation differences)
  if (idx === -1) {
    const fuzzyPhrase = finding.phrase.toLowerCase().replace(/[.,;:!?'"]/g, "").replace(/\s+/g, " ").trim()
    const fuzzyText = text.toLowerCase().replace(/[.,;:!?'"]/g, "").replace(/\s+/g, " ")
    const fuzzyIdx = fuzzyText.indexOf(fuzzyPhrase)
    if (fuzzyIdx === -1) {
      toast.error("Couldn't locate that phrase", { description: "It may have been edited or already replaced." })
      return
    }
    // Map fuzzy index back to original — find approximate location
    const words = finding.phrase.split(/\s+/)[0]
    idx = text.toLowerCase().indexOf(words.toLowerCase())
    if (idx === -1) {
      toast.error("Couldn't locate that phrase", { description: "Try editing it manually." })
      return
    }
  }

  const isRemoval = finding.alternative.trim().toLowerCase() === "[remove this phrase]"
  const replacement = isRemoval ? "" : finding.alternative

  // Find the actual phrase boundary in original text
  let endIdx = idx + finding.phrase.length
  if (endIdx > text.length || text.toLowerCase().slice(idx, endIdx) !== finding.phrase.toLowerCase()) {
    // Fuzzy fallback — try to find next punctuation or sentence boundary
    const after = text.slice(idx)
    const match = after.match(/^[^.!?]*[.!?]?/)
    endIdx = match ? idx + match[0].length : idx + finding.phrase.length
  }

  const before = text.slice(0, idx)
  const after = text.slice(endIdx)
  const newText = (before + replacement + after).replace(/  +/g, " ")

  setText(newText)
  setFindings((prev) => prev?.filter((f) => f !== finding) ?? null)
  toast.success(isRemoval ? "Phrase removed" : "Phrase replaced")
}


  const handleReplaceAll = () => {
    if (!findings) return
    let newText = text
    findings.forEach((f) => {
      const idx = newText.toLowerCase().indexOf(f.phrase.toLowerCase())
      if (idx === -1) return
      const isRemoval = f.alternative.trim().toLowerCase() === "[remove this phrase]"
      const replacement = isRemoval ? "" : f.alternative
      newText = newText.slice(0, idx) + replacement + newText.slice(idx + f.phrase.length)
    })
    newText = newText.replace(/  +/g, " ")
    setText(newText)
    setFindings([])
  }

  const severityColor = (s: Finding["severity"]) => {
    if (s === "high") return "border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400"
    if (s === "medium") return "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
    return "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
        {/* Input */}
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
              className="resize-none text-sm"
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
              className="w-full"
              size="lg"
            >
              {scanning ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysing with AI...</>
              ) : (
                <><Shield className="mr-2 h-4 w-4" /> Run check</>
              )}
            </Button>
            {error && (
              <p className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
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
                  {findings === null && "Click Run check to analyse your listing."}
                  {findings !== null && findings.length === 0 && "No compliance risks detected."}
                  {findings !== null && findings.length > 0 && "Review and replace problematic phrases."}
                </CardDescription>
              </div>
              {findings && findings.length > 1 && (
                <Button size="sm" onClick={handleReplaceAll} variant="outline">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Fix all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {findings === null && !scanning && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Shield className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your scan results will appear here.
                </p>
              </div>
            )}

            {scanning && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  Tenancy is reading your listing carefully...
                </p>
              </div>
            )}

            {findings !== null && findings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
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
                  <div key={i} className="rounded-lg border border-border bg-card/50 p-4 space-y-3">
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
                      className="w-full justify-start text-left h-auto py-2"
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

      {/* Info section */}
      <Card className="mt-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">About this scan</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            This tool uses AI to analyse listings against UK lettings law, including the <strong>Equality Act 2010</strong>, the <strong>Tenant Fees Act 2019</strong>, and the <strong>Tenancy Deposit Scheme</strong> rules. It also catches DSS/benefits discrimination, which has been illegal since 2020 (Tyler v Paul Carr).
          </p>
          <p>
            Findings cover banned fees, deposit cap violations, Right to Rent language, and discrimination based on protected characteristics.
          </p>
          <p className="text-xs">
            <strong>Disclaimer:</strong> This is an automated tool and not a substitute for legal advice. Always consult a qualified property law professional if you're unsure about a listing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
