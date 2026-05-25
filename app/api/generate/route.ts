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
  team: null,
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
      .select("tier, listings_used, listings_reset_at, bonus_listings, bonus_listings_expires_at")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 })
    }

    // Reset usage if 30 days passed
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

    // Compute effective limit including bonus
    const baseTierLimit = TIER_LIMITS[profile.tier] ?? null
    const now = new Date()
    const bonusExpiresAt = profile.bonus_listings_expires_at
      ? new Date(profile.bonus_listings_expires_at)
      : null
    const bonusActive = bonusExpiresAt && bonusExpiresAt > now
    const activeBonus = bonusActive ? (profile.bonus_listings || 0) : 0
    const effectiveLimit = baseTierLimit === null ? null : baseTierLimit + activeBonus

    if (effectiveLimit !== null && listingsUsed >= effectiveLimit) {
      const hasBonus = activeBonus > 0
      let message: string
      if (profile.tier === "free") {
        message = "You've used your 5 free listings this month. Upgrade to Pro for 100 listings/month, or wait until next month."
      } else if (profile.tier === "pro") {
        message = hasBonus
          ? `You've used all ${effectiveLimit} listings this month (${baseTierLimit} from Pro + ${activeBonus} from top-ups). Buy another top-up on your Account page, or upgrade to Lister for unlimited.`
          : `You've used your ${baseTierLimit} Pro listings this month. Buy a top-up on your Account page, or upgrade to Lister for unlimited generations.`
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

    // Pro+ gets length and audience options
    const hasProFeatures = profile.tier !== "free"
    const hasMultipleVariants = profile.tier === "lister" || profile.tier === "team"
    const length = hasProFeatures && body.length ? body.length : "medium"
    const audience = hasProFeatures && body.audience ? body.audience : "general"
    const variantsRequested = hasMultipleVariants && body.variants ? Math.min(body.variants, 3) : 1

    // Force-tone override: when user clicks "regenerate this variant with X tone"
    const forceTone = typeof body.forceTone === "string" ? body.forceTone : null

    // Build per-variant config
    const variantConfigs: { tone: string; audience: string }[] = []
    if (forceTone) {
      // Single variant regeneration with specific tone
      variantConfigs.push({ tone: forceTone, audience })
    } else if (variantsRequested === 1) {
      variantConfigs.push({ tone: body.tone || "professional", audience })
    } else {
      // Auto-vary tones across variants
      const userTone = body.tone || "professional"
      const varietyPool: { tone: string; audience: string }[] = [
        { tone: userTone, audience },
      ]
      // Add complementary tones
      const fallbacks = ["warm", "modern", "luxurious", "story", "concise"].filter(t => t !== userTone)
      for (let i = 1; i < variantsRequested; i++) {
        const tone = fallbacks[i - 1] || "professional"
        // Vary audience too for diversity
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
• Min term: ${body.minTerm || "12"} months
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
• No banned phrases under Tenant Fees Act 2019 (no admin/referencing fees mentioned).
• No subjective safety claims like "safe area".
• No clichés: stunning, masterpiece, nestled, must-see, paradise, etc.
${isMultiVariant ? `\nSEPARATOR: Between versions, output a single line that is exactly:\n---VARIANT---\n\nDo not output the separator before the first version or after the last version.` : ""}`

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

    // Pair each listing with its tone/audience metadata
    const listings = rawListings.map((content, i) => ({
      content,
      tone: variantConfigs[i]?.tone || body.tone || "professional",
      audience: variantConfigs[i]?.audience || audience,
    }))

    // Increment usage
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
