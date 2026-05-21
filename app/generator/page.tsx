"use client"

import { useState, useEffect } from "react"
import {
  Home,
  Building2,
  Castle,
  TreePine,
  MapPin,
  PoundSterling,
  BedDouble,
  Bath,
  Ruler,
  Landmark,
  Sparkles,
  Copy,
  Check,
  Save,
  Loader2,
  Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import jsPDF from "jspdf"

const propertyTypes = [
  { value: "detached", label: "Detached House", icon: Home },
  { value: "semi-detached", label: "Semi-Detached House", icon: Home },
  { value: "terraced", label: "Terraced House", icon: Building2 },
  { value: "flat", label: "Flat / Apartment", icon: Building2 },
  { value: "bungalow", label: "Bungalow", icon: Home },
  { value: "cottage", label: "Cottage", icon: Castle },
  { value: "mansion", label: "Mansion / Estate", icon: Castle },
  { value: "farmhouse", label: "Farmhouse", icon: TreePine },
]

const amenities = [
  "Garden",
  "Garage",
  "Driveway",
  "Off-street parking",
  "En-suite",
  "Conservatory",
  "Home office",
  "Utility room",
  "Open-plan kitchen",
  "Period features",
  "Double glazing",
  "Central heating",
  "Underfloor heating",
  "Log burner",
  "Smart home",
  "Solar panels",
  "EV charging",
  "Swimming pool",
]

const tones = [
  { value: "professional", label: "Professional" },
  { value: "luxurious", label: "Luxurious" },
  { value: "warm", label: "Warm & Inviting" },
  { value: "modern", label: "Modern & Sleek" },
  { value: "traditional", label: "Traditional" },
  { value: "family", label: "Family-Friendly" },
]
const lengths = [
  { value: "short", label: "Short (~100 words)" },
  { value: "medium", label: "Medium (~170 words)" },
  { value: "long", label: "Long (~280 words)" },
]

const audiences = [
  { value: "general", label: "General audience" },
  { value: "first-time-buyer", label: "First-time buyers" },
  { value: "investor", label: "Investors" },
  { value: "downsizer", label: "Downsizers" },
  { value: "growing-household", label: "Growing households" },
]


interface FormData {
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
  length: string
  audience: string
  variants: number
}


export default function GeneratorPage() {
const [formData, setFormData] = useState<FormData>({
  propertyType: "",
  address: "",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  neighbourhood: "",
  amenities: [],
  tone: "professional",
  keywords: "",
  length: "medium",
  audience: "general",
  variants: 1,
})

  const [output, setOutput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tier, setTier] = useState<"free" | "pro" | "lister" | "team">("free")
  const [usage, setUsage] = useState<{ used: number; limit: number | null }>({ used: 0, limit: 5 })
  const [listings, setListings] = useState<string[]>([])
  const [activeVariant, setActiveVariant] = useState(0)



  useEffect(() => {
  const loadUser = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("tier, listings_used")
      .eq("id", user.id)
      .single()

    if (profile) {
      setTier(profile.tier)
      const tierLimits: Record<string, number | null> = { free: 5, pro: 100, lister: null, team: null }
setUsage({
  used: profile.listings_used || 0,
  limit: tierLimits[profile.tier] ?? null,
})

    }
  }
  loadUser()
}, [])


  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setOutput("")
    setSaved(false)
    try {
      const response = await fetch("/api/generate", {
        
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 402 && data.error === "limit_reached") {
      setOutput(
        `🔒 ${data.message}\n\nUpgrade to Pro at /pricing for unlimited generations.`
      )
      return
    }
    throw new Error(data.error || "Failed to generate listing")
  }

  setListings(data.listings || [data.listing])
  setActiveVariant(0)
  setOutput(data.listing)
  if (data.usage) setUsage({ used: data.usage.used, limit: data.usage.limit })
} catch (error) {
  const msg = error instanceof Error ? error.message : "Unknown error"
  setOutput(`Unable to generate listing. ${msg}`)
}
    // ensure generating state is cleared
    setIsGenerating(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
const handleDownloadPDF = () => {
  if (!output) return

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 50
  const contentWidth = pageWidth - margin * 2
  let cursorY = margin

  // Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("Property Listing", margin, cursorY)
  cursorY += 28

  // Subheader: address + price
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(100)
  if (formData.address) {
    doc.text(formData.address, margin, cursorY)
    cursorY += 16
  }
  if (formData.price) {
    doc.text(`Asking price: £${formData.price}`, margin, cursorY)
    cursorY += 16
  }

  // Divider
  doc.setDrawColor(200)
  doc.line(margin, cursorY + 4, pageWidth - margin, cursorY + 4)
  cursorY += 22

  // Body
  doc.setTextColor(20)
  doc.setFontSize(11)
  const lines = doc.splitTextToSize(output, contentWidth)
  lines.forEach((line: string) => {
    if (cursorY > pageHeight - margin - 30) {
      doc.addPage()
      cursorY = margin
    }
    doc.text(line, margin, cursorY)
    cursorY += 16
  })

  // Footer on every page
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(
      `Generated by ListingAI · listingai-beige.vercel.app`,
      margin,
      pageHeight - 25
    )
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 25,
      { align: "right" }
    )
  }

  // Filename from address (or fallback)
  const slug = (formData.address || "listing")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)

  doc.save(`listing-${slug}.pdf`)
}


  const handleSaveToVault = () => {
    const existingListings = JSON.parse(
      localStorage.getItem("listingai-vault") || "[]"
    )
    const newListing = {
      id: Date.now().toString(),
      content: output,
      address: formData.address,
      propertyType: formData.propertyType,
      price: formData.price,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(
      "listingai-vault",
      JSON.stringify([newListing, ...existingListings])
    )
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Listing Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the property details and let AI craft your perfect listing.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form Panel */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Property Details
            </CardTitle>
            <CardDescription>
              Enter the key information about your property.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="propertyType" className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                Property Type
              </Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, propertyType: value }))
                }
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Address
              </Label>
              <Input
                id="address"
                placeholder="e.g., 42 Richmond Avenue, London SW15"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <PoundSterling className="h-4 w-4 text-muted-foreground" />
                Price (GBP)
              </Label>
              <Input
                id="price"
                type="text"
                placeholder="e.g., 750,000"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>

            {/* Beds, Baths, Sqft */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beds" className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  Beds
                </Label>
                <Input
                  id="beds"
                  type="number"
                  min="0"
                  placeholder="3"
                  value={formData.beds}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, beds: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baths" className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  Baths
                </Label>
                <Input
                  id="baths"
                  type="number"
                  min="0"
                  placeholder="2"
                  value={formData.baths}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, baths: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sqft" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  Sq Ft
                </Label>
                <Input
                  id="sqft"
                  type="number"
                  min="0"
                  placeholder="1,500"
                  value={formData.sqft}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sqft: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Neighbourhood */}
            <div className="space-y-2">
              <Label htmlFor="neighbourhood" className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                Neighbourhood Description
              </Label>
              <Textarea
                id="neighbourhood"
                placeholder="e.g., Tree-lined streets, excellent schools nearby, 5 min walk to tube station, vibrant high street..."
                rows={3}
                value={formData.neighbourhood}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    neighbourhood: e.target.value,
                  }))
                }
              />
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="text-base">Amenities</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) =>
                        handleAmenityChange(amenity, checked === true)
                      }
                    />
                    <Label
                      htmlFor={amenity}
                      className="text-sm font-normal text-muted-foreground"
                    >
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tone: value }))
                }
              >
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Pro: Length */}
<div className="space-y-2">
  <Label htmlFor="length" className="flex items-center gap-2">
    Length
    {tier === "free" && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Pro</span>}
  </Label>
  <Select
    value={formData.length}
    onValueChange={(value) => setFormData((prev) => ({ ...prev, length: value }))}
    disabled={tier === "free"}
  >
    <SelectTrigger id="length">
      <SelectValue placeholder="Select length" />
    </SelectTrigger>
    <SelectContent>
      {lengths.map((l) => (
        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

{/* Pro: Audience */}
<div className="space-y-2">
  <Label htmlFor="audience" className="flex items-center gap-2">
    Target audience
    {tier === "free" && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Pro</span>}
  </Label>
  <Select
    value={formData.audience}
    onValueChange={(value) => setFormData((prev) => ({ ...prev, audience: value }))}
    disabled={tier === "free"}
  >
    <SelectTrigger id="audience">
      <SelectValue placeholder="Select audience" />
    </SelectTrigger>
    <SelectContent>
      {audiences.map((a) => (
        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

{/* Pro: Variants */}
<div className="space-y-2">
 <Label htmlFor="variants" className="flex items-center gap-2">
  Number of versions
  {(tier === "free" || tier === "pro") && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Lister</span>}
</Label>

  <Select
    value={String(formData.variants)}
    onValueChange={(value) => setFormData((prev) => ({ ...prev, variants: parseInt(value) }))}
     disabled={tier === "free" || tier === "pro"}
  >
    <SelectTrigger id="variants">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="1">1 version</SelectItem>
      <SelectItem value="2">2 versions to compare</SelectItem>
      <SelectItem value="3">3 versions to compare</SelectItem>
    </SelectContent>
  </Select>
</div>


            {/* Custom Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Custom Keywords (optional)</Label>
              <Input
                id="keywords"
                placeholder="e.g., Victorian, character, investment opportunity"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, keywords: e.target.value }))
                }
              />
            </div>
{tier === "free" && usage.limit !== null && (
  <div className="text-xs text-muted-foreground text-center pb-2">
    {usage.used} / {usage.limit} free listings used this month
    {usage.used >= usage.limit && (
      <span className="block text-amber-600 font-medium mt-1">
        🔒 Limit reached — <a href="/pricing" className="underline">Upgrade to Pro</a> for unlimited
      </span>
    )}
  </div>
)}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.propertyType}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Listing
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Generated Listing</CardTitle>
            <CardDescription>
              Your AI-generated property description will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[400px] rounded-lg border border-border bg-secondary/30 p-4">
              {output ? (
                <p className="whitespace-pre-wrap text-foreground">{output}</p>
              ) : (
                <p className="text-muted-foreground">
                  Fill in the property details and click &quot;Generate Listing&quot; to
                  see your AI-crafted description.
                </p>
              )}
            </div>
            {listings.length > 1 && (
              <div className="flex gap-2 pb-3 border-b border-border mb-3">
                <span className="text-xs uppercase font-mono opacity-60 self-center mr-2">Versions:</span>
                {listings.map((_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={activeVariant === i ? "default" : "outline"}
                    onClick={() => { setActiveVariant(i); setOutput(listings[i]); }}
                  >
                    Version {i + 1}
                  </Button>
                ))}
              </div>
            )}

            {output && (
              <div className="flex gap-3 flex-wrap">
                <Button onClick={handleCopy} variant="outline" className="flex-1 min-w-[120px]">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button onClick={handleSaveToVault} variant="outline" className="flex-1 min-w-[120px]" disabled={saved}>
                  {saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save to Vault
                    </>
                  )}
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 min-w-[120px]" disabled={tier === "free"}>
                  <Download className="mr-2 h-4 w-4" />
                  {tier === "free" ? (
                    <>PDF <span className="ml-2 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Pro</span></>
                  ) : (
                    "Download PDF"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
