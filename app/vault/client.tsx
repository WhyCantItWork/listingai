"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Copy,
  Pencil,
  Trash2,
  Check,
  X,
  Save,
  Archive,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SavedListing {
  id: string
  content: string
  address: string
  propertyType: string
  price: string
  createdAt: string
}

const propertyTypeLabels: Record<string, string> = {
  detached: "Detached",
  "semi-detached": "Semi-Detached",
  terraced: "Terraced",
  flat: "Flat",
  bungalow: "Bungalow",
  cottage: "Cottage",
  mansion: "Mansion",
  farmhouse: "Farmhouse",
}

export function VaultClient() {
  const [listings, setListings] = useState<SavedListing[]>([])
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("listingai-vault")
    if (stored) {
      setListings(JSON.parse(stored))
    }
  }, [])

  const saveListings = (newListings: SavedListing[]) => {
    setListings(newListings)
    localStorage.setItem("listingai-vault", JSON.stringify(newListings))
  }

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleEdit = (listing: SavedListing) => {
    setEditingId(listing.id)
    setEditContent(listing.content)
  }

  const handleSaveEdit = (id: string) => {
    const updated = listings.map((l) =>
      l.id === id ? { ...l, content: editContent } : l
    )
    saveListings(updated)
    setEditingId(null)
    setEditContent("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const handleDelete = (id: string) => {
    const updated = listings.filter((l) => l.id !== id)
    saveListings(updated)
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.address.toLowerCase().includes(search.toLowerCase()) ||
      listing.content.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filterType === "all" || listing.propertyType === filterType

    return matchesSearch && matchesFilter
  })

  const uniqueTypes = [...new Set(listings.map((l) => l.propertyType))].filter(
    Boolean
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Archive className="h-8 w-8 text-primary" />
          Listing Vault
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your saved property listings, ready to edit and reuse.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {propertyTypeLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Archive className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No listings found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {listings.length === 0
                ? "Save listings from the Generator to see them here."
                : "Try adjusting your search or filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1 text-foreground">
                      {listing.address || "Untitled Listing"}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {propertyTypeLabels[listing.propertyType] ||
                          listing.propertyType ||
                          "Property"}
                      </span>
                      {listing.price && (
                        <span className="text-xs">£{listing.price}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === listing.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                ) : (
                  <p className="line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">
                    {listing.content}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(listing.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  {editingId === listing.id ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleSaveEdit(listing.id)}
                        className="h-8 w-8"
                      >
                        <Save className="h-4 w-4" />
                        <span className="sr-only">Save</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopy(listing.id, listing.content)}
                        className="h-8 w-8"
                      >
                        {copiedId === listing.id ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(listing)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete this listing from your vault.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {listings.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredListings.length} of {listings.length} saved listings
        </div>
      )}
    </div>
  )
}
