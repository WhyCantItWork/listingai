import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown"
    console.error("Webhook signature failed:", msg)
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.userId

        if (!userId) {
          console.error("No userId in session")
          break
        }

        // BRANCH 1: top-up (one-off payment)
        if (session.mode === "payment") {
          const topupType = session.metadata?.topupType
          const topupAmount = parseInt(session.metadata?.topupAmount || "0", 10)

          if (!topupType || !topupAmount) {
            console.error("Top-up missing metadata", session.metadata)
            break
          }

          const { data: profile } = await getSupabaseAdmin()
            .from("profiles")
            .select("bonus_listings, bonus_listings_expires_at, bonus_vault_slots, bonus_vault_expires_at")
            .eq("id", userId)
            .single()

          const now = new Date()
          const newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

          if (topupType === "listings") {
            const existingExpiry = profile?.bonus_listings_expires_at
              ? new Date(profile.bonus_listings_expires_at)
              : null
            const stillValid = existingExpiry && existingExpiry > now
            const existingBonus = stillValid ? (profile?.bonus_listings || 0) : 0

            await getSupabaseAdmin()
              .from("profiles")
              .update({
                bonus_listings: existingBonus + topupAmount,
                bonus_listings_expires_at: newExpiry.toISOString(),
              })
              .eq("id", userId)

            console.log(`User ${userId} bought +${topupAmount} listings. New total: ${existingBonus + topupAmount}, expires ${newExpiry.toISOString()}`)
          }

          if (topupType === "vault") {
            const existingExpiry = profile?.bonus_vault_expires_at
              ? new Date(profile.bonus_vault_expires_at)
              : null
            const stillValid = existingExpiry && existingExpiry > now
            const existingBonus = stillValid ? (profile?.bonus_vault_slots || 0) : 0

            await getSupabaseAdmin()
              .from("profiles")
              .update({
                bonus_vault_slots: existingBonus + topupAmount,
                bonus_vault_expires_at: newExpiry.toISOString(),
              })
              .eq("id", userId)

            console.log(`User ${userId} bought +${topupAmount} vault slots. New total: ${existingBonus + topupAmount}`)
          }

          break
        }

        // BRANCH 2: subscription
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const tier =
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? "pro" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ? "pro" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_LISTER_PRICE_ID ? "lister" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_LISTER_YEARLY_PRICE_ID ? "lister" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID ? "team" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE_ID ? "team" : "free"

        await getSupabaseAdmin()
          .from("profiles")
          .update({
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            listings_used: 0,
            listings_reset_at: new Date().toISOString(),
          })
          .eq("id", userId)

        console.log(`User ${userId} upgraded to ${tier}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await getSupabaseAdmin()
          .from("profiles")
          .update({ tier: "free", stripe_subscription_id: null })
          .eq("stripe_subscription_id", subscription.id)
        console.log(`Subscription ${subscription.id} cancelled, user reverted to free`)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0].price.id
        const tier =
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? "pro" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ? "pro" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_LISTER_PRICE_ID ? "lister" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_LISTER_YEARLY_PRICE_ID ? "lister" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID ? "team" :
          priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE_ID ? "team" : "free"

        await getSupabaseAdmin()
          .from("profiles")
          .update({ tier })
          .eq("stripe_subscription_id", subscription.id)

        console.log(`Subscription ${subscription.id} updated to ${tier}`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown"
    console.error("Webhook handler error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
