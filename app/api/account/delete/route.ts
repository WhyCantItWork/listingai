import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    // Fetch profile to check for active subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("id", user.id)
      .single()

    // Cancel any active Stripe subscription first
    if (profile?.stripe_subscription_id) {
      try {
        await getStripe().subscriptions.cancel(profile.stripe_subscription_id)
      } catch (err) {
        // Sub might already be cancelled — log but don't block deletion
        console.error("Stripe cancellation during account deletion:", err)
      }
    }

    // Delete the auth user (cascade deletes the profile + vault_listings via foreign key)
    const admin = getSupabaseAdmin()
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error("Account deletion error:", deleteError)
      return NextResponse.json({ error: "Failed to delete account. Please contact support." }, { status: 500 })
    }

    // Sign the current session out
    await supabase.auth.signOut()

    return NextResponse.json({ ok: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Account delete error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
