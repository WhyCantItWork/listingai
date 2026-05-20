"use client"

import { useState } from "react"
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
  })
  const [output, setOutput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

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

      if (!response.ok) {
        throw new Error("Failed to generate listing")
      }

      const data = await response.json()
      setOutput(data.listing)
    } catch {
      setOutput(
        "Unable to generate listing. Please check your connection and try again."
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

            {output && (
              <div className="flex gap-3">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1"
                >
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
                <Button
                  onClick={handleSaveToVault}
                  variant="outline"
                  className="flex-1"
                  disabled={saved}
                >
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
