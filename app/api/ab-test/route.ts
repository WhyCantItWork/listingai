import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single()

    if (!profile || profile.tier !== "lister") {
      return NextResponse.json({ error: "A/B testing requires the Lister plan." }, { status: 403 })
    }

    const { variantA, variantB } = await request.json()

    if (!variantA?.trim() || !variantB?.trim()) {
      return NextResponse.json({ error: "Both variants are required." }, { status: 400 })
    }

    if (variantA.length > 8000 || variantB.length > 8000) {
      return NextResponse.json({ error: "Variants must be under 8,000 characters each." }, { status: 400 })
    }

    const prompt = `You are a UK property listings analyst. Compare two property listing variants and predict which will perform better on Rightmove, Zoopla, and OnTheMarket.

Score each variant 0-100 on these criteria:

1. **hookStrength** — Does the opening line grab attention? Does it lead with the strongest selling point (location, price, unique feature)?
2. **clarity** — Is the listing easy to scan? Are facts clear and well-organised? Is it free from jargon and clichés?
3. **emotionalAppeal** — Does it help the reader picture themselves there? Sensory language, lifestyle hints, atmosphere — without crossing into purple prose.
4. **completeness** — Does it answer the questions UK buyers/tenants actually ask: location, transport, size, condition, key features, availability?
5. **complianceRisk** — Inverted score (100 = no risk, 0 = high risk). Penalise Equality Act breaches, "no DSS"-type language, banned fees, subjective safety claims.

Then predict:
6. **engagementScore** (0-100) — overall predicted performance, weighted average of above
7. **predictedCTR** (0-15) — predicted click-through rate as a percentage when shown in search results

VARIANT A:
"""
${variantA}
"""

VARIANT B:
"""
${variantB}
"""

Output a JSON object with this exact shape (no markdown, no preamble):

{
  "variantA": {
    "hookStrength": <number>,
    "clarity": <number>,
    "emotionalAppeal": <number>,
    "completeness": <number>,
    "complianceRisk": <number>,
    "engagementScore": <number>,
    "predictedCTR": <number>
  },
  "variantB": { ... same shape ... },
  "winner": "A" | "B" | "tie",
  "winnerReason": "<2-3 sentence explanation of why the winner is stronger>",
  "aImprovements": ["<concrete suggestion 1>", "<concrete suggestion 2>"],
  "bImprovements": ["<concrete suggestion 1>", "<concrete suggestion 2>"]
}

Rules:
- "tie" only if both totals are within 5 points
- Improvements must be specific and actionable, not generic ("add a CTA" is bad, "lead with the location instead of 'beautiful'" is good)
- Maximum 3 improvements per variant
- Output ONLY the JSON. No markdown fences, no explanation before or after.`

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

    // Strip markdown fences if present
    let cleaned = fullText.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim()
    const objectMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objectMatch) cleaned = objectMatch[0]

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      console.error("Failed to parse A/B test JSON:", fullText.slice(0, 500))
      return NextResponse.json({ error: "Analysis returned an unexpected format. Please try again." }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("A/B test error:", msg)
    return NextResponse.json({ error: "Failed to run A/B test." }, { status: 500 })
  }
}
