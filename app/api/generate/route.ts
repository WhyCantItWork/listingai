import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

interface GenerateRequest {
  propertyType: string
  address: string
  furnished: string
  beds: string
  baths: string
  receptions: string
  rent: string
  deposit: string
  councilTaxBand: string
  tenure: string
  construction: string
  heating: string
  broadband: string
  mobileCoverage: string
  parking: string
  epc: string
  hasPartC: boolean
  floodRisk: string
  buildingSafety: string
  restrictions: string
  accessibility: string
  availableFrom: string
  minTerm: string
  maxTenants: string
  billsIncluded: string[]
  petsPolicy: string
  smokingAllowed: boolean
  tone: string
  keywords: string
  length: string
  audience: string
  variants: number
}

const TIER_LIMITS: Record<string, number | null> = {
  free: 5,
  pro: 100,
  lister: null,
  team: null,
}

const toneGuides: Record<string, string> = {
  professional: "professional, informative, and trustworthy",
  warm: "warm, welcoming, and friendly without being saccharine",
  modern: "contemporary, sleek, and minimalist — short sentences, no fluff",
  luxurious: "refined and aspirational, but never crass",
  concise: "very short and scannable — minimal adjectives, just facts",
  story: "lightly narrative — start with a sensory hook, then move into the facts",
}

const lengthGuides: Record<string, string> = {
  short: "80-110 words. Punchy and scannable.",
  medium: "140-200 words. Standard Rightmove listing length.",
  long: "240-320 words. Detailed but no padding.",
}

const audienceGuides: Record<string, string> = {
  general: "Write for a broad audience. Balance broad appeal.",
  "young-professional": "Speak to young professionals. Emphasise commute, lifestyle, low maintenance.",
  families: "Speak to households needing space. Emphasise room sizes, storage, garden, schools nearby.",
  students: "Speak to students or young sharers. Emphasise location, bills included, transport.",
  downsizer: "Speak to downsizers. Emphasise low maintenance, single-floor where applicable, quiet neighbourhood.",
  "corporate-let": "Speak to corporate let / relocation tenants. Emphasise turnkey, furnished, transport.",
}

const furnishedLabels: Record<string, string> = {
  furnished: "fully furnished",
  unfurnished: "unfurnished",
  "part-furnished": "part-furnished",
}

const heatingLabels: Record<string, string> = {
  "gas-central": "gas central heating",
  electric: "electric heating",
  "heat-pump": "heat pump",
  oil: "oil heating",
  lpg: "LPG",
  biomass: "biomass / wood",
  district: "district heating",
  none: "no heating",
}

const propertyTypeLabels: Record<string, string> = {
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

const parkingLabels: Record<string, string> = {
  "off-street": "off-street parking",
  garage: "garage",
  "on-street": "on-street permit parking",
  "on-street-free": "free on-street parking",
  none: "no allocated parking",
}

const petsLabels: Record<string, string> = {
  yes: "Pets allowed",
  "case-by-case": "Pets considered on a case-by-case basis",
  no: "No pets",
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

    // Monthly reset
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

    // Calculate effective limit including any active top-ups
    const baseTierLimit = TIER_LIMITS[profile.tier] ?? null
    const now = new Date()
    const bonusExpiresAt = profile.bonus_listings_expires_at
      ? new Date(profile.bonus_listings_expires_at)
      : null
    const bonusActive = bonusExpiresAt && bonusExpiresAt > now
    const activeBonus = bonusActive ? (profile.bonus_listings || 0) : 0

    const effectiveLimit = baseTierLimit === null ? null : baseTierLimit + activeBonus

    // Enforce limit
    if (effectiveLimit !== null && listingsUsed >= effectiveLimit) {
      const hasBonus = activeBonus > 0

      let message: string
      if (profile.tier === "free") {
        message = `You've used your 5 free listings this month. Upgrade to Pro for 100 listings/month, or wait until next month.`
      } else if (profile.tier === "pro") {
        message = hasBonus
          ? `You've used all ${effectiveLimit} listings this month (${baseTierLimit} from Pro + ${activeBonus} from top-ups). Buy another top-up on your Account page, or upgrade to Lister for unlimited.`
          : `You've used your ${baseTierLimit} Pro listings this month. Buy a top-up on your Account page, or upgrade to Lister for unlimited generations.`
      } else {
        message = `You've used your listings this month.`
      }

      return NextResponse.json(
        {
          error: "limit_reached",
          message,
          used: listingsUsed,
          limit: effectiveLimit,
          baseLimit: baseTierLimit,
          bonus: activeBonus,
        },
        { status: 402 }
      )
    }


    const body: GenerateRequest = await request.json()

    // Required fields
    if (!body.propertyType || !body.address || !body.rent) {
      return NextResponse.json({ error: "Property type, address, and rent are required." }, { status: 400 })
    }

    // Pro+ gates
    const hasProFeatures = profile.tier !== "free"
    const hasMultipleVariants = profile.tier === "lister" || profile.tier === "team"
    const length = hasProFeatures && body.length ? body.length : "medium"
    const audience = hasProFeatures && body.audience ? body.audience : "general"
    const variantsRequested = hasMultipleVariants && body.variants ? Math.min(body.variants, 3) : 1

    // Label helpers
    const ptLabel = propertyTypeLabels[body.propertyType] || body.propertyType
    const furnishedLabel = furnishedLabels[body.furnished] || body.furnished
    const heatingLabel = heatingLabels[body.heating] || body.heating
    const parkingLabel = parkingLabels[body.parking] || body.parking
    const petsLabel = petsLabels[body.petsPolicy] || body.petsPolicy

    const billsLine = body.billsIncluded?.length
      ? `Bills included in rent: ${body.billsIncluded.join(", ")}.`
      : "Bills not included in rent."

    const partCSection = body.hasPartC
      ? `
PART C — Disclosed risks/restrictions:
- Flood risk: ${body.floodRisk || "none stated"}
- Building safety: ${body.buildingSafety || "none stated"}
- Restrictions: ${body.restrictions || "none stated"}
- Accessibility features: ${body.accessibility || "none stated"}
`
      : ""

    const toneGuide = toneGuides[body.tone] || toneGuides.professional
    const lengthGuide = lengthGuides[length] || lengthGuides.medium
    const audienceGuide = audienceGuides[audience] || audienceGuides.general

    const prompt = `You are a UK lettings copywriter writing for Rightmove, Zoopla, and OnTheMarket. Produce ${variantsRequested === 1 ? "ONE polished" : `${variantsRequested} DISTINCT polished`} lettings listing description${variantsRequested > 1 ? "s" : ""} based on the property details below.

PROPERTY
- Type: ${ptLabel}
- Address: ${body.address}
- Furnished status: ${furnishedLabel}
- Bedrooms: ${body.beds || "Not specified"}
- Bathrooms: ${body.baths || "Not specified"}
- Reception rooms: ${body.receptions || "Not specified"}

PART A (Material Information — mandatory)
- Monthly rent: £${body.rent}
- Deposit: £${body.deposit || "Not specified"}
- Council tax band: ${body.councilTaxBand || "Not specified"}
- Tenure: ${body.tenure}

PART B (Material Information — mandatory)
- Construction: ${body.construction}
- Heating: ${heatingLabel}
- Broadband: ${body.broadband}
- Mobile coverage: ${body.mobileCoverage}
- Parking: ${parkingLabel}
- EPC rating: ${body.epc || "Not specified"}
${partCSection}
TENANCY TERMS
- Available from: ${body.availableFrom || "Immediately"}
- Minimum term: ${body.minTerm || "12"} months
- Max tenants: ${body.maxTenants || "Not specified"}
- ${petsLabel}
- ${body.smokingAllowed ? "Smoking allowed inside" : "No smoking inside"}
- ${billsLine}

KEYWORDS (try to weave in naturally): ${body.keywords || "none"}

TONE: ${toneGuide}
LENGTH: ${lengthGuide}
AUDIENCE: ${audienceGuide}

OUTPUT FORMAT
Produce the listing in this exact format:

DESCRIPTION
[A flowing description of ${length === "short" ? "80-110" : length === "long" ? "240-320" : "140-200"} words. Open with a sensory or location hook. Naturally weave in the key facts. Close with a soft call to action like "Book a viewing today" or "Available now".]

KEY FEATURES
- [5-7 short bullet points highlighting the property's best features. Keep each under 12 words.]

MATERIAL INFORMATION
- Monthly rent: £${body.rent}
- Deposit: £${body.deposit || "Not specified"}
- Council tax band: ${body.councilTaxBand || "Not specified"}
- Tenure: ${body.tenure}
- EPC rating: ${body.epc || "Not specified"}
- Heating: ${heatingLabel}
- Construction: ${body.construction}
- Parking: ${parkingLabel}
- Broadband: ${body.broadband}
- Mobile coverage: ${body.mobileCoverage}

TENANCY TERMS
- Available from: ${body.availableFrom || "Immediately"}
- Minimum term: ${body.minTerm || "12"} months
- ${petsLabel}
- ${body.smokingAllowed ? "Smoking allowed inside" : "No smoking inside"}
- ${billsLine}

RULES
- Sound like a real UK letting agent, not a template.
- British English throughout (garden not yard, flat not apartment, etc.).
- Never violate the Equality Act 2010 (no preferences based on family makeup, religion, age, ethnicity, sex, disability, sexual orientation).
- Never use phrases like "no DSS", "professionals only", "no benefits" — these are discriminatory.
- Don't make subjective safety claims ("safe area", "low crime").
- Avoid clichés: "stunning", "masterpiece", "nestled", "must-see", "boasts", "paradise".
- Output ONLY the structured listing. No preamble, no explanation.${variantsRequested > 1 ? `\n- Separate each version with exactly: ---VERSION---` : ""}`

    const response = await getAnthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: variantsRequested === 1 ? 1500 : 3000,
      messages: [{ role: "user", content: prompt }],
    })

    const fullText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim()

    const listings = variantsRequested > 1
      ? fullText.split(/---VERSION---/i).map(s => s.trim()).filter(Boolean)
      : [fullText]

    await supabase
      .from("profiles")
      .update({ listings_used: listingsUsed + 1 })
      .eq("id", user.id)

    return NextResponse.json({
      listing: listings[0],
      listings,
      usage: {
        used: listingsUsed + 1,
        limit: TIER_LIMITS[profile.tier] ?? null,
        tier: profile.tier,
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Generation error:", msg)
    return NextResponse.json({ error: "Failed to generate listing." }, { status: 500 })
  }
}
