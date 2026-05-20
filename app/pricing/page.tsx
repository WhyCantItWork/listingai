import Link from "next/link"
import { Check, Sparkles, Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    description: "Perfect for trying out ListingAI",
    icon: Sparkles,
    features: [
      "5 listings per month",
      "Basic AI generation",
      "Copy to clipboard",
      "Standard tones",
      "Community support",
    ],
    notIncluded: [
      "Vault storage",
      "A/B testing",
      "Compliance checker",
      "Priority support",
    ],
    cta: "Get Started",
    href: "/generator",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "£29",
    period: "per month",
    description: "For busy estate agents",
    icon: Building2,
    features: [
      "Unlimited listings",
      "Advanced AI generation",
      "All premium tones",
      "Vault storage (unlimited)",
      "A/B testing",
      "Compliance checker",
      "Priority email support",
      "Export to PDF",
    ],
    notIncluded: [],
    cta: "Start Free Trial",
    href: "/generator",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Team",
    price: "£99",
    period: "per month",
    description: "For agencies and teams",
    icon: Users,
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team vault sharing",
      "Brand voice training",
      "Custom templates",
      "Analytics dashboard",
      "API access",
      "Dedicated account manager",
      "Phone support",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    href: "/generator",
    highlighted: false,
  },
]

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Yes! Pro and Team plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards, as well as Direct Debit for annual subscriptions.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely. You can change your plan at any time. Changes take effect immediately, with prorated billing.",
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">
          Choose the plan that works best for you. All plans include access to our
          core AI generation features.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative flex flex-col border-border bg-card",
              plan.highlighted && "border-2 border-primary shadow-lg"
            )}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  {plan.badge}
                </span>
              </div>
            )}
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <plan.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-muted-foreground/50"
                  >
                    <span className="mt-0.5 h-4 w-4 shrink-0 text-center">—</span>
                    <span className="text-sm line-through">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question} className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto mt-24 max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Ready to write better listings?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Start your free trial today. No credit card required.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/generator">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
