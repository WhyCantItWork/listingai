"use client"

import { useState } from "react"
import { Split, Play, RotateCcw, Trophy, TrendingUp, Eye, MousePointer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface TestResults {
  variantA: {
    engagementScore: number
    predictedCTR: number
    readabilityScore: number
    emotionalAppeal: number
  }
  variantB: {
    engagementScore: number
    predictedCTR: number
    readabilityScore: number
    emotionalAppeal: number
  }
  winner: "A" | "B" | "tie"
}

export function ABTestClient() {
  const [variantA, setVariantA] = useState("")
  const [variantB, setVariantB] = useState("")
  const [results, setResults] = useState<TestResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runSimulation = async () => {
    if (!variantA.trim() || !variantB.trim()) return

    setIsRunning(true)
    setResults(null)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate mock scores based on text characteristics
    const analyzeText = (text: string) => {
      const wordCount = text.split(/\s+/).length
      const hasNumbers = /\d/.test(text)
      const hasEmotionalWords =
        /beautiful|stunning|exceptional|perfect|dream|luxury|charming|spacious|bright/i.test(
          text
        )
      const hasCTA = /contact|call|view|arrange|book/i.test(text)

      const baseScore = Math.min(100, 40 + wordCount * 0.3)
      const emotionalBonus = hasEmotionalWords ? 15 : 0
      const ctaBonus = hasCTA ? 10 : 0
      const numberBonus = hasNumbers ? 5 : 0

      return {
        engagementScore: Math.min(
          100,
          Math.round(baseScore + emotionalBonus + Math.random() * 10)
        ),
        predictedCTR: Math.min(
          15,
          parseFloat((2 + (emotionalBonus + ctaBonus) / 10 + Math.random() * 3).toFixed(1))
        ),
        readabilityScore: Math.min(
          100,
          Math.round(60 + (wordCount < 200 ? 20 : 0) + Math.random() * 15)
        ),
        emotionalAppeal: Math.min(
          100,
          Math.round(
            40 + emotionalBonus + numberBonus + Math.random() * 20
          )
        ),
      }
    }

    const aResults = analyzeText(variantA)
    const bResults = analyzeText(variantB)

    const aTotal =
      aResults.engagementScore +
      aResults.predictedCTR * 5 +
      aResults.readabilityScore +
      aResults.emotionalAppeal
    const bTotal =
      bResults.engagementScore +
      bResults.predictedCTR * 5 +
      bResults.readabilityScore +
      bResults.emotionalAppeal

    const winner: "A" | "B" | "tie" =
      Math.abs(aTotal - bTotal) < 10 ? "tie" : aTotal > bTotal ? "A" : "B"

    setResults({
      variantA: aResults,
      variantB: bResults,
      winner,
    })
    setIsRunning(false)
  }

  const resetTest = () => {
    setVariantA("")
    setVariantB("")
    setResults(null)
  }

  const ScoreBar = ({
    label,
    valueA,
    valueB,
    suffix = "",
    max = 100,
  }: {
    label: string
    valueA: number
    valueB: number
    suffix?: string
    max?: number
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Variant A</span>
            <span className="font-medium text-primary">
              {valueA}
              {suffix}
            </span>
          </div>
          <Progress value={(valueA / max) * 100} className="h-2" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Variant B</span>
            <span className="font-medium text-accent">
              {valueB}
              {suffix}
            </span>
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
          Compare two listing variants and see which performs better.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                A
              </span>
              Variant A
            </CardTitle>
            <CardDescription>Paste or type your first listing variant.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="variantA" className="sr-only">
              Variant A
            </Label>
            <Textarea
              id="variantA"
              placeholder="Paste your first listing description here..."
              value={variantA}
              onChange={(e) => setVariantA(e.target.value)}
              rows={12}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                B
              </span>
              Variant B
            </CardTitle>
            <CardDescription>Paste or type your second listing variant.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="variantB" className="sr-only">
              Variant B
            </Label>
            <Textarea
              id="variantB"
              placeholder="Paste your second listing description here..."
              value={variantB}
              onChange={(e) => setVariantB(e.target.value)}
              rows={12}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button
          onClick={runSimulation}
          disabled={isRunning || !variantA.trim() || !variantB.trim()}
          size="lg"
        >
          {isRunning ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Analysing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Simulation
            </>
          )}
        </Button>
        <Button onClick={resetTest} variant="outline" size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-6">
          {/* Winner Banner */}
          <Card
            className={`border-2 ${
              results.winner === "tie"
                ? "border-muted bg-muted/20"
                : results.winner === "A"
                  ? "border-primary bg-primary/5"
                  : "border-accent bg-accent/5"
            }`}
          >
            <CardContent className="flex items-center justify-center py-6">
              <div className="text-center">
                <Trophy
                  className={`mx-auto mb-2 h-10 w-10 ${
                    results.winner === "tie"
                      ? "text-muted-foreground"
                      : results.winner === "A"
                        ? "text-primary"
                        : "text-accent"
                  }`}
                />
                <h2 className="text-xl font-bold text-foreground">
                  {results.winner === "tie"
                    ? "It's a Draw!"
                    : `Variant ${results.winner} Wins!`}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {results.winner === "tie"
                    ? "Both variants perform similarly. Consider other factors."
                    : `Variant ${results.winner} is predicted to perform better overall.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Performance Comparison</CardTitle>
              <CardDescription>
                Predicted scores based on AI analysis of your listing copy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScoreBar
                label="Engagement Score"
                valueA={results.variantA.engagementScore}
                valueB={results.variantB.engagementScore}
              />
              <ScoreBar
                label="Predicted Click-Through Rate"
                valueA={results.variantA.predictedCTR}
                valueB={results.variantB.predictedCTR}
                suffix="%"
                max={15}
              />
              <ScoreBar
                label="Readability Score"
                valueA={results.variantA.readabilityScore}
                valueB={results.variantB.readabilityScore}
              />
              <ScoreBar
                label="Emotional Appeal"
                valueA={results.variantA.emotionalAppeal}
                valueB={results.variantB.emotionalAppeal}
              />
            </CardContent>
          </Card>

          {/* Metric Cards */}
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
                      {Math.round(
                        (results.variantA.engagementScore +
                          results.variantB.engagementScore) /
                          2
                      )}
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
                      {Math.max(
                        results.variantA.predictedCTR,
                        results.variantB.predictedCTR
                      )}
                      %
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
                    <p className="text-sm text-muted-foreground">Improvement</p>
                    <p className="text-2xl font-bold text-foreground">
                      {results.winner === "tie"
                        ? "0%"
                        : `+${Math.abs(
                            Math.round(
                              ((results.variantA.predictedCTR -
                                results.variantB.predictedCTR) /
                                Math.min(
                                  results.variantA.predictedCTR,
                                  results.variantB.predictedCTR
                                )) *
                                100
                            )
                          )}%`}
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
