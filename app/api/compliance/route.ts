import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    // Gate to Lister/Team
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.tier !== "lister" && profile.tier !== "team")) {
      return NextResponse.json({ error: "Compliance Checker requires the Lister plan." }, { status: 403 })
    }

    const { text } = await request.json()

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json({ error: "Please paste at least a sentence to scan." }, { status: 400 })
    }

    if (text.length > 8000) {
      return NextResponse.json({ error: "Text too long. Please keep listings under 8,000 characters." }, { status: 400 })
    }

    const prompt = `You are a UK Fair Housing compliance auditor. Analyse this property listing for language that could violate the Equality Act 2010 or be considered discriminatory under UK housing law.

PROTECTED CHARACTERISTICS (Equality Act 2010):
- Age
- Disability
- Gender reassignment
- Marriage and civil partnership
- Pregnancy and maternity
- Race
- Religion or belief
- Sex
- Sexual orientation

ALSO FLAG:
- DSS/benefits discrimination ("no DSS", "no benefits", "professionals only")
- Subjective safety claims that could be coded language ("safe area", "low crime")
- Outdated disability terminology ("wheelchair bound", "handicapped")
- Phrases that imply preference for specific household types ("perfect for young families", "bachelor pad")

LISTING TEXT TO ANALYSE:
"""
${text}
"""

Output a JSON array of findings. Each finding should have:
- "phrase": the exact problematic phrase from the text (must be a direct quote)
- "category": one of "Age", "Familial Status", "Disability", "Religion", "Race / Ethnicity", "Sex / Gender", "DSS / Benefits", "Liability / Coded Language", "Other"
- "severity": "high", "medium", or "low"
- "reason": one short sentence explaining why it's risky
- "alternative": a compliant rewording of the phrase

If no issues are found, return an empty array: []

Output ONLY the JSON array. No preamble, no explanation, no markdown code fences. Start your response with [ and end with ].`

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const fullText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim()

    // Strip markdown fences and try to find the JSON array within the response
    let cleaned = fullText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

    // If there's prose around it, find the array
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      cleaned = arrayMatch[0]
    }

    let findings: Array<{ phrase: string; category: string; severity: string; reason: string; alternative: string }> = []
    try {
      findings = JSON.parse(cleaned)
      if (!Array.isArray(findings)) findings = []
    } catch {
      console.error("Failed to parse compliance JSON. Raw output:", fullText.slice(0, 500))
      return NextResponse.json({ error: "Compliance scan returned an unexpected format. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ findings })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Compliance error:", msg)
    return NextResponse.json({ error: "Failed to run compliance check." }, { status: 500 })
  }
}
