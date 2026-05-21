'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, Building2, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type Tier = 'free' | 'pro' | 'lister' | 'team'

interface Plan {
  name: string
  price: string
  period: string
  description: string
  icon: typeof Sparkles
  features: string[]
  comingSoon?: string[]
  notIncluded: string[]
  cta: string
  tier: Tier
  highlighted: boolean
  badge?: string
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Try out ListingAI risk-free',
    icon: Sparkles,
    features: [
      '5 listings per month',
      'Standard AI generation',
      '3 basic tone presets',
      'Copy to clipboard',
    ],
    notIncluded: [
      'Vault storage',
      'PDF export',
      'A/B testing',
      'Compliance checker',
      'Length & audience options',
    ],
    cta: 'Get started',
    tier: 'free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '£29',
    period: 'per month',
    description: 'For working estate agents',
    icon: Building2,
    features: [
      '100 listings per month (20× Free)',
      'All 6 tone presets',
      'Length options (Short/Medium/Long)',
      'Audience targeting',
      'PDF export',
      'Vault storage (50 listings)',
      'Email support',
    ],
    notIncluded: [
      'Multiple variants at once',
      'A/B testing sandbox',
      'Compliance checker',
    ],
    cta: 'Subscribe to Pro',
    tier: 'pro',
    highlighted: false,
  },
  {
    name: 'Lister',
    price: '£59',
    period: 'per month',
    description: 'For power users running listings daily',
    icon: Zap,
    features: [
      'Unlimited listings',
      'Everything in Pro',
      'Generate up to 3 variants at once',
      'A/B testing sandbox',
      'Compliance checker',
      'Unlimited Vault storage',
      'Priority email support',
    ],
    notIncluded: [],
    cta: 'Subscribe to Lister',
    tier: 'lister',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    price: '£90',
    period: 'per month',
    description: 'For agencies and brokerages',
    icon: Users,
    features: [
      'Everything in Lister',
      'Priority email support',
      'Early access to new features',
    ],
    comingSoon: [
      'Multiple team member seats',
      'Shared team Vault',
      'Brand voice training',
      'Custom templates',
      'Analytics dashboard',
      'API access',
      'Dedicated account manager',
    ],
    notIncluded: [],
    cta: 'Subscribe to Team',
    tier: 'team',
    highlighted: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (tier: Tier) => {
    setLoading(tier)

    if (tier === 'free') {
      router.push('/generator')
      return
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/signup')
      return
    }

    const priceIdMap: Record<Exclude<Tier, 'free'>, string | undefined> = {
      pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      lister: process.env.NEXT_PUBLIC_STRIPE_LISTER_PRICE_ID,
      team: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
    }

    const priceId = priceIdMap[tier]
    if (!priceId) {
      alert('Pricing not configured for this tier yet.')
      setLoading(null)
      return
    }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert(data.error || 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Start free. Upgrade when you outgrow it. Cancel anytime.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'relative flex flex-col border-border bg-card',
              plan.highlighted && 'border-2 border-primary shadow-lg lg:scale-105'
            )}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>
            )}
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <plan.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm"> /{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
                {plan.comingSoon?.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-4 items-center rounded bg-amber-500/20 px-1.5 text-[10px] font-bold uppercase text-amber-600 shrink-0">
                      Soon
                    </span>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-muted-foreground/50">
                    <span className="mt-0.5 h-4 w-4 shrink-0 text-center">—</span>
                    <span className="text-sm line-through">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubscribe(plan.tier)}
                disabled={loading === plan.tier}
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                {loading === plan.tier ? 'Loading...' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-2xl text-center text-sm text-muted-foreground">
        <p>All paid plans are billed monthly. Cancel anytime — no questions asked.</p>
        <p className="mt-1">Test mode active — use card <code className="bg-muted px-1.5 py-0.5 rounded text-xs">4242 4242 4242 4242</code> to try it out.</p>
      </div>
    </div>
  )
}
