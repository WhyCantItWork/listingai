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
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, compliance_used, compliance_reset_at")
      .eq("id", user.id)
      .single()
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 })
    }
    const COMPLIANCE_LIMITS: Record<string, number | null> = {
      free: 0,
      pro: 75,
      lister: null, // unlimited
    }
    // Free (or any unknown tier) has no access. Lister = null = unlimited.
    if (profile.tier === "free" || !(profile.tier in COMPLIANCE_LIMITS)) {
      return NextResponse.json(
        { error: "Compliance Checker requires Pro (75/month) or Lister (unlimited). Upgrade to unlock." },
        { status: 403 }
      )
    }
    const complianceLimit = COMPLIANCE_LIMITS[profile.tier]
    const resetAt = profile.compliance_reset_at ? new Date(profile.compliance_reset_at) : new Date()
    const daysSinceReset = (Date.now() - resetAt.getTime()) / (1000 * 60 * 60 * 24)
    let complianceUsed = profile.compliance_used || 0
    if (daysSinceReset >= 30) {
      await supabase
        .from("profiles")
        .update({ compliance_used: 0, compliance_reset_at: new Date().toISOString() })
        .eq("id", user.id)
      complianceUsed = 0
    }
    if (complianceLimit !== null && complianceUsed >= complianceLimit) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: `You've used your ${complianceLimit} compliance scans this month. Upgrade to Lister for unlimited scans, or wait until your monthly reset.`,
          used: complianceUsed,
          limit: complianceLimit,
        },
        { status: 402 }
      )
    }
    const { text } = await request.json()
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json({ error: "Please paste at least a sentence to scan." }, { status: 400 })
    }
    if (text.length > 8000) {
      return NextResponse.json({ error: "Text too long. Please keep listings under 8,000 characters." }, { status: 400 })
    }
    const prompt = `You are a UK lettings compliance auditor. Your job is to identify ACTUAL legal breaches in property listings — not stylistic concerns or borderline phrases.
CRITICAL RULES — READ FIRST:
1. ONLY flag phrases that would definitively breach UK law if published. Not "could be interpreted as" — actual breaches.
2. If a phrase is borderline, ambiguous, or already softened, DO NOT flag it. Move on.
3. Before flagging anything, ask yourself: "Would a tribunal actually rule this discriminatory?" If you're not confident, skip it.
4. The user has likely already cleaned this listing. Be conservative. False positives waste their time.
5. Read context. "Working applicants" in a list of inclusive language is fine. "Working applicants only" is a breach.
DO NOT FLAG:
• Any mention of "working" or "professional" unless paired with exclusionary words ("only", "preferred", "must be").
• Generic positive language ("welcome", "considered", "available to all").
• Already-softened phrases like "all working applicants welcome" — this is inclusive.
• Phrases that have been clearly neutralised in a previous edit.
• Stylistic concerns ("listing reads stiffly", "could be more friendly").
• Suggestions about adding extra clauses or disclaimers — only flag what's there, not what's missing.
ALWAYS FLAG these exact patterns (no judgment, no exceptions):
EXCLUSIONARY TENANT TYPES (high severity):
• "professional couples" / "professionals only" / "working professionals"
• "young professionals" / "mature professionals"
• "couples only" / "single occupants only"
• "perfect for couples" / "perfect for young professionals" / "perfect for [any demographic descriptor]" — implies preference, illegal under Equality Act
• "without children" / "child-free" — illegal under Renters' Rights Act 2025
• "no children" / "no kids" / "child-free"
• "no DSS" / "no benefits" / "no Universal Credit" / "no UC" / "no housing benefit"
• "British only" / "UK only" / "EU citizens preferred" / any nationality preference
• "non-smokers only" (smoking can be restricted in tenancy agreement, not pre-screened)
• "mature tenants" / "young tenants" (age discrimination)
RENTERS' RIGHTS ACT 2025 BREACHES (high severity — now in force, since 1 May 2026):
• "No children" / "no kids" / "child-free home" / "no families" — banned under the new Act.
• "No DSS" / "no benefits" / "no Universal Credit" / "no housing benefit" — banned (was already illegal, now codified).
• "Offers over", "best and final offer", "rental bidding", "highest bidder", "competitive bids" — rental bidding is banned.
• "Rent in advance", "6 months upfront", "12 months upfront", or any mention of multiple months' rent paid in advance — banned for new tenancies.
• References to "fixed-term tenancy", "12-month contract", "Section 21 notice", "two-month notice from landlord" — obsolete; all assured tenancies are now indefinite periodic.
• "Minimum term of 12 months" or any minimum tenancy term beyond what the new Act permits.
• "Landlord may move in at any time" / "Landlord reserves right to occupy" — flag: 12-month protected period applies, 4 months' notice required.
• "Rent review every [X] months" / "Rent review clause" / "Rent may be increased at landlord's discretion" — only one Section 13 increase per year permitted.
• "No pets under any circumstances" / "Strict no-pets policy" — landlords must consider requests reasonably; blanket refusal is now legally questionable.
• "Verbal agreement" / "Informal letting" / "No written contract required" — all new tenancies need a written agreement with prescribed information.
• "Quick eviction for late rent" / "Immediate possession for arrears" — mandatory arrears threshold is now 3 months with 4 weeks' notice.
BANNED FEES (high severity):
• Any "admin fee", "referencing fee", "inventory fee", "check-in fee", "check-out fee", "renewal fee"
• "Holding deposit" over 1 week's rent
• "Professional cleaning required" or "professional cleaning fee"
CODED/SUBJECTIVE LANGUAGE (medium severity):
• "Safe area" / "low crime" / "secure neighbourhood"
• "Exclusive neighbourhood" / "respectable area"
• "Wheelchair bound" / "handicapped" (use "wheelchair user" / "disabled")
If you see ANY phrase from this list, you MUST flag it on the first pass. Do not skip and do not soften.
LEGAL FRAMEWORK TO CHECK AGAINST:
1. **Equality Act 2010** — protects against discrimination on the basis of:
   • Age, disability, gender reassignment, marriage/civil partnership, pregnancy/maternity, race, religion or belief, sex, sexual orientation.
2. **DSS / Benefits discrimination** — illegal since 2020 (Tyler v Paul Carr ruling, Stevenage County Court).
   • Flag ANY mention of: "no DSS", "no benefits", "professionals only", "working professionals", "must be employed", "no housing benefit", "no Universal Credit", "no UC".
   • Even softer phrasing like "preference for working tenants" is discriminatory.
3. **Tenant Fees Act 2019** — banned fees in England.
   • Flag any mention of fees the landlord/agent can't charge: admin fees, referencing fees, inventory fees, check-in/check-out fees, renewal fees, "professional cleaning required".
   • Deposit cap: ONLY flag if the deposit is clearly more than 5 weeks' rent (annual rent under £50,000) or more than 6 weeks' rent (£50,000+).
   • If you cannot confirm the deposit exceeds the cap based on the listing alone, DO NOT flag it.
   • Do the maths before flagging: 5 weeks' rent = (monthly rent × 12 ÷ 52) × 5. Only flag if the stated deposit exceeds this number.
4. **Right to Rent (Immigration Act 2014)** — flag language that implies nationality/immigration preference.
   • "British tenants only", "UK passport holders", "EU citizens preferred", etc.
5. **Subjective safety/quality claims** that create legal liability.
   • "Safe area", "low crime", "exclusive neighbourhood", "respectable tenants only".
6. **Outdated/offensive disability terminology**.
   • "Wheelchair bound", "handicapped", "able-bodied only".
7. **Familial preference**.
   • "Perfect for young families", "ideal for couples without children", "no children", "child-free home".
SCORING GUIDE:
• HIGH severity: Outright illegal phrases ("no DSS", "British only", "no children", "wheelchair bound", banned admin fees, deposits clearly exceeding the cap).
• MEDIUM severity: Phrases that are likely problematic but contextual ("safe area", "exclusive neighbourhood").
• LOW severity: Edge cases worth flagging only if HIGH and MEDIUM are absent. Do not return a LOW finding alongside HIGH ones.
If the listing is already mostly compliant, return an empty array []. Repeated runs of the scanner should converge on [] quickly — don't invent new things to flag.
LISTING TEXT TO ANALYSE:
"""
${text}
"""
Output a JSON array of findings. Each finding must have:
• "phrase": the exact problematic phrase from the text — copy it character-for-character INCLUDING any markdown formatting (asterisks, underscores) and punctuation that appears in the original. Do not strip or clean it.
• "category": one of "DSS / Benefits", "Tenant Fees Act", "Equality Act — Familial", "Equality Act — Disability", "Equality Act — Religion", "Equality Act — Race/Nationality", "Equality Act — Age", "Equality Act — Sex/Orientation", "Right to Rent", "Liability / Coded Language", "Deposit Cap", "Other"
• "severity": "high" (illegal/banned), "medium" (risky/grey area), "low" (best practice concern)
• "reason": one short sentence explaining the legal basis
• "alternative": a SHORT drop-in replacement phrase (under 12 words, no explanation, no instructions). Must read naturally if pasted directly into the listing in place of the original phrase. If the only correct action is to delete the phrase entirely, output exactly: "[remove this phrase]"
CRITICAL: Only flag genuine breaches. If you analyse a phrase and conclude it is compliant, do NOT include it in the findings array. Empty alternatives are not allowed — if there's no clean replacement, don't flag the phrase at all.
EXAMPLES of good vs bad alternatives:
❌ BAD (explanatory, too long):
   "alternative": "Remove entirely; assess all applicants on ability to pay rent as evidenced by references and income verification."
✅ GOOD (short, drop-in):
   "alternative": "[remove this phrase]"
❌ BAD:
   "alternative": "Deposit equivalent to 5 weeks' rent (or 6 weeks if annual rent exceeds £50,000)."
✅ GOOD:
   "alternative": "Deposit equivalent to 5 weeks' rent"
❌ BAD:
   "alternative": "All applicants welcome; Right to Rent verification will be conducted in accordance with Immigration Act 2014."
✅ GOOD:
   "alternative": "All applicants welcome"
The alternative must be a phrase, not a sentence about what to do. Imagine pasting it directly into the listing.
If no issues are found, return an empty array: []
Output ONLY the JSON array. No preamble, no markdown code fences. Start with [ and end with ].`
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
    let cleaned = fullText
      .replace(/```(?:json|javascript|js)?\s*/gi, "")
      .replace(/```/g, "")
      .trim()
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
    if (complianceLimit !== null) {
      await supabase
        .from("profiles")
        .update({ compliance_used: complianceUsed + 1 })
        .eq("id", user.id)
    }
    return NextResponse.json({
      findings,
      usage: complianceLimit === null ? null : { used: complianceUsed + 1, limit: complianceLimit },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Compliance error:", msg)
    return NextResponse.json({ error: "Failed to run compliance check." }, { status: 500 })
  }
}