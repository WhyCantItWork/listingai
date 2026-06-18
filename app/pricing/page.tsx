'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, Building2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type Tier = 'free' | 'pro' | 'lister'
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
    monthlyPrice: '£10',
    yearlyPrice: '£100',
    monthlyEquivalent: '£8.33',
    description: 'For working letting agents',
    icon: Building2,
    features: [
      '100 listings per month (20× Free)',
      '75 compliance scans per month',
      'Up to 2 variants per generation',
      'All 6 tone presets',
      'Length options (Short/Medium/Long)',
      'Audience targeting',
      'PDF export',
      'Vault storage (50 listings)',
      'Email support',
    ],
    notIncluded: [
      'Unlimited listings',
      'A/B testing sandbox',
      '3 variants at once',
    ],
    cta: 'Subscribe to Pro',
    tier: 'pro',
    highlighted: false,
  },
  {
    name: 'Lister',
    monthlyPrice: '£25',
    yearlyPrice: '£250',
    monthlyEquivalent: '£20.83',
    description: 'For power users running listings daily',
    icon: Zap,
    features: [
      'Unlimited listings',
      'Unlimited compliance scans',
      'Everything in Pro',
      'Generate up to 3 variants at once',
      'A/B testing sandbox',
      'Unlimited Vault storage',
      'Priority email support',
    ],
    notIncluded: [],
    cta: 'Subscribe to Lister',
    tier: 'lister',
    highlighted: true,
    badge: 'Most Popular',
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [interval, setIntervalState] = useState<Interval>('monthly')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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

    const priceIdMap: Record<Exclude<Tier, 'free'>, { monthly?: string; yearly?: string }> = {
      pro: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      },
      lister: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_LISTER_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_LISTER_YEARLY_PRICE_ID,
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
      <div
        className={cn(
          'mx-auto max-w-2xl text-center transition-all duration-700 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Built for UK letting agents
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Material Information–ready listings. Lettings-specific compliance. Cancel anytime.
        </p>
      </div>

            {/* Monthly / Yearly toggle */}
      <div
        className={cn(
          'mt-10 flex items-center justify-center transition-all duration-700 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
        style={{ transitionDelay: '120ms' }}
      >
        <div className="relative grid grid-cols-2 rounded-full border border-border bg-card p-1 shadow-sm">
          {/* Sliding thumb — exactly half the track, offset by the padding */}
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow transition-transform duration-300 ease-out"
            style={{
              transform: interval === 'yearly' ? 'translateX(100%)' : 'translateX(0)',
            }}
          />
          <button
            onClick={() => setIntervalState('monthly')}
            className={cn(
              'relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors',
              interval === 'monthly' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIntervalState('yearly')}
            className={cn(
              'relative z-10 flex items-center justify-center gap-1.5 rounded-full px-6 py-2 text-sm font-medium transition-colors',
              interval === 'yearly' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Yearly
            <span
              className={cn(
                'text-xs font-semibold transition-colors',
                interval === 'yearly' ? 'text-primary-foreground/80' : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              save 17%
            </span>
          </button>
        </div>
      </div>


      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const isFree = plan.tier === 'free'
          const displayPrice = interval === 'yearly' && !isFree ? plan.yearlyPrice : plan.monthlyPrice
          const period = isFree ? 'forever' : interval === 'yearly' ? 'per year' : 'per month'
          const showSavings = interval === 'yearly' && !isFree

          return (
            <Card
              key={plan.name}
              style={{ transitionDelay: `${200 + i * 120}ms` }}
              className={cn(
                'group relative flex flex-col border-border bg-card transition-all duration-700 ease-out',
                'hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5',
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
                plan.highlighted &&
                  'border-2 border-primary shadow-lg shadow-primary/10 lg:scale-105 lg:hover:scale-[1.07]'
              )}
            >
              {plan.highlighted && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px -z-10 rounded-xl opacity-40 blur-xl"
                  style={{
                    background:
                      'radial-gradient(60% 60% at 50% 0%, var(--color-primary) 0%, transparent 70%)',
                  }}
                />
              )}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground whitespace-nowrap shadow-md shadow-primary/20">
                    {plan.badge}
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <plan.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span
                    key={displayPrice}
                    className="inline-block text-4xl font-bold text-foreground animate-[tenancy-rise_0.35s_ease-out]"
                  >
                    {displayPrice}
                  </span>
                  <span className="text-muted-foreground text-sm"> /{period}</span>
                </div>
                <p
                  className={cn(
                    'mt-1 text-xs text-muted-foreground transition-opacity duration-300',
                    showSavings ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {plan.monthlyEquivalent}/mo billed annually
                </p>
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
                  className="w-full transition-transform active:scale-[0.98]"
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {loading === plan.tier ? 'Loading...' : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div
        className={cn(
          'mx-auto mt-16 max-w-2xl text-center text-sm text-muted-foreground transition-all duration-700 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
        style={{ transitionDelay: '600ms' }}
      >
        <p>All paid plans are billed in GBP. Cancel anytime — no questions asked.</p>
        {process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true' && (
          <p className="mt-1">
            Test mode active — use card{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">4242 4242 4242 4242</code> to try it out.
          </p>
        )}
      </div>
    </div>
  )
}
