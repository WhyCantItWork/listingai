import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}
const IP_LIMIT = 5
const IP_WINDOW_MS = 60 * 60 * 1000
const FREE_USER_MONTHLY = 5
const ipHits = new Map<string, { count: number; resetAt: number }>()
function checkIpLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS })
    return true
  }
  if (entry.count >= IP_LIMIT) return false
  entry.count++
  return true
}
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let freeUserUsed: number | null = null
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier, free_check_used, free_check_reset_at")
        .eq("id", user.id)
        .single()
      const tier = profile?.tier ?? "free"
      if (tier === "free") {
        const resetAt = profile?.free_check_reset_at ? new Date(profile.free_check_reset_at) : new Date()
        const daysSince = (Date.now() - resetAt.getTime()) / (1000 * 60 * 60 * 24)
        let used = profile?.free_check_used || 0
        if (daysSince >= 30) {
          await supabase.from("profiles")
            .update({ free_check_used: 0, free_check_reset_at: new Date().toISOString() })
            .eq("id", user.id)
          used = 0
        }
        if (used >= FREE_USER_MONTHLY) {
          return NextResponse.json(
            {
              error: "limit_reached",
              message: `You've used your ${FREE_USER_MONTHLY} free checks this month. Upgrade to Pro for the full Compliance Checker with one-click fixes.`,
            },
            { status: 402 }
          )
        }
        freeUserUsed = used
      }
      // Pro / Lister: no cap on the free checker (they have the full tool anyway)
    } else {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") || "unknown"
      if (!checkIpLimit(ip)) {
        return NextResponse.json(
          { error: "rate_limited", message: "You've used your free checks for now. Sign up free for more — no card required." },
          { status: 429 }
        )
      }
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
    if (user && freeUserUsed !== null) {
      await supabase.from("profiles")
        .update({ free_check_used: freeUserUsed + 1 })
        .eq("id", user.id)
    }
    return NextResponse.json({ findings })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Free check error:", msg)
    return NextResponse.json({ error: "Failed to run check." }, { status: 500 })
  }
}