"use client"

import { useState, useEffect, useCallback } from "react"
import { Shield, AlertTriangle, Check, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Violation {
  id: string
  phrase: string
  reason: string
  suggestion: string
  startIndex: number
  endIndex: number
}

// Fair Housing Act violations and problematic language patterns
const violationPatterns: Array<{
  pattern: RegExp
  reason: string
  suggestion: string
}> = [
  {
    pattern: /\b(perfect for (young |single )?professionals?\b)/gi,
    reason: "May imply preference for certain age groups or family status",
    suggestion: "ideal for those seeking convenience",
  },
  {
    pattern: /\b(ideal for (young |single )?couples?\b)/gi,
    reason: "May discriminate based on family status",
    suggestion: "well-suited for any household",
  },
  {
    pattern: /\b(no children|adults only|mature persons?)\b/gi,
    reason: "Discriminates against families with children",
    suggestion: "all welcome",
  },
  {
    pattern: /\b(bachelor pad)\b/gi,
    reason: "May imply preference for single males",
    suggestion: "one-bedroom flat",
  },
  {
    pattern: /\b(man cave)\b/gi,
    reason: "May imply gender preference",
    suggestion: "home office or hobby room",
  },
  {
    pattern: /\b(walking distance to (church|mosque|temple|synagogue))\b/gi,
    reason: "May imply religious preference",
    suggestion: "near local amenities",
  },
  {
    pattern: /\b(Christian|Muslim|Jewish|Hindu) (area|neighbourhood|community)\b/gi,
    reason: "Discriminates based on religion",
    suggestion: "welcoming community",
  },
  {
    pattern: /\b(ethnic|oriental|foreign)\b/gi,
    reason: "May be considered discriminatory language",
    suggestion: "diverse",
  },
  {
    pattern: /\b(no DSS|no benefits|working (professionals?|people) only)\b/gi,
    reason: "May discriminate against benefit recipients",
    suggestion: "suitable references required",
  },
  {
    pattern: /\b(wheelchair bound|handicapped|crippled|invalid)\b/gi,
    reason: "Outdated or offensive disability terminology",
    suggestion: "wheelchair user or person with disability",
  },
  {
    pattern: /\b(able[- ]bodied)\b/gi,
    reason: "May exclude persons with disabilities",
    suggestion: "all welcome",
  },
  {
    pattern: /\b(family[-\s]?friendly neighbourhood)\b/gi,
    reason: "May imply preference for families, excluding singles",
    suggestion: "welcoming neighbourhood",
  },
  {
    pattern: /\b(safe (for|neighbourhood)|low crime)\b/gi,
    reason: "May be coded language implying racial composition",
    suggestion: "pleasant area",
  },
  {
    pattern: /\b(traditional|English-speaking) (area|neighbourhood)\b/gi,
    reason: "May imply national origin preference",
    suggestion: "established neighbourhood",
  },
  {
    pattern: /\b(exclusive|prestigious) (area|neighbourhood|enclave)\b/gi,
    reason: "May be interpreted as exclusionary",
    suggestion: "sought-after location",
  },
  {
    pattern: /\b(near (good|excellent) schools)\b/gi,
    reason: "May imply preference for families over other groups",
    suggestion: "convenient local amenities",
  },
  {
    pattern: /\b(mother-in-law suite)\b/gi,
    reason: "May imply family status preference",
    suggestion: "annexe or self-contained flat",
  },
  {
    pattern: /\b(great for entertaining)\b/gi,
    reason: "Could be seen as implying a lifestyle preference",
    suggestion: "spacious living areas",
  },
]

export default function CompliancePage() {
  const [text, setText] = useState("")
  const [violations, setViolations] = useState<Violation[]>([])

  const scanText = useCallback((input: string): Violation[] => {
    const found: Violation[] = []

    violationPatterns.forEach((vp) => {
      let match
      const regex = new RegExp(vp.pattern.source, vp.pattern.flags)
      while ((match = regex.exec(input)) !== null) {
        found.push({
          id: `${match.index}-${match[0]}`,
          phrase: match[0],
          reason: vp.reason,
          suggestion: vp.suggestion,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        })
      }
    })

    // Sort by position in text
    return found.sort((a, b) => a.startIndex - b.startIndex)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setViolations(scanText(text))
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [text, scanText])

  const handleReplace = (violation: Violation) => {
    const before = text.slice(0, violation.startIndex)
    const after = text.slice(violation.endIndex)
    setText(before + violation.suggestion + after)
  }

  const handleReplaceAll = () => {
    let newText = text
    // Process violations from end to start to preserve indices
    const sortedViolations = [...violations].sort(
      (a, b) => b.startIndex - a.startIndex
    )
    sortedViolations.forEach((v) => {
      const before = newText.slice(0, v.startIndex)
      const after = newText.slice(v.endIndex)
      newText = before + v.suggestion + after
    })
    setText(newText)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Shield className="h-8 w-8 text-primary" />
          Compliance Checker
        </h1>
        <p className="mt-2 text-muted-foreground">
          Scan your listings for Fair Housing violations and problematic language.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Panel */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Listing
            </CardTitle>
            <CardDescription>
              Paste your listing text below. It will be scanned automatically as you
              type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="listing-text" className="sr-only">
              Listing text
            </Label>
            <Textarea
              id="listing-text"
              placeholder="Paste your property listing here to scan for compliance issues...

Example: This charming 3-bed house is perfect for young professionals, within walking distance to church and located in a traditional English neighbourhood."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={16}
              className="resize-none font-mono text-sm"
            />
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{text.length} characters</span>
              <span>{text.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  {violations.length === 0 ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      All Clear
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      {violations.length} Issue{violations.length !== 1 ? "s" : ""}{" "}
                      Found
                    </>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {violations.length === 0
                    ? "No compliance issues detected in your text."
                    : "Click the suggestion to replace problematic phrases."}
                </CardDescription>
              </div>
              {violations.length > 1 && (
                <Button size="sm" onClick={handleReplaceAll} variant="outline">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Replace All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {violations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  Your listing looks compliant!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No Fair Housing violations or problematic language detected.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="rounded-lg border border-warning/30 bg-warning/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-warning/50 bg-warning/10 text-warning"
                          >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Issue
                          </Badge>
                        </div>
                        <p className="mt-2 font-medium text-foreground">
                          &ldquo;{violation.phrase}&rdquo;
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {violation.reason}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleReplace(violation)}
                      variant="secondary"
                      size="sm"
                      className="mt-3 w-full justify-start"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Replace with: &ldquo;{violation.suggestion}&rdquo;
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <Card className="mt-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">About Fair Housing Compliance</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            The Equality Act 2010 protects individuals from discrimination in housing
            based on protected characteristics including age, disability, gender
            reassignment, marriage and civil partnership, pregnancy and maternity,
            race, religion or belief, sex, and sexual orientation.
          </p>
          <p className="mt-4">
            This tool helps identify potentially problematic language, but is not a
            substitute for legal advice. Always consult with a property law
            professional if you&apos;re unsure about your listing content.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
