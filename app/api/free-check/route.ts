import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

// Simple in-memory IP rate limit: 5 free checks per hour per IP.
// Resets on server restart — fine for a free funnel tool.
const RATE_LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000
const hits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true, remaining: RATE_LIMIT - 1 }
  }
  if (entry.count >= RATE_LIMIT) {
    return { ok: false, remaining: 0 }
  }
  entry.count++
  return { ok: true, remaining: RATE_LIMIT - entry.count }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const { ok } = checkRateLimit(ip)
    if (!ok) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: "You've used your free checks for now. Sign up free for more — no card required.",
        },
        { status: 429 }
      )
    }

    const { text } = await request.json()

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json({ error: "Please paste at least a sentence to scan." }, { status: 400 })
    }
    if (text.length > 4000) {
      return NextResponse.json(
        { error: "For the free checker, please keep listings under 4,000 characters. Sign up to scan longer listings." },
        { status: 400 }
      )
    }

    const prompt = `You are a UK lettings compliance auditor. Identify ACTUAL legal breaches in this property listing — real breaches a tribunal would rule on, not stylistic concerns. Be conservative: if a phrase is borderline or already neutral, do NOT flag it.

The Renters' Rights Act 2025 is now in force (since 1 May 2026). Flag these as breaches:
• Banning/discouraging children, families, or benefit recipients ("no children", "no DSS", "no benefits", "professionals only", "working professionals only").
• Rental bidding language ("offers over", "best and final", "highest bidder").
• Rent in advance ("6 months upfront", "X months in advance").
• Fixed-term / Section 21 references ("12-month contract", "Section 21", "minimum term of 12 months") — tenancies are now indefinite periodic.
• Blanket "no pets" / "strict no-pets policy" — requests must be considered reasonably.
• Banned fees (Tenant Fees Act 2019): admin fees, referencing fees, inventory fees, check-in/out fees, renewal fees, "professional cleaning required".
• Nationality preference (Right to Rent): "British only", "UK passport holders only".
• Subjective safety claims: "safe area", "low crime", "respectable area".
• Outdated disability terms: "wheelchair bound", "handicapped".

LISTING:
"""
${text}
"""

Output ONLY a JSON array. Each item:
• "phrase": the exact problematic phrase, copied verbatim from the text
• "category": short label, e.g. "DSS / Benefits", "Rental bidding", "Tenant Fees", "Equality Act", "Right to Rent", "Pets", "Coded language"
• "severity": "high" | "medium" | "low"
• "reason": one short sentence on the legal basis

Do NOT include any suggested replacement or fix. If no breaches, return [].
No markdown fences. Start with [ and end with ].`

    const response = await getAnthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    })

    const fullText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()

    let cleaned = fullText.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim()
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrayMatch) cleaned = arrayMatch[0]

    let findings: Array<{ phrase: string; category: string; severity: string; reason: string }> = []
    try {
      findings = JSON.parse(cleaned)
      if (!Array.isArray(findings)) findings = []
    } catch {
      console.error("Free check parse error:", fullText.slice(0, 300))
      return NextResponse.json({ error: "Scan returned an unexpected format. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ findings })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Free check error:", msg)
    return NextResponse.json({ error: "Failed to run check." }, { status: 500 })
  }
}
