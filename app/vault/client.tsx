"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Search, Filter, Copy, Pencil, Trash2, Check, X, Save, Archive, Clock,
  Home, Building2, Castle, Split, Shield, Download, FileText, ArrowUpDown, AlertCircle, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import jsPDF from "jspdf"

interface SavedListing {
  id: string
  title: string | null
  content: string
  address: string | null
  property_type: string | null
  price: string | null
  rent: string | null
  furnished: string | null
  created_at: string
  updated_at?: string
}

const propertyTypeMeta: Record<string, { label: string; icon: typeof Home }> = {
  flat: { label: "Flat", icon: Building2 },
  studio: { label: "Studio", icon: Building2 },
  terraced: { label: "Terraced", icon: Building2 },
  "semi-detached": { label: "Semi-Detached", icon: Home },
  detached: { label: "Detached", icon: Home },
  bungalow: { label: "Bungalow", icon: Home },
  hmo: { label: "HMO", icon: Castle },
  maisonette: { label: "Maisonette", icon: Building2 },
  other: { label: "Property", icon: Building2 },
}

const TIER_CAPS: Record<string, number | null> = {
  free: 0,
  pro: 50,
  lister: null,
  team: null,
}

export function VaultClient() {
  const router = useRouter()
  const [listings, setListings] = useState<SavedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "address">("newest")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [tier, setTier] = useState<"free" | "pro" | "lister" | "team">("free")
  const [bonusVaultSlots, setBonusVaultSlots] = useState(0)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewListing, setPreviewListing] = useState<SavedListing | null>(null)

  const loadVault = useCallback(async () => {
    const res = await fetch("/api/vault")
    if (!res.ok) {
      setLoading(false)
      return
    }
    const data = await res.json()
    setListings(data.listings || [])
    setLoading(false)
  }, [])

  // One-time migration from localStorage to Supabase
  const migrateLocalStorage = useCallback(async () => {
    const stored = localStorage.getItem("listingai-vault")
    if (!stored) return false

    let parsed: Array<{
      content?: string
      address?: string
      propertyType?: string
      price?: string
      title?: string
      createdAt?: string
    }>
    try {
      parsed = JSON.parse(stored)
    } catch {
      localStorage.removeItem("listingai-vault")
      return false
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.removeItem("listingai-vault")
      return false
    }

    setMigrating(true)
    let migrated = 0
    for (const item of parsed) {
      if (!item.content) continue
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title || null,
          content: item.content,
          address: item.address || null,
          property_type: item.propertyType || null,
          price: item.price || null,
          rent: item.price || null,
        }),
      })
      if (res.ok) migrated++
      // If we hit the cap, stop migrating
      if (res.status === 402) break
    }

    if (migrated > 0) {
      // Clear localStorage so we don't migrate again
      localStorage.removeItem("listingai-vault")
    }
    setMigrating(false)
    return migrated > 0
  }, [])

  useEffect(() => {
    const init = async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("tier, bonus_vault_slots, bonus_vault_expires_at")
        .eq("id", user.id)
        .single()

      if (profile) {
        setTier(profile.tier)
        const expiresAt = profile.bonus_vault_expires_at ? new Date(profile.bonus_vault_expires_at) : null
        const isActive = expiresAt && expiresAt > new Date()
        setBonusVaultSlots(isActive ? (profile.bonus_vault_slots || 0) : 0)
      }

      // Load Supabase listings first
      const res = await fetch("/api/vault")
      if (res.ok) {
        const data = await res.json()
        const supabaseListings = data.listings || []

        // If we have NO Supabase listings but DO have localStorage data, migrate
        if (supabaseListings.length === 0) {
          const migrated = await migrateLocalStorage()
          if (migrated) {
            // Reload from Supabase after migration
            await loadVault()
            return
          }
        }
        setListings(supabaseListings)
      }
      setLoading(false)
    }
    init()
  }, [router, loadVault, migrateLocalStorage])

const handleCopy = async (id: string, content: string) => {
  await navigator.clipboard.writeText(content)
  setCopiedId(id)
  setTimeout(() => setCopiedId(null), 2000)
  toast.success("Copied to clipboard")
}


  const handleEdit = (listing: SavedListing) => {
    setEditingId(listing.id)
    setEditContent(listing.content)
    setEditTitle(listing.title || listing.address || "")
  }

const handleSaveEdit = async (id: string) => {
  const res = await fetch(`/api/vault/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: editTitle.trim() || null, content: editContent }),
  })
  if (res.ok) {
    const data = await res.json()
    setListings((prev) => prev.map((l) => (l.id === id ? data.listing : l)))
    toast.success("Listing updated")
  } else {
    toast.error("Couldn't update listing")
  }
  setEditingId(null)
  setEditContent("")
  setEditTitle("")
}


  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
    setEditTitle("")
  }

const handleDelete = async (id: string) => {
  const res = await fetch(`/api/vault/${id}`, { method: "DELETE" })
  if (res.ok) {
    setListings((prev) => prev.filter((l) => l.id !== id))
    setSelectedIds((prev) => prev.filter((sid) => sid !== id))
    toast.success("Listing deleted")
  } else {
    toast.error("Couldn't delete listing")
  }
}

const handleBulkDelete = async () => {
  const count = selectedIds.length
  await Promise.all(selectedIds.map((id) => fetch(`/api/vault/${id}`, { method: "DELETE" })))
  setListings((prev) => prev.filter((l) => !selectedIds.includes(l.id)))
  setSelectedIds([])
  setSelectionMode(false)
  toast.success(`${count} listing${count !== 1 ? "s" : ""} deleted`)
}


  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const sendToABTest = () => {
    if (selectedIds.length !== 2) return
    const [aId, bId] = selectedIds
    const a = listings.find((l) => l.id === aId)
    const b = listings.find((l) => l.id === bId)
    if (!a || !b) return
    localStorage.setItem("tenancy-pending-ab-test", JSON.stringify({
      variantA: a.content,
      variantB: b.content,
    }))
    router.push("/ab-test")
  }

  const sendToCompliance = (listing: SavedListing) => {
    localStorage.setItem("tenancy-pending-compliance", listing.content)
    router.push("/compliance")
  }

  const downloadPDF = (listing: SavedListing) => {
    if (tier === "free") return
    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 50
    const contentWidth = pageWidth - margin * 2
    let cursorY = margin

    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(20)
    doc.text(listing.title || listing.address || "Saved Listing", margin, cursorY)
    cursorY += 28

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(120)
    if (listing.property_type) {
      doc.text(propertyTypeMeta[listing.property_type]?.label || listing.property_type, margin, cursorY)
      cursorY += 14
    }
    if (listing.rent || listing.price) {
      doc.text(`£${listing.rent || listing.price} pcm`, margin, cursorY)
      cursorY += 14
    }
    cursorY += 10

    doc.setDrawColor(220)
    doc.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 20

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(20)
    const lines = doc.splitTextToSize(listing.content, contentWidth)
    lines.forEach((line: string) => {
      if (cursorY > pageHeight - margin - 30) {
        doc.addPage()
        cursorY = margin
      }
      doc.text(line, margin, cursorY)
      cursorY += 16
    })

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text("Generated by Tenancy", margin, pageHeight - 25)

    const slug = (listing.address || "listing")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
    doc.save(`tenancy-${slug}.pdf`)
  }

  const filteredListings = listings
    .filter((listing) => {
      const haystack = `${listing.title || ""} ${listing.address || ""} ${listing.content}`.toLowerCase()
      const matchesSearch = haystack.includes(search.toLowerCase())
      const matchesFilter = filterType === "all" || listing.property_type === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (sortBy === "address") return (a.address || "").localeCompare(b.address || "")
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const uniqueTypes = [...new Set(listings.map((l) => l.property_type).filter((t): t is string => !!t))]

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

  const baseCap = TIER_CAPS[tier]
  const cap = baseCap === null ? null : baseCap + bonusVaultSlots
  const overCap = cap !== null && listings.length > cap

  if (loading || migrating) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">
          {migrating ? "Migrating your saved listings to the cloud..." : "Loading your vault..."}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-32 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <Archive className="h-8 w-8 text-primary" />
            Vault
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your saved listings — search, edit, compare, and export. Synced across devices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {listings.length}{cap !== null && ` / ${cap}`} listings
            {bonusVaultSlots > 0 && (
              <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                (+{bonusVaultSlots} bonus)
              </span>
            )}
          </div>
          {selectionMode ? (
            <Button variant="outline" size="sm" onClick={() => { setSelectionMode(false); setSelectedIds([]) }}>
              <X className="mr-2 h-4 w-4" /> Exit selection
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSelectionMode(true)} disabled={listings.length < 2}>
              <Check className="mr-2 h-4 w-4" /> Select
            </Button>
          )}
        </div>
      </div>

      {overCap && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">You're over your vault limit ({cap} listings)</p>
              <p className="mt-1 text-muted-foreground">
                You can browse and edit older listings, but new ones won't save. Buy a <a href="/account" className="underline text-primary">vault top-up</a>, upgrade to <a href="/pricing" className="underline text-primary">Lister</a> for unlimited storage, or delete some listings.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by address, title, or content..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {propertyTypeMeta[type]?.label || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v: "newest" | "oldest" | "address") => setSortBy(v)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="address">Address A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Archive className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {listings.length === 0 ? "Your vault is empty" : "No listings match your filters"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm text-center">
              {listings.length === 0
                ? "Generate your first listing and save it here. You'll be able to compare versions, run compliance checks, and export PDFs."
                : "Try clearing your search or changing the filter."}
            </p>
            {listings.length === 0 && (
              <Button className="mt-6" onClick={() => router.push("/generator")}>
                Generate a listing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => {
            const meta = propertyTypeMeta[listing.property_type || ""] || { label: "Property", icon: Building2 }
            const Icon = meta.icon
            const isSelected = selectedIds.includes(listing.id)
            const displayTitle = listing.title || listing.address || "Untitled Listing"

            return (
              <Card
                key={listing.id}
                className={`border-border bg-card transition-all hover:shadow-md ${
                  selectionMode ? "cursor-pointer" : ""
                } ${isSelected ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={selectionMode ? () => toggleSelection(listing.id) : undefined}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="line-clamp-1 text-base text-foreground">
                          {displayTitle}
                        </CardTitle>
                        <CardDescription className="mt-0.5 flex items-center gap-2 text-xs">
                          <span>{meta.label}</span>
                          {(listing.rent || listing.price) && <span>· £{listing.rent || listing.price} pcm</span>}
                        </CardDescription>
                      </div>
                    </div>
                    {selectionMode && (
                      <div className={`flex h-5 w-5 items-center justify-center rounded border-2 flex-shrink-0 ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {editingId === listing.id ? (
                    <div className="space-y-3">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title (e.g. 'Clapham flat — luxury tone')" className="text-sm" />
                      <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                        rows={8} className="resize-none text-sm" />
                    </div>
                  ) : (
                    <p className="line-clamp-5 whitespace-pre-wrap text-sm text-muted-foreground cursor-pointer"
                      onClick={() => !selectionMode && setPreviewListing(listing)}>
                      {listing.content}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(listing.created_at)}
                  </div>

                  {!selectionMode && (
                    <div className="flex items-center gap-0.5">
                      {editingId === listing.id ? (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(listing.id)} className="h-8 w-8">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleCopy(listing.id, listing.content) }}
                            className="h-8 w-8" title="Copy">
                            {copiedId === listing.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleEdit(listing) }}
                            className="h-8 w-8" title="Rename / edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost"
                            onClick={(e) => { e.stopPropagation(); sendToCompliance(listing) }}
                            className="h-8 w-8" title="Send to Compliance Checker">
                            <Shield className="h-4 w-4" />
                          </Button>
                          {tier !== "free" && (
                            <Button size="icon" variant="ghost"
                              onClick={(e) => { e.stopPropagation(); downloadPDF(listing) }}
                              className="h-8 w-8" title="Download PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-8 text-destructive hover:text-destructive" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                                <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(listing.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {selectionMode && selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur p-4 shadow-lg">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">
              {selectedIds.length} selected
              {selectedIds.length === 2 && <span className="ml-2 text-muted-foreground">— ready to compare</span>}
              {selectedIds.length > 2 && <span className="ml-2 text-amber-500">— pick exactly 2 to A/B test</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={sendToABTest} disabled={selectedIds.length !== 2 || (tier !== "lister" && tier !== "team")}>
                <Split className="mr-2 h-4 w-4" />
                {tier !== "lister" && tier !== "team" ? "A/B Test (Lister)" : "Compare in A/B Test"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete {selectedIds.length}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.length} listings?</AlertDialogTitle>
                    <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!previewListing} onOpenChange={(open) => !open && setPreviewListing(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {previewListing?.title || previewListing?.address || "Listing"}
            </DialogTitle>
            <DialogDescription>
              {previewListing && (
                <>
                  {propertyTypeMeta[previewListing.property_type || ""]?.label || "Property"}
                  {(previewListing.rent || previewListing.price) && ` · £${previewListing.rent || previewListing.price} pcm`}
                  {" · "}
                  Saved {previewListing && formatDate(previewListing.created_at)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {previewListing && (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap text-sm text-foreground">{previewListing.content}</p>
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" variant="outline" onClick={() => handleCopy(previewListing.id, previewListing.content)}>
                  <Copy className="mr-2 h-3 w-3" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => { sendToCompliance(previewListing); setPreviewListing(null) }}>
                  <Shield className="mr-2 h-3 w-3" /> Compliance check
                </Button>
                {tier !== "free" && (
                  <Button size="sm" variant="outline" onClick={() => downloadPDF(previewListing)}>
                    <Download className="mr-2 h-3 w-3" /> Download PDF
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
