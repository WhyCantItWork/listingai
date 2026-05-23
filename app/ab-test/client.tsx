"use client"

import { useState, useEffect } from "react"
import { Split, Play, RotateCcw, Trophy, TrendingUp, Eye, MousePointer, Loader2, Lightbulb, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface VariantScores {
  hookStrength: number
  clarity: number
  emotionalAppeal: number
  completeness: number
  complianceRisk: number
  engagementScore: number
  predictedCTR: number
}

interface TestResults {
  variantA: VariantScores
  variantB: VariantScores
  winner: "A" | "B" | "tie"
  winnerReason: string
  aImprovements: string[]
  bImprovements: string[]
}

export function ABTestClient() {
  const [variantA, setVariantA] = useState("")
  const [variantB, setVariantB] = useState("")
  const [results, setResults] = useState<TestResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
  const pending = localStorage.getItem("tenancy-pending-ab-test")
  if (pending) {
    try {
      const { variantA: a, variantB: b } = JSON.parse(pending)
      if (a) setVariantA(a)
      if (b) setVariantB(b)
    } catch {}
    localStorage.removeItem("tenancy-pending-ab-test")
  }
}, [])


  const runTest = async () => {
    if (!variantA.trim() || !variantB.trim()) return
    setIsRunning(true)
    setError(null)
    setResults(null)

    try {
      const res = await fetch("/api/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantA, variantB }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to run A/B test")
      setResults(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setError(msg)
    } finally {
      setIsRunning(false)
    }
  }

  const resetTest = () => {
    setVariantA("")
    setVariantB("")
    setResults(null)
    setError(null)
  }

  const ScoreBar = ({
    label, valueA, valueB, suffix = "", max = 100,
  }: { label: string; valueA: number; valueB: number; suffix?: string; max?: number }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Variant A</span>
            <span className="font-medium text-primary">{valueA}{suffix}</span>
          </div>
          <Progress value={(valueA / max) * 100} className="h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Variant B</span>
            <span className="font-medium text-accent">{valueB}{suffix}</span>
          </div>
          <Progress value={(valueB / max) * 100} className="h-2" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Split className="h-8 w-8 text-primary" />
          A/B Test
        </h1>
        <p className="mt-2 text-muted-foreground">
          Compare two listing variants. Tenancy reads both, scores them on hook, clarity, completeness, and compliance, and predicts which will perform better on UK property portals.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">A</span>
              Variant A
            </CardTitle>
            <CardDescription>Paste or type your first listing variant.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="variantA" className="sr-only">Variant A</Label>
            <Textarea id="variantA" placeholder="Paste your first listing description here..."
              value={variantA} onChange={(e) => setVariantA(e.target.value)} rows={12} className="resize-none" />
            <p className="mt-2 text-xs text-muted-foreground text-right">
              {variantA.length} / 8000 characters
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">B</span>
              Variant B
            </CardTitle>
            <CardDescription>Paste or type your second listing variant.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="variantB" className="sr-only">Variant B</Label>
            <Textarea id="variantB" placeholder="Paste your second listing description here..."
              value={variantB} onChange={(e) => setVariantB(e.target.value)} rows={12} className="resize-none" />
            <p className="mt-2 text-xs text-muted-foreground text-right">
              {variantB.length} / 8000 characters
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button onClick={runTest}
          disabled={isRunning || !variantA.trim() || !variantB.trim() || variantA.length > 8000 || variantB.length > 8000}
          size="lg">
          {isRunning ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysing with AI...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Run AI Analysis</>
          )}
        </Button>
        <Button onClick={resetTest} variant="outline" size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-500">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-8 space-y-6">
          {/* Winner */}
          <Card className={`border-2 ${
            results.winner === "tie" ? "border-muted bg-muted/20"
            : results.winner === "A" ? "border-primary bg-primary/5"
            : "border-accent bg-accent/5"
          }`}>
            <CardContent className="py-6">
              <div className="text-center">
                <Trophy className={`mx-auto mb-2 h-10 w-10 ${
                  results.winner === "tie" ? "text-muted-foreground"
                  : results.winner === "A" ? "text-primary"
                  : "text-accent"
                }`} />
                <h2 className="text-xl font-bold text-foreground">
                  {results.winner === "tie" ? "It's a Draw" : `Variant ${results.winner} Wins`}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
                  {results.winnerReason}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed scores */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Detailed Scoring</CardTitle>
              <CardDescription>AI-powered analysis across six performance dimensions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScoreBar label="Hook Strength" valueA={results.variantA.hookStrength} valueB={results.variantB.hookStrength} />
              <ScoreBar label="Clarity & Structure" valueA={results.variantA.clarity} valueB={results.variantB.clarity} />
              <ScoreBar label="Emotional Appeal" valueA={results.variantA.emotionalAppeal} valueB={results.variantB.emotionalAppeal} />
              <ScoreBar label="Completeness" valueA={results.variantA.completeness} valueB={results.variantB.completeness} />
              <ScoreBar label="Compliance Safety" valueA={results.variantA.complianceRisk} valueB={results.variantB.complianceRisk} />
              <ScoreBar label="Predicted CTR" valueA={results.variantA.predictedCTR} valueB={results.variantB.predictedCTR} suffix="%" max={15} />
            </CardContent>
          </Card>

          {/* Improvements */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Suggestions for Variant A
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.aImprovements.length > 0 ? (
                  <ul className="space-y-2 text-sm text-foreground">
                    {results.aImprovements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No improvements suggested.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Suggestions for Variant B
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.bImprovements.length > 0 ? (
                  <ul className="space-y-2 text-sm text-foreground">
                    {results.bImprovements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No improvements suggested.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compliance warning if either variant scored low */}
          {(results.variantA.complianceRisk < 70 || results.variantB.complianceRisk < 70) && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Compliance risk detected</p>
                    <p className="text-muted-foreground mt-1">
                      One or both variants contain language that may breach UK lettings law. Run them through the Compliance Checker before publishing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((results.variantA.engagementScore + results.variantB.engagementScore) / 2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MousePointer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best CTR</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.max(results.variantA.predictedCTR, results.variantB.predictedCTR)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gap</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.abs(results.variantA.engagementScore - results.variantB.engagementScore)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
