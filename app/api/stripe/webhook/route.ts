import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Use the service role key on the server so we can update profiles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
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
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error("No userId in session")
          break
        }

        // Determine tier from the subscription's price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const tier =
        priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ? "pro" :
        priceId === process.env.NEXT_PUBLIC_STRIPE_LISTER_PRICE_ID ? "lister" :
        priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID ? "team" : "free"


        await supabaseAdmin
          .from("profiles")
          .update({
            tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            listings_used: 0,
            listings_reset_at: new Date().toISOString(),
          })
          .eq("id", userId)

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin
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
        priceId === process.env.NEXT_PUBLIC_STRIPE_LISTER_PRICE_ID ? "lister" :
        priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID ? "team" : "free"


        await supabaseAdmin
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
