import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const TIER_LIMITS: Record<string, number | null> = {
  free: 5,
  pro: 100,
  lister: null,
}

const toneDescriptions: Record<string, string> = {
  professional: "professional, informative, business-like",
  warm: "warm, welcoming, conversational without being twee",
  modern: "punchy, modern, scan-friendly, no fluff",
  luxurious: "refined, aspirational, premium",
  concise: "short, factual, no extra adjectives",
  story: "narrative-led, sensory, paints a picture",
}

const audienceDescriptions: Record<string, string> = {
  general: "general audience — broad appeal across tenant types",
  "young-professional": "young professionals — emphasise commute, modern features, lifestyle",
  "families": "households needing space — emphasise rooms, storage, garden, area amenities",
  "students": "student renters — emphasise location to uni, transport, bills inclusive",
  "downsizer": "downsizers — emphasise ease, low maintenance, quiet area",
  "corporate-let": "corporate let — emphasise furnishings, central location, professional finish",
}

const lengthDescriptions: Record<string, string> = {
  short: "100-130 words",
  medium: "180-220 words",
  long: "280-340 words",
}

const propertyTypeNames: Record<string, string> = {
  flat: "flat",
  studio: "studio flat",
  terraced: "terraced house",
  "semi-detached": "semi-detached house",
  detached: "detached house",
  bungalow: "bungalow",
  hmo: "HMO",
  maisonette: "maisonette",
  other: "property",
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
      .select("tier, listings_used, listings_reset_at")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 })
    }

    const resetAt = profile.listings_reset_at ? new Date(profile.listings_reset_at) : new Date()
    const daysSinceReset = (Date.now() - resetAt.getTime()) / (1000 * 60 * 60 * 24)
    let listingsUsed = profile.listings_used || 0
    if (daysSinceReset >= 30) {
      await supabase
        .from("profiles")
        .update({ listings_used: 0, listings_reset_at: new Date().toISOString() })
        .eq("id", user.id)
      listingsUsed = 0
    }

    const effectiveLimit = TIER_LIMITS[profile.tier] ?? null

    if (effectiveLimit !== null && listingsUsed >= effectiveLimit) {
      let message: string
      if (profile.tier === "free") {
        message = "You've used your 5 free listings this month. Upgrade to Pro for 100 listings/month, or wait until next month."
      } else if (profile.tier === "pro") {
        message = `You've used your ${effectiveLimit} Pro listings this month. Upgrade to Lister for unlimited generations.`
      } else {
        message = "You've used your listings this month."
      }
      return NextResponse.json(
        {
          error: "limit_reached",
          message,
          used: listingsUsed,
          limit: effectiveLimit,
        },
        { status: 402 }
      )
    }

    const body = await request.json()
    const propertyName = propertyTypeNames[body.propertyType] || body.propertyType || "property"

    const hasProFeatures = profile.tier !== "free"
    const isLister = profile.tier === "lister"
    const length = hasProFeatures && body.length ? body.length : "medium"
    const audience = hasProFeatures && body.audience ? body.audience : "general"

    // Pro can request up to 2 variants, Lister up to 3
    const maxVariants = isLister ? 3 : hasProFeatures ? 2 : 1
    const variantsRequested = body.variants ? Math.min(body.variants, maxVariants) : 1

    const forceTone = typeof body.forceTone === "string" ? body.forceTone : null

    const variantConfigs: { tone: string; audience: string }[] = []
    if (forceTone) {
      variantConfigs.push({ tone: forceTone, audience })
    } else if (variantsRequested === 1) {
      variantConfigs.push({ tone: body.tone || "professional", audience })
    } else {
      const userTone = body.tone || "professional"
      const varietyPool: { tone: string; audience: string }[] = [
        { tone: userTone, audience },
      ]
      const fallbacks = ["warm", "modern", "luxurious", "story", "concise"].filter(t => t !== userTone)
      for (let i = 1; i < variantsRequested; i++) {
        const tone = fallbacks[i - 1] || "professional"
        const altAudience = i === 1 ? "young-professional" : i === 2 ? "families" : "general"
        varietyPool.push({ tone, audience: altAudience })
      }
      for (let i = 0; i < variantsRequested; i++) {
        variantConfigs.push(varietyPool[i])
      }
    }

    const variantInstructions = variantConfigs.map((v, i) => {
      const toneDesc = toneDescriptions[v.tone] || toneDescriptions.professional
      const audDesc = audienceDescriptions[v.audience] || audienceDescriptions.general
      return `VERSION ${i + 1}: Tone "${v.tone}" — ${toneDesc}. Audience: ${audDesc}.`
    }).join("\n")

    const isMultiVariant = variantConfigs.length > 1
    const isStudentLet = audience === "students"

    const prompt = `You are a UK lettings copywriter writing for Rightmove, Zoopla, and OnTheMarket. ${isMultiVariant ? `Write ${variantConfigs.length} DISTINCT polished property listing descriptions` : "Write ONE polished property listing description"} based on the property details below.

${isMultiVariant ? `${variantInstructions}\n\nMake the versions feel genuinely different — different rhythm, different emphasis, different feel — while staying truthful to the property details.\n` : `Tone: ${toneDescriptions[variantConfigs[0].tone] || toneDescriptions.professional}\nAudience: ${audienceDescriptions[variantConfigs[0].audience] || audienceDescriptions.general}\n`}

PROPERTY
• Type: ${propertyName}
• Address: ${body.address || "Not specified"}
• Furnished: ${body.furnished || "Not specified"}
• Bedrooms: ${body.beds || "Not specified"}
• Bathrooms: ${body.baths || "Not specified"}
• Reception rooms: ${body.receptions || "Not specified"}
• Monthly rent: £${body.rent}
• Deposit: £${body.deposit || "Not specified"}

PART A
• Council tax band: ${body.councilTaxBand || "Not specified"}
• Tenure: ${body.tenure || "Not specified"}

PART B
• Construction: ${body.construction || "Not specified"}
• Heating: ${body.heating || "Not specified"}
• Broadband: ${body.broadband || "Not specified"}
• Mobile coverage: ${body.mobileCoverage || "Not specified"}
• Parking: ${body.parking || "Not specified"}
• EPC rating: ${body.epc || "Not specified"}

${body.hasPartC ? `PART C
• Flood risk: ${body.floodRisk || "None"}
• Building safety: ${body.buildingSafety || "None"}
• Restrictions: ${body.restrictions || "None"}
• Accessibility: ${body.accessibility || "None"}` : ""}

TENANCY
• Available from: ${body.availableFrom || "Immediately"}
• Min term: ${body.minTerm || "Not specified — indefinite periodic under Renters' Rights Act 2025"} months
• Max tenants: ${body.maxTenants || "Not specified"}
• Pets: ${body.petsPolicy || "Not specified"}
• Smoking: ${body.smokingAllowed ? "Allowed" : "Not allowed"}
• Bills included: ${Array.isArray(body.billsIncluded) && body.billsIncluded.length ? body.billsIncluded.join(", ") : "None"}

LENGTH: ${lengthDescriptions[length] || lengthDescriptions.medium}
KEYWORDS: ${body.keywords || "none"}

STRUCTURE FOR EACH VERSION (use these exact headers):
DESCRIPTION
[Polished paragraph(s) — flowing copy, no bullets]

KEY FEATURES
• [5-7 bullet points]

MATERIAL INFORMATION
[Lay out council tax, tenure, EPC, deposit, heating, parking — clean lines]

TENANCY TERMS
[Lay out term length, pets, smoking, bills — clean lines]

RULES
• Sound human, never templated. British English throughout.
• Comply with Equality Act 2010 — no preferences for nationality, family makeup, age, religion, etc.
• Comply with the Renters' Rights Act 2025 (now in force, since 1 May 2026):
  – No language banning or discouraging children, families, or benefit recipients (now explicitly illegal).
  – No mention of rental bidding, "offers over", "best and final offer", or competitive bidding — banned.
  – No mention of rent paid months in advance or large upfront payments — restricted.
  – No reference to fixed-term tenancies, "12-month contracts", or "Section 21" — tenancies are now indefinite periodic.
  – Avoid stating a "minimum term" — under the new Act, tenants can give 2 months' notice at any time.
  – Do not reference rent review clauses. Rent rises only via the Section 13 process (Form 4A), once a year, 2 months' notice, at no more than open market rent.
• No banned phrases under Tenant Fees Act 2019 (no admin/referencing fees mentioned).
• No subjective safety claims like "safe area".
• Do not write rent review clauses or any language allowing rent increases mid-tenancy outside the Section 13 process.
• Do not write blanket "no pets" — phrase as "pets considered on application" if the landlord wants to retain discretion.
• Do not promise quick possession for arrears — the mandatory threshold is 3 months with 4 weeks' notice.
• Do not imply landlord can recover the property at short notice — Grounds 1 and 1A require 4 months' notice and cannot be used in the first 12 months.
${isStudentLet ? `• STUDENT LET: This is aimed at students. Do NOT describe it as a "fixed academic-year tenancy", "12-month student contract", or "September to June let" as if the term is guaranteed — all tenancies are now periodic. You may mention it suits students and is close to the university, but the tenancy itself is rolling. (Landlords can recover student HMOs at the end of the academic year via possession Ground 4A, but only with prior written notice and 4 months' notice — do not state or imply a guaranteed end date in the advert.)` : ""}
• No clichés: stunning, masterpiece, nestled, must-see, paradise, etc.
${isMultiVariant ? `\nSEPARATOR: Between versions, output a single line that is exactly:\n---VARIANT---\n\nDo not output the separator before the first version or after the last version.` : ""}
`

    const response = await getAnthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: isMultiVariant ? 4000 : 1500,
      messages: [{ role: "user", content: prompt }],
    })

    const fullText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
    const rawListings = isMultiVariant
      ? fullText.split(/---VARIANT---/i).map(s => s.trim()).filter(Boolean)
      : [fullText]
    const listings = rawListings.map((content, i) => ({
      content,
      tone: variantConfigs[i]?.tone || body.tone || "professional",
      audience: variantConfigs[i]?.audience || audience,
    }))
    await supabase
      .from("profiles")
      .update({ listings_used: listingsUsed + 1 })
      .eq("id", user.id)
    return NextResponse.json({
      listing: listings[0]?.content || "",
      listings: listings.map(l => l.content),
      variants: listings,
      usage: {
        used: listingsUsed + 1,
        limit: effectiveLimit,
        tier: profile.tier,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Generation error:", msg)
    return NextResponse.json({ error: "Failed to generate listing." }, { status: 500 })
  }
}
