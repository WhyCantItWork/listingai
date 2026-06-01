"use client"

import { useState, useEffect } from "react"
import {
  Home,
  Building2,
  Castle,
  MapPin,
  PoundSterling,
  BedDouble,
  Bath,
  Sparkles,
  Copy,
  Check,
  Save,
  Loader2,
  Download,
  Calendar,
  Users,
  Zap,
  Wifi,
  Car,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  { value: "flat", label: "Flat / Apartment", icon: Building2 },
  { value: "studio", label: "Studio", icon: Building2 },
  { value: "terraced", label: "Terraced House", icon: Building2 },
  { value: "semi-detached", label: "Semi-Detached House", icon: Home },
  { value: "detached", label: "Detached House", icon: Home },
  { value: "bungalow", label: "Bungalow", icon: Home },
  { value: "hmo", label: "HMO (House in Multiple Occupation)", icon: Castle },
  { value: "maisonette", label: "Maisonette", icon: Building2 },
  { value: "other", label: "Other", icon: Building2 },
]

const furnishedOptions = [
  { value: "furnished", label: "Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
  { value: "part-furnished", label: "Part-furnished" },
]

const councilTaxBands = ["A", "B", "C", "D", "E", "F", "G", "H"]
const epcRatings = ["A", "B", "C", "D", "E", "F", "G"]

const tenureOptions = [
  { value: "leasehold", label: "Leasehold" },
  { value: "freehold", label: "Freehold" },
  { value: "share-of-freehold", label: "Share of freehold" },
  { value: "commonhold", label: "Commonhold" },
]

const constructionTypes = [
  { value: "standard", label: "Standard (brick/stone/block)" },
  { value: "non-standard", label: "Non-standard (timber, steel-frame, etc.)" },
  { value: "unknown", label: "Not known" },
]

const heatingTypes = [
  { value: "gas-central", label: "Gas central heating" },
  { value: "electric", label: "Electric heating" },
  { value: "heat-pump", label: "Heat pump" },
  { value: "oil", label: "Oil" },
  { value: "lpg", label: "LPG" },
  { value: "biomass", label: "Biomass / wood" },
  { value: "district", label: "District / communal" },
  { value: "none", label: "No heating" },
]

const broadbandTypes = [
  { value: "ultrafast", label: "Ultrafast (300+ Mbps)" },
  { value: "superfast", label: "Superfast (30-300 Mbps)" },
  { value: "standard", label: "Standard (under 30 Mbps)" },
  { value: "not-checked", label: "Not checked" },
]

const coverageOptions = [
  { value: "good", label: "Good" },
  { value: "limited", label: "Limited" },
  { value: "poor", label: "Poor" },
  { value: "not-checked", label: "Not checked" },
]

const parkingOptions = [
  { value: "off-street", label: "Off-street parking" },
  { value: "garage", label: "Garage" },
  { value: "on-street", label: "On-street (permit)" },
  { value: "on-street-free", label: "On-street (free)" },
  { value: "none", label: "No parking" },
]

const floodRiskOptions = [
  { value: "none", label: "No known flood risk" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

const petPolicies = [
  { value: "yes", label: "Pets allowed" },
  { value: "case-by-case", label: "Considered on a case-by-case basis" },
  { value: "no", label: "No pets" },
]

const billsOptions = ["Water", "Gas", "Electricity", "Broadband / Internet", "Council Tax", "TV Licence"]

const tones = [
  { value: "professional", label: "Professional" },
  { value: "warm", label: "Warm & Inviting" },
  { value: "modern", label: "Modern & Sleek" },
  { value: "luxurious", label: "Luxurious" },
  { value: "concise", label: "Concise" },
  { value: "story", label: "Storytelling" },
]

const lengths = [
  { value: "short", label: "Short (~100 words)" },
  { value: "medium", label: "Medium (~170 words)" },
  { value: "long", label: "Long (~280 words)" },
]

const audiences = [
  { value: "general", label: "General audience" },
  { value: "young-professional", label: "Young professionals" },
  { value: "families", label: "Families" },
  { value: "students", label: "Students" },
  { value: "downsizer", label: "Downsizers" },
  { value: "corporate-let", label: "Corporate let" },
]

interface FormData {
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

interface Variant {
  content: string
  tone: string
  audience: string
}

export default function GeneratorPage() {
  const [formData, setFormData] = useState<FormData>({
    propertyType: "",
    address: "",
    furnished: "unfurnished",
    beds: "",
    baths: "",
    receptions: "",
    rent: "",
    deposit: "",
    councilTaxBand: "",
    tenure: "leasehold",
    construction: "standard",
    heating: "gas-central",
    broadband: "not-checked",
    mobileCoverage: "not-checked",
    parking: "none",
    epc: "",
    hasPartC: false,
    floodRisk: "none",
    buildingSafety: "",
    restrictions: "",
    accessibility: "",
    availableFrom: "",
    minTerm: "12",
    maxTenants: "",
    billsIncluded: [],
    petsPolicy: "case-by-case",
    smokingAllowed: false,
    tone: "professional",
    keywords: "",
    length: "medium",
    audience: "general",
    variants: 1,
  })

  const [output, setOutput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [savedVariants, setSavedVariants] = useState<number[]>([])
  const [tier, setTier] = useState<"free" | "pro" | "lister">("free")
  const [usage, setUsage] = useState<{ used: number; limit: number | null }>({ used: 0, limit: 5 })
  const [variants, setVariants] = useState<Variant[]>([])
  const [activeVariant, setActiveVariant] = useState(0)
  const [vaultFull, setVaultFull] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("tier, listings_used, bonus_listings, bonus_listings_expires_at, bonus_vault_slots, bonus_vault_expires_at")
        .eq("id", user.id)
        .single()

      if (profile) {
        const now = new Date()
        setTier(profile.tier)
        const tierLimits: Record<string, number | null> = { free: 5, pro: 100, lister: null }
        const baseLimit = tierLimits[profile.tier] ?? null

        const bonusExpiresAt = profile.bonus_listings_expires_at
          ? new Date(profile.bonus_listings_expires_at)
          : null
        const bonusActive = bonusExpiresAt && bonusExpiresAt > now
        const activeBonus = bonusActive ? (profile.bonus_listings || 0) : 0

        setUsage({
          used: profile.listings_used || 0,
          limit: baseLimit === null ? null : baseLimit + activeBonus,
        })

        const tierCaps: Record<string, number | null> = { free: 0, pro: 50, lister: null }
        const baseCapForVault = tierCaps[profile.tier] ?? null
        let bonusVault = 0
        if (profile.bonus_vault_expires_at && new Date(profile.bonus_vault_expires_at) > now) {
          bonusVault = profile.bonus_vault_slots || 0
        }
        const effectiveVaultCap = baseCapForVault === null ? null : baseCapForVault + bonusVault
        if (effectiveVaultCap !== null) {
          const vaultRes = await fetch("/api/vault")
          if (vaultRes.ok) {
            const vaultData = await vaultRes.json()
            const vaultCount = (vaultData.listings || []).length
            setVaultFull(vaultCount >= effectiveVaultCap)
          }
        }
      }
    }
    loadUser()
  }, [])

  const handleBillToggle = (bill: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      billsIncluded: checked
        ? [...prev.billsIncluded, bill]
        : prev.billsIncluded.filter((b) => b !== bill),
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setOutput("")
    setSavedVariants([])
    setVariants([])
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 402 && data.error === "limit_reached") {
          setOutput(`🔒 ${data.message}`)
          return
        }
        throw new Error(data.error || "Failed to generate listing")
      }
      const newVariants: Variant[] = data.variants || (data.listings || [data.listing]).map((c: string) => ({
        content: c,
        tone: formData.tone,
        audience: formData.audience,
      }))
      setVariants(newVariants)
      setActiveVariant(0)
      setOutput(newVariants[0]?.content || "")
      if (data.usage) setUsage({ used: data.usage.used, limit: data.usage.limit })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      setOutput(`Unable to generate listing. ${msg}`)
    }
    setIsGenerating(false)
  }

  const handleRegenerateVariant = async (idx: number, newTone: string, newAudience: string) => {
    setRegeneratingIdx(idx)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variants: 1,
          forceTone: newTone,
          audience: newAudience,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 402 && data.error === "limit_reached") {
          toast.error("Limit reached", { description: data.message })
          return
        }
        throw new Error(data.error || "Failed to regenerate")
      }
      const newVariant: Variant | undefined = data.variants?.[0]
      if (!newVariant) throw new Error("No variant returned")

      setVariants((prev) => {
        const next = [...prev]
        next[idx] = newVariant
        return next
      })
      if (idx === activeVariant) setOutput(newVariant.content)
      setSavedVariants((prev) => prev.filter((i) => i !== idx))
      if (data.usage) setUsage({ used: data.usage.used, limit: data.usage.limit })
      toast.success("Regenerated", { description: `New ${newTone} version for ${newAudience.replace(/-/g, " ")}.` })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      toast.error("Regeneration failed", { description: msg })
    }
    setRegeneratingIdx(null)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copied to clipboard")
  }

  const saveOneVariant = async (idx: number): Promise<boolean> => {
    const variant = variants[idx]
    if (!variant) return false
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: variant.content,
          address: formData.address || null,
          property_type: formData.propertyType || null,
          rent: formData.rent || null,
          furnished: formData.furnished || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 402 && data.error === "vault_full") {
          toast.error("Vault is full", {
            description: data.message || "Buy a vault top-up or upgrade to Lister.",
            action: { label: "Top up", onClick: () => window.location.href = "/account" },
          })
          setVaultFull(true)
        } else if (res.status === 403 && data.error === "vault_locked") {
          toast.error("Vault locked", {
            description: data.message || "Vault storage requires a paid plan.",
            action: { label: "Upgrade", onClick: () => window.location.href = "/pricing" },
          })
        } else {
          toast.error("Failed to save", { description: data.error || "Please try again." })
        }
        return false
      }
      return true
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      toast.error("Failed to save", { description: msg })
      return false
    }
  }

  const handleSaveCurrentVariant = async () => {
    if (!variants.length) return
    const ok = await saveOneVariant(activeVariant)
    if (ok) {
      setSavedVariants((prev) => Array.from(new Set([...prev, activeVariant])))
      toast.success("Saved to vault", { description: `Version ${activeVariant + 1} saved.` })
    }
  }

  const handleSaveAllVariants = async () => {
    if (!variants.length) return
    let savedCount = 0
    const newlySaved: number[] = []
    for (let i = 0; i < variants.length; i++) {
      if (savedVariants.includes(i)) continue
      const ok = await saveOneVariant(i)
      if (ok) {
        savedCount++
        newlySaved.push(i)
      } else {
        break
      }
    }
    if (newlySaved.length > 0) {
      setSavedVariants((prev) => Array.from(new Set([...prev, ...newlySaved])))
      toast.success(`Saved ${savedCount} version${savedCount !== 1 ? "s" : ""} to vault`)
    }
  }
  const handleDownloadPDF = () => {
    if (!output) return

    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 50
    const contentWidth = pageWidth - margin * 2
    let cursorY = margin

    const addPageIfNeeded = (linesNeeded: number = 1) => {
      if (cursorY > pageHeight - margin - linesNeeded * 18 - 40) {
        doc.addPage()
        cursorY = margin
      }
    }

    const writeText = (text: string, size: number, style: "normal" | "bold" = "normal", color: number = 20) => {
      doc.setFont("helvetica", style)
      doc.setFontSize(size)
      doc.setTextColor(color)
      const lines = doc.splitTextToSize(text, contentWidth)
      lines.forEach((line: string) => {
        addPageIfNeeded()
        doc.text(line, margin, cursorY)
        cursorY += size + 4
      })
    }

    const writeHeading = (text: string) => {
      cursorY += 8
      addPageIfNeeded(3)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(20)
      doc.text(text, margin, cursorY)
      doc.setDrawColor(180)
      doc.line(margin, cursorY + 4, pageWidth - margin, cursorY + 4)
      cursorY += 20
    }

    const writeKeyValue = (key: string, value: string) => {
      if (!value || value === "Not specified" || value === "") return
      addPageIfNeeded()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.setTextColor(80)
      doc.text(key, margin, cursorY)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(20)
      const valueLines = doc.splitTextToSize(value, contentWidth - 180)
      valueLines.forEach((line: string, idx: number) => {
        doc.text(line, margin + 180, cursorY)
        if (idx < valueLines.length - 1) {
          cursorY += 14
          addPageIfNeeded()
        }
      })
      cursorY += 16
    }

    const sections: Record<string, string> = {}
    const parts = output.split(/\n(?=DESCRIPTION|KEY FEATURES|MATERIAL INFORMATION|TENANCY TERMS)/i)
    parts.forEach((part) => {
      const match = part.match(/^(DESCRIPTION|KEY FEATURES|MATERIAL INFORMATION|TENANCY TERMS)\s*\n([\s\S]*)/i)
      if (match) sections[match[1].toUpperCase()] = match[2].trim()
    })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(28)
    doc.setTextColor(20)
    doc.text("Tenancy Pack", margin, cursorY + 20)
    cursorY += 56
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(120)
    doc.text("Material Information & Marketing Listing", margin, cursorY)
    cursorY += 30
    doc.setFillColor(245, 245, 250)
    doc.roundedRect(margin, cursorY, contentWidth, 140, 6, 6, "F")
    const cardY = cursorY + 24
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(20)
    doc.text(formData.address || "Property address", margin + 20, cardY)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(80)
    doc.text(`${formData.beds || "?"} bed ${formData.propertyType || "property"} · ${formData.furnished || "Unfurnished"}`, margin + 20, cardY + 20)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.setTextColor(20)
    doc.text(`£${formData.rent || "?"} pcm`, margin + 20, cardY + 60)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(120)
    if (formData.deposit) doc.text(`Deposit: £${formData.deposit}`, margin + 20, cardY + 80)
    if (formData.availableFrom) doc.text(`Available: ${formData.availableFrom}`, margin + 20, cardY + 95)
    cursorY += 170

    doc.addPage()
    cursorY = margin
    writeHeading("Property Description")
    if (sections.DESCRIPTION) writeText(sections.DESCRIPTION, 11)
    else writeText(output, 11)
    if (sections["KEY FEATURES"]) {
      writeHeading("Key Features")
      const featureLines = sections["KEY FEATURES"].split("\n").filter(l => l.trim())
      featureLines.forEach((line) => {
        const cleaned = line.replace(/^[•\-\*]\s*/, "")
        addPageIfNeeded()
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.setTextColor(20)
        doc.text("•", margin, cursorY)
        const wrapped = doc.splitTextToSize(cleaned, contentWidth - 16)
        wrapped.forEach((w: string, idx: number) => {
          doc.text(w, margin + 14, cursorY)
          if (idx < wrapped.length - 1) { cursorY += 15; addPageIfNeeded() }
        })
        cursorY += 16
      })
    }

    doc.addPage()
    cursorY = margin
    writeHeading("Material Information")
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.setTextColor(120)
    const intro = "The following information is provided in accordance with mandatory Material Information requirements for UK property listings."
    const introLines = doc.splitTextToSize(intro, contentWidth)
    introLines.forEach((line: string) => { doc.text(line, margin, cursorY); cursorY += 12 })
    cursorY += 10
    writeKeyValue("Monthly rent", formData.rent ? `£${formData.rent}` : "")
    writeKeyValue("Deposit", formData.deposit ? `£${formData.deposit}` : "")
    writeKeyValue("Council tax band", formData.councilTaxBand)
    writeKeyValue("Tenure", formData.tenure)
    writeKeyValue("EPC rating", formData.epc)
    writeKeyValue("Heating", formData.heating?.replace(/-/g, " "))
    writeKeyValue("Construction", formData.construction)
    writeKeyValue("Parking", formData.parking?.replace(/-/g, " "))
    writeKeyValue("Broadband", formData.broadband?.replace(/-/g, " "))
    writeKeyValue("Mobile coverage", formData.mobileCoverage?.replace(/-/g, " "))
    if (formData.hasPartC) {
      cursorY += 10
      writeHeading("Disclosed Risks & Restrictions (Part C)")
      writeKeyValue("Flood risk", formData.floodRisk)
      writeKeyValue("Building safety", formData.buildingSafety)
      writeKeyValue("Restrictions", formData.restrictions)
      writeKeyValue("Accessibility", formData.accessibility)
    }

    doc.addPage()
    cursorY = margin
    writeHeading("Tenancy Terms")
    writeKeyValue("Available from", formData.availableFrom || "Immediately")
    writeKeyValue("Minimum term", formData.minTerm ? `${formData.minTerm} months` : "12 months")
    writeKeyValue("Maximum tenants", formData.maxTenants)
    writeKeyValue("Pets policy", formData.petsPolicy?.replace(/-/g, " "))
    writeKeyValue("Smoking", formData.smokingAllowed ? "Permitted inside" : "Not permitted inside")
    if (formData.billsIncluded.length > 0) writeKeyValue("Bills included", formData.billsIncluded.join(", "))
    else writeKeyValue("Bills included", "None — tenant pays all bills")
    cursorY += 16
    writeHeading("Required Documentation Reminder")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(60)
  const reminders = [
  "• Provide the tenant with the latest How to Rent guide (gov.uk).",
  "• Conduct Right to Rent immigration checks on all tenants over 18.",
  "• Protect the deposit in a government-approved scheme within 30 days.",
  "• Provide a valid Energy Performance Certificate (EPC).",
  "• Provide a current Gas Safety Certificate (if gas is present).",
  "• Provide an Electrical Installation Condition Report (EICR) less than 5 years old.",
  "• Install working smoke alarms on every storey and CO alarms in rooms with solid fuel.",
  "• Under the Renters' Rights Act 2025 (in force from 1 May 2026): all new tenancies are indefinite periodic — no fixed term.",
  "• Section 21 no-fault evictions are abolished. Possession requires a Section 8 ground only.",
  "• Rental bidding is illegal — accept applications at the advertised rent.",
  "• Rent in advance for new tenancies is restricted — do not request multiple months upfront.",
  "• Discriminating against tenants with children or those receiving benefits is illegal.",
  "• Register with the new Private Rented Sector Database when it goes live.",
  "• Comply with the new Decent Homes Standard for the private rented sector.",
  "• Landlord cannot use moving-in (Ground 1) or selling (Ground 1A) grounds in the first 12 months of a tenancy.",
  "• Landlord notice for moving-in or selling grounds is now 4 months.",
  "• Re-letting or re-marketing the property within 12 months of using Grounds 1 or 1A is an offence.",
  "• Rent can only be increased once per year via a Section 13 notice, giving 2 months' notice, at market rate.",
  "• Tenants can end the tenancy at any time with 2 months' written notice.",
  "• Mandatory rent arrears threshold for possession is 3 months, with 4 weeks' notice (Ground 8).",
  "• Pet requests cannot be unreasonably refused — consider each request on its merits.",
  "• Awaab's Law applies: serious hazards (damp, mould) must be addressed within statutory timescales.",
  "• Civil penalties: up to £7,000 for initial breaches; up to £40,000 or criminal prosecution for serious or repeat breaches.",
  "• Rent repayment orders can be claimed for up to 24 months of rent for qualifying offences.",
]

    reminders.forEach((line) => {
      addPageIfNeeded()
      const wrapped = doc.splitTextToSize(line, contentWidth)
      wrapped.forEach((w: string) => { doc.text(w, margin, cursorY); cursorY += 14 })
      cursorY += 4
    })

    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setDrawColor(220)
      doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text("Generated by Tenancy · UK lettings listing tool", margin, pageHeight - 25)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 25, { align: "right" })
    }

    const slug = (formData.address || "tenancy-pack")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
    doc.save(`tenancy-pack-${slug}.pdf`)
  }

  const isCurrentSaved = savedVariants.includes(activeVariant)
  const allSaved = variants.length > 0 && variants.every((_, i) => savedVariants.includes(i))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Tenancy Listing Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the Material Information below — Tenancy will produce a compliant listing description and tenancy pack ready for Rightmove, Zoopla, or OnTheMarket.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Property &amp; Tenancy Details
            </CardTitle>
            <CardDescription>
              Required fields are marked with an asterisk. Material Information Parts A and B are mandatory under UK law.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">1. Property basics</h3>

              <div className="space-y-2">
                <Label htmlFor="propertyType" className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" /> Property type *
                </Label>
                <Select value={formData.propertyType} onValueChange={(v) => setFormData((p) => ({ ...p, propertyType: v }))}>
                  <SelectTrigger id="propertyType"><SelectValue placeholder="Select property type" /></SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Address *
                </Label>
                <Input id="address" placeholder="e.g., 42 Richmond Avenue, London SW15 2BX"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="furnished">Furnished status *</Label>
                <Select value={formData.furnished} onValueChange={(v) => setFormData((p) => ({ ...p, furnished: v }))}>
                  <SelectTrigger id="furnished"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {furnishedOptions.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beds" className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-muted-foreground" /> Beds *</Label>
                  <Input id="beds" type="number" min="0" placeholder="2" value={formData.beds}
                    onChange={(e) => setFormData((p) => ({ ...p, beds: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baths" className="flex items-center gap-2"><Bath className="h-4 w-4 text-muted-foreground" /> Baths *</Label>
                  <Input id="baths" type="number" min="0" placeholder="1" value={formData.baths}
                    onChange={(e) => setFormData((p) => ({ ...p, baths: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receptions">Receptions</Label>
                  <Input id="receptions" type="number" min="0" placeholder="1" value={formData.receptions}
                    onChange={(e) => setFormData((p) => ({ ...p, receptions: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">2. Material Information — Part A</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent" className="flex items-center gap-2"><PoundSterling className="h-4 w-4 text-muted-foreground" /> Monthly rent (£) *</Label>
                  <Input id="rent" type="number" placeholder="1500" value={formData.rent}
                    onChange={(e) => setFormData((p) => ({ ...p, rent: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Deposit (£) *</Label>
                  <Input id="deposit" type="number" placeholder="1730" value={formData.deposit}
                    onChange={(e) => setFormData((p) => ({ ...p, deposit: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="councilTaxBand">Council tax band *</Label>
                  <Select value={formData.councilTaxBand} onValueChange={(v) => setFormData((p) => ({ ...p, councilTaxBand: v }))}>
                    <SelectTrigger id="councilTaxBand"><SelectValue placeholder="A-H" /></SelectTrigger>
                    <SelectContent>
                      {councilTaxBands.map((b) => <SelectItem key={b} value={b}>Band {b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenure">Tenure *</Label>
                  <Select value={formData.tenure} onValueChange={(v) => setFormData((p) => ({ ...p, tenure: v }))}>
                    <SelectTrigger id="tenure"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tenureOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">3. Material Information — Part B</h3>

              <div className="space-y-2">
                <Label htmlFor="construction">Construction type *</Label>
                <Select value={formData.construction} onValueChange={(v) => setFormData((p) => ({ ...p, construction: v }))}>
                  <SelectTrigger id="construction"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {constructionTypes.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heating" className="flex items-center gap-2"><Zap className="h-4 w-4 text-muted-foreground" /> Heating *</Label>
                  <Select value={formData.heating} onValueChange={(v) => setFormData((p) => ({ ...p, heating: v }))}>
                    <SelectTrigger id="heating"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {heatingTypes.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="epc">EPC rating *</Label>
                  <Select value={formData.epc} onValueChange={(v) => setFormData((p) => ({ ...p, epc: v }))}>
                    <SelectTrigger id="epc"><SelectValue placeholder="A-G" /></SelectTrigger>
                    <SelectContent>
                      {epcRatings.map((r) => <SelectItem key={r} value={r}>Rating {r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="broadband" className="flex items-center gap-2"><Wifi className="h-4 w-4 text-muted-foreground" /> Broadband</Label>
                  <Select value={formData.broadband} onValueChange={(v) => setFormData((p) => ({ ...p, broadband: v }))}>
                    <SelectTrigger id="broadband"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {broadbandTypes.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileCoverage">Mobile coverage</Label>
                  <Select value={formData.mobileCoverage} onValueChange={(v) => setFormData((p) => ({ ...p, mobileCoverage: v }))}>
                    <SelectTrigger id="mobileCoverage"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {coverageOptions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking" className="flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground" /> Parking</Label>
                <Select value={formData.parking} onValueChange={(v) => setFormData((p) => ({ ...p, parking: v }))}>
                  <SelectTrigger id="parking"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {parkingOptions.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">4. Material Information — Part C</h3>
                <div className="flex items-center gap-2">
                  <Checkbox id="hasPartC" checked={formData.hasPartC}
                    onCheckedChange={(checked) => setFormData((p) => ({ ...p, hasPartC: checked === true }))} />
                  <Label htmlFor="hasPartC" className="text-xs font-normal">Applies to this property</Label>
                </div>
              </div>

              {formData.hasPartC && (
                <div className="space-y-4 pl-2 border-l-2 border-amber-500/30">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    Part C must be disclosed if any of these apply to the property.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="floodRisk">Flood risk</Label>
                    <Select value={formData.floodRisk} onValueChange={(v) => setFormData((p) => ({ ...p, floodRisk: v }))}>
                      <SelectTrigger id="floodRisk"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {floodRiskOptions.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buildingSafety">Building safety issues</Label>
                    <Input id="buildingSafety" placeholder="e.g., cladding remediation in progress, none"
                      value={formData.buildingSafety}
                      onChange={(e) => setFormData((p) => ({ ...p, buildingSafety: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restrictions">Restrictions</Label>
                    <Input id="restrictions" placeholder="e.g., listed building, conservation area, none"
                      value={formData.restrictions}
                      onChange={(e) => setFormData((p) => ({ ...p, restrictions: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accessibility">Accessibility features</Label>
                    <Input id="accessibility" placeholder="e.g., step-free access, wet room, lift"
                      value={formData.accessibility}
                      onChange={(e) => setFormData((p) => ({ ...p, accessibility: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">5. Tenancy specifics</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="availableFrom" className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Available from</Label>
                  <Input id="availableFrom" type="date" value={formData.availableFrom}
                    onChange={(e) => setFormData((p) => ({ ...p, availableFrom: e.target.value }))} />
                </div>
                <div className="space-y-2">
  <Label htmlFor="minTerm" className="flex items-center gap-2">
    Min term (months)
    <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Note</span>
  </Label>
  <Input id="minTerm" type="number" placeholder="—" value={formData.minTerm}
    onChange={(e) => setFormData((p) => ({ ...p, minTerm: e.target.value }))} />
  <p className="text-[11px] text-muted-foreground">
    Under the Renters' Rights Act 2025, all tenancies are now indefinite periodic. Tenants can give 2 months' notice at any time. Leave blank or use only if a specific arrangement applies.
  </p>
</div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTenants" className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> Max tenants</Label>
                  <Input id="maxTenants" type="number" placeholder="2" value={formData.maxTenants}
                    onChange={(e) => setFormData((p) => ({ ...p, maxTenants: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="petsPolicy">Pets policy</Label>
                  <Select value={formData.petsPolicy} onValueChange={(v) => setFormData((p) => ({ ...p, petsPolicy: v }))}>
                    <SelectTrigger id="petsPolicy"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {petPolicies.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Bills included in rent</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {billsOptions.map((bill) => (
                    <div key={bill} className="flex items-center space-x-2">
                      <Checkbox id={bill} checked={formData.billsIncluded.includes(bill)}
                        onCheckedChange={(checked) => handleBillToggle(bill, checked === true)} />
                      <Label htmlFor={bill} className="text-sm font-normal text-muted-foreground">{bill}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="smokingAllowed" checked={formData.smokingAllowed}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, smokingAllowed: checked === true }))} />
                <Label htmlFor="smokingAllowed" className="text-sm font-normal">Smoking allowed inside</Label>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">6. Style &amp; tone</h3>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(v) => setFormData((p) => ({ ...p, tone: v }))}>
                  <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length" className="flex items-center gap-2">
                  Length
                  {tier === "free" && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Pro</span>}
                </Label>
                <Select value={formData.length} onValueChange={(v) => setFormData((p) => ({ ...p, length: v }))} disabled={tier === "free"}>
                  <SelectTrigger id="length"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {lengths.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="flex items-center gap-2">
                  Target tenant
                  {tier === "free" && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Pro</span>}
                </Label>
                <Select value={formData.audience} onValueChange={(v) => setFormData((p) => ({ ...p, audience: v }))} disabled={tier === "free"}>
                  <SelectTrigger id="audience"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {audiences.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variants" className="flex items-center gap-2">
                  Number of versions
                  {(tier === "free" || tier === "pro") && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Lister</span>}
                </Label>
                <Select value={String(formData.variants)}
                  onValueChange={(v) => setFormData((p) => ({ ...p, variants: parseInt(v) }))}
                  disabled={tier === "free" || tier === "pro"}>
                  <SelectTrigger id="variants"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 version</SelectItem>
                    <SelectItem value="2">2 versions to compare</SelectItem>
                    <SelectItem value="3">3 versions to compare</SelectItem>
                  </SelectContent>
                </Select>
                {tier === "lister" && formData.variants > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Each version uses a different tone and audience automatically. You can change tone or audience on any version below to regenerate it.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Custom keywords (optional)</Label>
                <Input id="keywords" placeholder="e.g., near tube, quiet road, recently refurbished"
                  value={formData.keywords}
                  onChange={(e) => setFormData((p) => ({ ...p, keywords: e.target.value }))} />
              </div>
            </div>

            {usage.limit !== null && (
              <div className="text-xs text-muted-foreground text-center pb-2 pt-2 border-t border-border">
                {usage.used} / {usage.limit} listings used this month
                {usage.used >= usage.limit ? (
                  <span className="block text-amber-600 dark:text-amber-400 font-medium mt-1">
                    🔒 Limit reached —{" "}
                    {tier === "free" ? (
                      <a href="/pricing" className="underline">Upgrade to Pro</a>
                    ) : (
                      <a href="/account" className="underline">Buy a top-up</a>
                    )}
                  </span>
                ) : usage.limit - usage.used <= 10 ? (
                  <span className="block text-amber-600 dark:text-amber-400 font-medium mt-1">
                    ⚠️ Only {usage.limit - usage.used} listings left —{" "}
                    {tier === "free" ? (
                      <a href="/pricing" className="underline">upgrade for more</a>
                    ) : (
                      <a href="/account" className="underline">top up your allowance</a>
                    )}
                  </span>
                ) : null}
              </div>
            )}
            {usage.limit === null && tier !== "free" && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 text-center pb-2 pt-2 border-t border-border">
                {usage.used} listings generated this month · Unlimited on Lister
              </div>
            )}

            <Button onClick={handleGenerate}
              disabled={isGenerating || !formData.propertyType || !formData.address || !formData.rent}
              className="w-full" size="lg">
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Generate tenancy listing</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Generated Listing</CardTitle>
            <CardDescription>Your AI-generated tenancy description will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {variants.length > 1 && (
              <div className="space-y-2 pb-3 border-b border-border">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase font-mono opacity-60 mr-1">Versions:</span>
                  {variants.map((v, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={activeVariant === i ? "default" : "outline"}
                      onClick={() => { setActiveVariant(i); setOutput(v.content); }}
                    >
                      V{i + 1}
                      {savedVariants.includes(i) && <Check className="ml-1 h-3 w-3" />}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="min-h-[400px] rounded-lg border border-border bg-secondary/30 p-4">
              {output ? (
                <p className="whitespace-pre-wrap text-foreground">{output}</p>
              ) : (
                <p className="text-muted-foreground">
                  Fill in the property details and click &quot;Generate tenancy listing&quot; to see your AI-crafted description.
                </p>
              )}
            </div>

            {variants.length > 0 && variants[activeVariant] && (
              <div className="space-y-2 pb-2 border-b border-border">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono uppercase opacity-60 text-muted-foreground">Tone:</span>
                    <Select
                      value={variants[activeVariant].tone}
                      onValueChange={(newTone) => {
                        if (newTone !== variants[activeVariant].tone) {
                          handleRegenerateVariant(activeVariant, newTone, variants[activeVariant].audience)
                        }
                      }}
                      disabled={regeneratingIdx !== null || isGenerating}
                    >
                      <SelectTrigger className="h-7 px-2 text-xs gap-1 w-auto min-w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tones.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono uppercase opacity-60 text-muted-foreground">Audience:</span>
                    <Select
                      value={variants[activeVariant].audience}
                      onValueChange={(newAudience) => {
                        if (newAudience !== variants[activeVariant].audience) {
                          handleRegenerateVariant(activeVariant, variants[activeVariant].tone, newAudience)
                        }
                      }}
                      disabled={regeneratingIdx !== null || isGenerating}
                    >
                      <SelectTrigger className="h-7 px-2 text-xs gap-1 w-auto min-w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {audiences.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {regeneratingIdx === activeVariant && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Regenerating...</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Change either dropdown to regenerate this version with a different tone or audience.
                </p>
              </div>
            )}

            {output && (
              <div className="flex gap-3 flex-wrap pt-2">
                <Button onClick={handleCopy} variant="outline" className="flex-1 min-w-[120px]">
                  {copied ? (<><Check className="mr-2 h-4 w-4" /> Copied!</>) : (<><Copy className="mr-2 h-4 w-4" /> Copy</>)}
                </Button>

                <Button
                  onClick={handleSaveCurrentVariant}
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                  disabled={isCurrentSaved || vaultFull}
                >
                  {isCurrentSaved ? (
                    <><Check className="mr-2 h-4 w-4" /> Saved</>
                  ) : vaultFull ? (
                    <><Save className="mr-2 h-4 w-4" /> Vault full</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save{variants.length > 1 ? ` V${activeVariant + 1}` : ""}</>
                  )}
                </Button>

                {variants.length > 1 && (
                  <Button
                    onClick={handleSaveAllVariants}
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    disabled={allSaved || vaultFull}
                  >
                    {allSaved ? (
                      <><Check className="mr-2 h-4 w-4" /> All saved</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Save all</>
                    )}
                  </Button>
                )}

                <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 min-w-[120px]" disabled={tier === "free"}>
                  <Download className="mr-2 h-4 w-4" />
                  {tier === "free" ? (
                    <>PDF <span className="ml-2 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded">Pro</span></>
                  ) : ("Download PDF")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

