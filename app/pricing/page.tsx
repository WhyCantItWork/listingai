'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, Building2, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type Tier = 'free' | 'pro' | 'lister' | 'team'
type Interval = 'monthly' | 'yearly'

interface Plan {
  name: string
  monthlyPrice: string
  yearlyPrice: string
  monthlyEquivalent: string
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
    monthlyPrice: '£0',
    yearlyPrice: '£0',
    monthlyEquivalent: '£0',
    description: 'Try Tenancy with no commitment',
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
    monthlyPrice: '£29',
    yearlyPrice: '£289',
    monthlyEquivalent: '£24',
    description: 'For working letting agents',
    icon: Building2,
    features: [
      '100 listings per month (20× Free)',
      'All 6 tone presets',
      'Length options (Short/Medium/Long)',
      'Audience targeting',
      'PDF export',
      'Vault storage (50 listings)',
      'Top up listings & vault when needed',
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
    monthlyPrice: '£59',
    yearlyPrice: '£589',
    monthlyEquivalent: '£49',
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
    monthlyPrice: '£90',
    yearlyPrice: '£897',
    monthlyEquivalent: '£75',
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
  const [interval, setInterval] = useState<Interval>('monthly')
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

    // Pick the price ID based on the chosen interval
    const priceIdMap: Record<Exclude<Tier, 'free'>, { monthly?: string; yearly?: string }> = {
      pro: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      },
      lister: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_LISTER_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_LISTER_YEARLY_PRICE_ID,
      },
      team: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_PRICE_ID,
      },
    }

    const priceId = priceIdMap[tier][interval]
    if (!priceId) {
      alert('Pricing not configured for this option yet.')
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
          Built for UK letting agents
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Material Information–ready listings. Lettings-specific compliance. Cancel anytime.
        </p>
      </div>

    {/* Monthly / Yearly toggle */}
<div className="mt-10 flex items-center justify-center gap-3">
  <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
    <button
      onClick={() => setInterval("monthly")}
      className={cn(
        "rounded-full px-6 py-2 text-sm font-medium transition-all",
        interval === "monthly"
          ? "bg-primary text-primary-foreground shadow"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      Monthly
    </button>
    <button
      onClick={() => setInterval("yearly")}
      className={cn(
        "rounded-full px-6 py-2 text-sm font-medium transition-all flex items-center gap-1.5",
        interval === "yearly"
          ? "bg-primary text-primary-foreground shadow"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      Yearly
      <span className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all",
        interval === "yearly"
          ? "bg-emerald-400 text-emerald-950 shadow-md shadow-emerald-500/30"
          : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
      )}>
        −17%
      </span>
    </button>
  </div>
  {interval === "monthly" && (
    <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 animate-pulse">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l-2-2m2 2l4-4m-4 4l4 4M19 12h-14" transform="rotate(180 12 12)"/>
      </svg>
      <span className="font-semibold">Save with yearly</span>
    </div>
  )}
</div>


      <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-4">
        {plans.map((plan) => {
          const isFree = plan.tier === 'free'
          const displayPrice = interval === 'yearly' && !isFree ? plan.yearlyPrice : plan.monthlyPrice
          const period = isFree ? 'forever' : interval === 'yearly' ? 'per year' : 'per month'
          const showSavings = interval === 'yearly' && !isFree

          return (
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
                  <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
                  <span className="text-muted-foreground text-sm"> /{period}</span>
                </div>
                {showSavings && (
                  <p className="mt-1 text-xs text-muted-foreground">
  {plan.monthlyEquivalent}/mo billed annually
</p>

                )}
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
          )
        })}
      </div>

<div className="mx-auto mt-16 max-w-2xl text-center text-sm text-muted-foreground">
  <p>All paid plans are billed in GBP. Cancel anytime — no questions asked.</p>
  {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true" && (
    <p className="mt-1">Test mode active — use card <code className="bg-muted px-1.5 py-0.5 rounded text-xs">4242 4242 4242 4242</code> to try it out.</p>
  )}
</div>

    </div>
  )
}
