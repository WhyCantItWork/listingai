import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const VAULT_CAPS: Record<string, number | null> = {
  free: 0,
  pro: 50,
  lister: null,
}

// GET /api/vault — list all the user's saved listings
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("vault_listings")
      .select("id, title, content, address, property_type, price, rent, furnished, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Vault list error:", error)
      return NextResponse.json({ error: "Failed to load vault." }, { status: 500 })
    }

    return NextResponse.json({ listings: data ?? [] })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Vault GET error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/vault — save a new listing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { title, content, address, property_type, price, rent, furnished } = await request.json()

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Listing content is required." }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("Vault profile lookup error:", profileError)
      return NextResponse.json({ error: "Profile not found." }, { status: 404 })
    }

    // Free can't save
    if (profile.tier === "free") {
      return NextResponse.json(
        { error: "vault_locked", message: "Vault storage requires a paid plan. Upgrade to Pro to start saving listings." },
        { status: 403 }
      )
    }

    const effectiveCap = VAULT_CAPS[profile.tier] ?? null

    // Count current listings if there's a cap
    if (effectiveCap !== null) {
      const { count } = await supabase
        .from("vault_listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (count !== null && count >= effectiveCap) {
        return NextResponse.json(
          {
            error: "vault_full",
            message: `Your vault is full (${count} / ${effectiveCap}). Upgrade to Lister for unlimited storage.`,
            used: count,
            limit: effectiveCap,
          },
          { status: 402 }
        )
      }
    }

    const { data, error } = await supabase
      .from("vault_listings")
      .insert({
        user_id: user.id,
        title: title?.trim() || null,
        content,
        address: address || null,
        property_type: property_type || null,
        price: price || null,
        rent: rent || null,
        furnished: furnished || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Vault insert error:", error)
      return NextResponse.json({ error: "Failed to save listing." }, { status: 500 })
    }

    return NextResponse.json({ listing: data })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Vault POST error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
