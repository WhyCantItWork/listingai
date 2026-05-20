import { NextRequest, NextResponse } from "next/server"

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

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()

    const propertyName = propertyTypeNames[body.propertyType] || body.propertyType
    const toneDesc = toneDescriptions[body.tone] || "professional"
    
    const amenitiesList = body.amenities.length > 0 
      ? body.amenities.join(", ") 
      : "no specific amenities listed"

    // Simulated AI-generated listing (in production, this would call an LLM API)
    const listing = generateMockListing({
      propertyName,
      address: body.address || "Prime Location",
      price: body.price || "POA",
      beds: body.beds || "3",
      baths: body.baths || "2",
      sqft: body.sqft || "1,200",
      neighbourhood: body.neighbourhood || "a desirable area",
      amenities: amenitiesList,
      tone: toneDesc,
      keywords: body.keywords,
    })

    return NextResponse.json({ listing })
  } catch {
    return NextResponse.json(
      { error: "Failed to generate listing" },
      { status: 500 }
    )
  }
}

interface ListingParams {
  propertyName: string
  address: string
  price: string
  beds: string
  baths: string
  sqft: string
  neighbourhood: string
  amenities: string
  tone: string
  keywords: string
}

function generateMockListing(params: ListingParams): string {
  const {
    propertyName,
    address,
    price,
    beds,
    baths,
    sqft,
    neighbourhood,
    amenities,
    keywords,
  } = params

  const keywordPhrase = keywords
    ? ` This ${keywords.toLowerCase()} property`
    : " This exceptional property"

  const openings = [
    `A stunning ${beds}-bedroom ${propertyName} in ${address}.`,
    `Introducing an exceptional ${beds}-bedroom ${propertyName} at ${address}.`,
    `Welcome to this magnificent ${beds}-bedroom ${propertyName} located in ${address}.`,
  ]

  const opening = openings[Math.floor(Math.random() * openings.length)]

  return `${opening}

Offered at £${price}, this beautifully presented home extends to approximately ${sqft} sq ft of well-designed living space.${keywordPhrase} features ${beds} generous bedrooms and ${baths} contemporary bathrooms, perfect for modern family life.

Key Features:
• ${beds} bedrooms (${parseInt(beds) > 1 ? "master with en-suite" : "double bedroom"})
• ${baths} bathrooms
• Approximately ${sqft} sq ft
• ${amenities}

The property is situated in ${neighbourhood || "a highly sought-after location"}, offering excellent transport links and local amenities. Whether you're a growing family or a professional couple, this home provides the perfect blend of space, style, and convenience.

An internal viewing is highly recommended to fully appreciate everything this exceptional property has to offer.

EPC Rating: C | Council Tax Band: D
Tenure: Freehold

Contact us today to arrange your private viewing.`
}
