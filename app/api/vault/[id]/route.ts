import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PATCH /api/vault/[id] — rename or edit a listing
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    const body = await request.json()
    const updates: Record<string, string | null> = {}

    // Only allow specific fields to be updated
    if (body.title !== undefined) updates.title = body.title?.trim() || null
    if (body.content !== undefined) updates.content = body.content
    if (body.address !== undefined) updates.address = body.address || null

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("vault_listings")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Vault update error:", error)
      return NextResponse.json({ error: "Failed to update listing." }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 })
    }

    return NextResponse.json({ listing: data })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Vault PATCH error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/vault/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { error } = await supabase
      .from("vault_listings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Vault delete error:", error)
      return NextResponse.json({ error: "Failed to delete listing." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Vault DELETE error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
