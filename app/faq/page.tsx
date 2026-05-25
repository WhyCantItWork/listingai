'use client'

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, HelpCircle, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FAQ {
  category: string
  question: string
  answer: React.ReactNode
}

const faqs: FAQ[] = [
  // Getting started
  {
    category: "Getting started",
    question: "What is Tenancy?",
    answer: (
      <>
        Tenancy is an AI tool built for UK letting agents. It generates compliant property listing descriptions, scans for legal issues like discriminatory language or banned fees, and produces full Material Information packs ready for Rightmove, Zoopla, and OnTheMarket.
      </>
    ),
  },
  {
    category: "Getting started",
    question: "Who is Tenancy for?",
    answer: (
      <>
        UK letting agents and small lettings agencies. Whether you're a sole trader managing 5 properties or an agency handling 200, Tenancy speeds up the listing process and helps you stay compliant with UK lettings law.
      </>
    ),
  },
  {
    category: "Getting started",
    question: "Do I need any property law knowledge to use Tenancy?",
    answer: (
      <>
        No. Tenancy bakes UK lettings law into every listing — Material Information requirements, Equality Act 2010, Tenant Fees Act 2019, Right to Rent. The compliance checker also flags risky language so you don't accidentally publish something illegal. That said, Tenancy isn't a substitute for legal advice — for genuinely complex situations, consult a solicitor.
      </>
    ),
  },

  // Plans & pricing
  {
    category: "Plans & pricing",
    question: "What's the difference between Free, Pro, Lister, and Team?",
    answer: (
      <>
        <strong>Free</strong> gives you 5 listings/month with basic features. <strong>Pro</strong> (£29/mo) gives 100 listings, vault storage for 50 listings, and PDF export. <strong>Lister</strong> (£59/mo) gives unlimited listings, unlimited vault storage, A/B testing, and the compliance checker. <strong>Team</strong> (£90/mo) is for agencies — currently the same as Lister with team features rolling out soon.
      </>
    ),
  },
  {
    category: "Plans & pricing",
    question: "How does annual billing work?",
    answer: (
      <>
        Pay yearly and you get 17% off — that's two months free per year. Same features, just billed annually instead of monthly. You can switch between monthly and yearly anytime via the billing portal.
      </>
    ),
  },
  {
    category: "Plans & pricing",
    question: "Can I cancel anytime?",
    answer: (
      <>
        Yes. Go to your Account page, click "Manage subscription", and cancel from the Stripe portal. You'll keep access until the end of your current billing period — no early-termination charges, no hassle.
      </>
    ),
  },
  {
    category: "Plans & pricing",
    question: "Do you offer refunds?",
    answer: (
      <>
        We don't pro-rate refunds for partial months, but you keep access until your billing period ends. If something goes seriously wrong, email us at vr047836@gmail.com and we'll sort it out.
      </>
    ),
  },

  // Listings
  {
    category: "Listings & generation",
    question: "What counts as one listing?",
    answer: (
      <>
        Each time you click "Generate tenancy listing" counts as one listing — even if you generate 3 versions at once on Lister, that's still one usage. Regenerating a single version with a different tone also counts as one listing.
      </>
    ),
  },
  {
    category: "Listings & generation",
    question: "Are the listings really compliant with UK law?",
    answer: (
      <>
        Tenancy is built around UK lettings rules, including the 2024 Material Information requirements, the Equality Act 2010, the Tenant Fees Act 2019, and Right to Rent. Every generated listing includes a full MI table and avoids language that breaches these laws. The compliance checker catches issues if you paste your own text. That said, you should always review listings before publishing — Tenancy is a tool, not a substitute for your professional judgement.
      </>
    ),
  },
  {
    category: "Listings & generation",
    question: "Can I edit the AI output?",
    answer: (
      <>
        Yes, freely. Once a listing is generated you can copy it, save it to your vault, edit it inside the vault, and re-export. Most agents tweak a few details — tone, specific local references — to make it feel more personal.
      </>
    ),
  },
  {
    category: "Listings & generation",
    question: "Do generated listings work for Rightmove and Zoopla?",
    answer: (
      <>
        Yes. The descriptions are written for those portals specifically — appropriate length, scan-friendly structure, and Material Information formatted for direct paste-in.
      </>
    ),
  },

  // Top-ups
  {
    category: "Top-ups",
    question: "What are top-ups and how do they work?",
    answer: (
      <>
        Top-ups are one-off purchases that add to your monthly allowance for 30 days. <strong>+50 listings</strong> for £9, <strong>+100 listings</strong> for £15, or <strong>+25 vault slots</strong> for £5. Buy them from your Account page when you need extra capacity.
      </>
    ),
  },
  {
    category: "Top-ups",
    question: "Do top-ups stack if I buy more than one?",
    answer: (
      <>
        Yes. If you buy a second top-up before the first expires, the listings stack and the 30-day window resets to the latest purchase. So buying +50 today and +100 next week gives you 150 bonus listings, all valid for 30 days from the second purchase.
      </>
    ),
  },
  {
    category: "Top-ups",
    question: "What happens to unused top-up listings after 30 days?",
    answer: (
      <>
        They expire. Top-ups are a 30-day boost on top of your subscription, not permanent credit. If you regularly need more than your plan allows, upgrading to Lister (unlimited) is usually better value than repeatedly buying top-ups.
      </>
    ),
  },
  {
    category: "Top-ups",
    question: "Can free users buy top-ups?",
    answer: (
      <>
        No. Top-ups are only available on Pro plans. Free users need to upgrade to Pro first, and Lister/Team users already have unlimited listings so don't need them.
      </>
    ),
  },

  // Vault
  {
    category: "Vault",
    question: "What's the Vault?",
    answer: (
      <>
        Your saved listings. Each listing in the Vault can be searched, renamed, edited, sent to the compliance checker, sent to A/B testing, or exported as a PDF. Pro plans get 50 vault slots, Lister and Team get unlimited.
      </>
    ),
  },
  {
    category: "Vault",
    question: "Are my vault listings synced across devices?",
    answer: (
      <>
        Yes. Vault listings live in our database and are tied to your account, so you can log in from any device and see the same listings.
      </>
    ),
  },

  // Account & data
  {
    category: "Account & data",
    question: "How do I delete my account?",
    answer: (
      <>
        Go to your Account page and scroll to the Delete account section. Type DELETE to confirm. Your account, all vault listings, and any active subscription are permanently removed within seconds. There's no recovery — make sure you've exported anything important first.
      </>
    ),
  },
  {
    category: "Account & data",
    question: "Do you train AI on my listings?",
    answer: (
      <>
        No. Your listings are sent to our AI provider (Anthropic) only at the moment of generation, and they aren't retained or used for training. We don't sell your data, and we don't store your listings anywhere except your private vault.
      </>
    ),
  },
  {
    category: "Account & data",
    question: "Can I change my email address?",
    answer: (
      <>
        Yes. On your Account page, enter the new email and click "Send confirmation". You'll get a link at the new address — clicking it confirms the change. Your old email keeps working until you confirm.
      </>
    ),
  },
  {
    category: "Account & data",
    question: "How do I sign in?",
    answer: (
      <>
        Tenancy uses magic-link authentication — no passwords. Enter your email on the login page and we'll send you a 6-digit code and a sign-in link. Use either to sign in. Codes expire after one hour.
      </>
    ),
  },

  // Support
  {
    category: "Support",
    question: "Something's wrong — how do I get help?",
    answer: (
      <>
        Email <a href="mailto:vr047836@gmail.com" className="text-primary underline">vr047836@gmail.com</a> with details of what went wrong (screenshot helps). We aim to reply within one working day.
      </>
    ),
  },
  {
    category: "Support",
    question: "Do you offer refunds for accidental purchases?",
    answer: (
      <>
        Top-ups are non-refundable, but if you bought one by mistake within the last 24 hours and haven't used the extra capacity, email us and we'll usually refund as a goodwill gesture. Subscription refunds work as described above — cancel anytime, keep access until the period ends.
      </>
    ),
  },
]

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const categories = Array.from(new Set(faqs.map((f) => f.category)))

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-muted-foreground">
          Everything you need to know about Tenancy. Can't find what you're looking for?{" "}
          <a href="mailto:vr047836@gmail.com" className="text-primary underline">
            Email us
          </a>
          .
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((category) => (
          <div key={category}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {category}
            </h2>
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {faqs
                  .map((f, i) => ({ ...f, idx: i }))
                  .filter((f) => f.category === category)
                  .map((f) => (
                    <button
                      key={f.idx}
                      onClick={() => setOpenIdx(openIdx === f.idx ? null : f.idx)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                        <span className="font-medium text-foreground pr-4">{f.question}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                            openIdx === f.idx && "rotate-180"
                          )}
                        />
                      </div>
                      {openIdx === f.idx && (
                        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {f.answer}
                        </div>
                      )}
                    </button>
                  ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Card className="mt-12 border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Mail className="h-8 w-8 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Still got questions?</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            We aim to reply to every email within one working day.
          </p>
          <a
            href="mailto:vr047836@gmail.com"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Email support
          </a>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-primary underline">
          ← Back to Tenancy
        </Link>
      </div>
    </div>
  )
}
