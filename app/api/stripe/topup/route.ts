import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

const VALID_TOPUPS: Record<string, { priceId: string | undefined; amount: number; type: "listings" | "vault"; label: string }> = {
  "50": {
    priceId: process.env.NEXT_PUBLIC_STRIPE_TOPUP_50_PRICE_ID,
    amount: 50,
    type: "listings",
    label: "+50 Listings",
  },
  "100": {
    priceId: process.env.NEXT_PUBLIC_STRIPE_TOPUP_100_PRICE_ID,
    amount: 100,
    type: "listings",
    label: "+100 Listings",
  },
  "vault-25": {
    priceId: process.env.NEXT_PUBLIC_STRIPE_TOPUP_VAULT_25_PRICE_ID,
    amount: 25,
    type: "vault",
    label: "+25 Vault Slots",
  },
}

export async function POST(req: Request) {
  try {
    const { topupId } = await req.json()
    const config = VALID_TOPUPS[topupId]

    if (!config || !config.priceId) {
      return NextResponse.json({ error: "Invalid top-up." }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 })
    }

    // Top-ups are only for paying tiers
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single()

    if (!profile || profile.tier === "free") {
      return NextResponse.json(
        { error: "Top-ups are available for Pro, Lister, and Team subscribers only." },
        { status: 403 }
      )
    }

    const origin = req.headers.get("origin") || "[localhost](http://localhost:3000)"

    const session = await getStripe().checkout.sessions.create({
      mode: "payment", // one-off, NOT subscription
      payment_method_types: ["card"],
      line_items: [{ price: config.priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${origin}/account?topup=success`,
      cancel_url: `${origin}/account?topup=cancelled`,
      metadata: {
        userId: user.id,
        topupType: config.type,
        topupAmount: String(config.amount),
        topupLabel: config.label,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("Top-up checkout error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
