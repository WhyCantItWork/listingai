"use client"

import { useState } from "react"
import { Shield, AlertTriangle, Check, RefreshCw, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

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
    // Case-insensitive first occurrence replacement
    const idx = text.toLowerCase().indexOf(finding.phrase.toLowerCase())
    if (idx === -1) return
    const before = text.slice(0, idx)
    const after = text.slice(idx + finding.phrase.length)
    const newText = before + finding.alternative + after
    setText(newText)
    setFindings((prev) => prev?.filter((f) => f !== finding) ?? null)
  }

  const handleReplaceAll = () => {
    if (!findings) return
    let newText = text
    findings.forEach((f) => {
      const idx = newText.toLowerCase().indexOf(f.phrase.toLowerCase())
      if (idx !== -1) {
        newText = newText.slice(0, idx) + f.alternative + newText.slice(idx + f.phrase.length)
      }
    })
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
        <p className="mt-2 text-muted-foreground">AI-powered Fair Housing scan. Paste your listing, click <strong>Run check</strong>, and ListingAI will flag risky language with explanations and safer alternatives.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Listing
            </CardTitle>
            <CardDescription>
              Paste the full listing description below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="listing-text" className="sr-only">
              Listing text
            </Label>
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysing with AI...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Run check
                </>
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
                    <>
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      Results
                    </>
                  ) : findings.length === 0 ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      All Clear
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      {findings.length} issue{findings.length !== 1 ? "s" : ""} found
                    </>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {findings === null && "Click Run check to analyse your listing."}
                  {findings !== null && findings.length === 0 && "No Fair Housing risks detected."}
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
                  ListingAI is reading your listing carefully...
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
                  No Fair Housing risks or problematic language detected.
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
                      <span className="truncate">Replace with: &ldquo;{f.alternative}&rdquo;</span>
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
            This tool uses AI to analyse listings against the UK <strong>Equality Act 2010</strong>, which protects individuals from discrimination based on age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation.
          </p>
          <p>
            It also flags DSS/benefits discrimination and subjective safety claims that can be considered coded discriminatory language.
          </p>
          <p className="text-xs">
            <strong>Disclaimer:</strong> This is an automated tool and not a substitute for legal advice. Always consult a qualified property law professional if you're unsure about a listing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
