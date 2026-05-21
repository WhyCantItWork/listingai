import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface GenerateRequest {
  propertyType: string
  address: string
  price: string
  beds: string
  baths: string
  sqft: string
  neighbourhood: string
  amenities: string[]
  tone: string
  keywords: string
  // New Pro-only options
  length?: "short" | "medium" | "long"
  audience?: string
  variants?: number
}


const TIER_LIMITS: Record<string, number | null> = {
  free: 5,
  pro: 100,
  lister: null, // unlimited
  team: null,   // unlimited
}


const toneDescriptions: Record<string, string> = {
  professional: "professional, informative, and business-like",
  luxurious: "elegant, sophisticated, and upmarket",
  warm: "warm, welcoming, and homely",
  modern: "contemporary, sleek, and minimalist",
  traditional: "classic, timeless, and heritage-focused",
  family: "family-oriented, practical, and community-focused",
}

const propertyTypeNames: Record<string, string> = {
  detached: "detached house",
  "semi-detached": "semi-detached house",
  terraced: "terraced house",
  flat: "flat",
  bungalow: "bungalow",
  cottage: "cottage",
  mansion: "mansion",
  farmhouse: "farmhouse",
}
const lengthGuides: Record<string, string> = {
  short: "80-110 words. Punchy and scannable. One short opening sentence, 3-4 key features, one closing line.",
  medium: "140-200 words. Standard MLS length. Opening hook, key features bullets, closing CTA.",
  long: "240-320 words. Full feature descriptions. Opening hook, two short paragraphs of description, key features bullets, neighbourhood paragraph, closing CTA.",
}

const audienceGuides: Record<string, string> = {
  "first-time-buyer": "Speak to first-time buyers. Emphasise affordability, ease of moving in, transport links, and low-maintenance features.",
  investor: "Speak to investors. Emphasise rental yield potential, location growth, condition, and any HMO/buy-to-let suitability.",
  downsizer: "Speak to downsizers. Emphasise low maintenance, single-floor living where applicable, quiet neighbourhood, and proximity to amenities.",
  "growing-household": "Speak to people needing more space. Emphasise room sizes, storage, garden, schools nearby, and flexible spaces.",
  general: "Write for a general audience. Balance broad appeal across all buyer types.",
}


export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    // Fetch user's tier and usage
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, listings_used, listings_reset_at")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 })
    }

    // Reset monthly counter if 30 days have passed
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


    // Enforce per-tier limit
    const tierLimit = TIER_LIMITS[profile.tier] ?? null
    if (tierLimit !== null && listingsUsed >= tierLimit) {
      const upgradePath = profile.tier === "free" ? "Pro" : "Lister"
      return NextResponse.json(
        {
          error: "limit_reached",
          message: `You've used your ${tierLimit} listings this month. Upgrade to ${upgradePath} for ${profile.tier === "free" ? "more" : "unlimited"} generations.`,
          used: listingsUsed,
          limit: tierLimit,
        },
        { status: 402 }
      )
    }


        const body: GenerateRequest = await request.json()
    const propertyName = propertyTypeNames[body.propertyType] || body.propertyType
    const toneDesc = toneDescriptions[body.tone] || "professional"
    const amenitiesList = body.amenities.length > 0 ? body.amenities.join(", ") : "none specified"

    // Pro+ gets length and audience options
    const hasProFeatures = profile.tier !== "free"
    // Lister/Team gets multiple variants; Pro is capped at 1
    const hasMultipleVariants = profile.tier === "lister" || profile.tier === "team"

    const length = hasProFeatures && body.length ? body.length : "medium"
    const audience = hasProFeatures && body.audience ? body.audience : "general"
    const variantsRequested = hasMultipleVariants && body.variants ? Math.min(body.variants, 3) : 1


    const lengthGuide = lengthGuides[length] || lengthGuides.medium
    const audienceGuide = audienceGuides[audience] || audienceGuides.general

    const prompt = `You are an expert UK estate agent copywriter. Write ${variantsRequested === 1 ? "ONE polished" : `${variantsRequested} DISTINCT polished`} MLS-ready property listing description${variantsRequested > 1 ? "s" : ""}.

PROPERTY DETAILS
- Type: ${propertyName}
- Address: ${body.address || "Not specified"}
- Asking price: £${body.price || "POA"}
- Bedrooms: ${body.beds || "Not specified"}
- Bathrooms: ${body.baths || "Not specified"}
- Size: ${body.sqft || "Not specified"} sq ft
- Neighbourhood: ${body.neighbourhood || "Not specified"}
- Key features: ${amenitiesList}
- Extra keywords: ${body.keywords || "none"}

TONE: ${toneDesc}
LENGTH: ${lengthGuide}
AUDIENCE: ${audienceGuide}

RULES
- Sound like a real human estate agent, not a template.
- Use British English throughout (garden not yard, flat not apartment, etc.).
- Include a short opening hook, a "Key Features" bulleted section, and a closing line inviting a viewing.
- Never use Fair Housing-violating language (no references to family makeup, religion, ethnicity, age, "safe area" claims).
- Avoid clichés: no "stunning", "masterpiece", "nestled", "must-see", "boasts", "paradise".
- End with: EPC, Council Tax Band, and Tenure lines (use "Available on request" if unknown).
- Output ONLY the listing text. No preamble, no explanation, no markdown formatting other than bullets.${variantsRequested > 1 ? `\n- Separate each version with exactly: ---VERSION---` : ""}`

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: variantsRequested === 1 ? 1024 : 2048,
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


       // Increment usage
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
    console.error("Error generating listing:", error)
    return NextResponse.json(
      { error: "Failed to generate listing. Please try again." },
      { status: 500 }
    )
  }
}

