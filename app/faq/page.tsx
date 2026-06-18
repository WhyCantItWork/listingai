'use client'

import { useState, useEffect, useRef } from "react"
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
  {
    category: "Getting started",
    question: "What is Tenancy?",
    answer: (
      <>
        Tenancy is an AI tool built for UK letting agents. It generates property listing descriptions, scans for risky language that often breaches UK lettings law, and produces full Material Information packs ready for Rightmove, Zoopla, and OnTheMarket.
      </>
    ),
  },
  {
    category: "Getting started",
    question: "Who is Tenancy for?",
    answer: (
      <>
        UK letting agents and small lettings agencies. Whether you&apos;re a sole trader managing 5 properties or an agency handling 200, Tenancy speeds up the listing process and helps you avoid common compliance breaches.
      </>
    ),
  },
  {
    category: "Getting started",
    question: "Do I need any property law knowledge to use Tenancy?",
    answer: (
      <>
        No. Tenancy is built around UK lettings rules — Material Information requirements, Equality Act 2010, Tenant Fees Act 2019, Right to Rent, and the Renters&apos; Rights Act 2025. The compliance checker flags risky language so you don&apos;t accidentally publish something illegal. <strong>That said, Tenancy is not legal advice.</strong> For complex situations, consult a solicitor or check official guidance from the NRLA, Shelter, or gov.uk.
      </>
    ),
  },

  {
    category: "Plans & pricing",
    question: "What's the difference between Free, Pro, and Lister?",
    answer: (
      <>
        <strong>Free</strong> gives you 5 listings/month with basic features. <strong>Pro</strong> (£10/mo) gives 100 listings, 75 compliance scans per month, up to 2 variants per generation, vault storage for 50 listings, and PDF export. <strong>Lister</strong> (£25/mo) gives unlimited listings, unlimited compliance scans, up to 3 variants, A/B testing sandbox, and unlimited vault storage.
      </>
    ),
  },
  {
    category: "Plans & pricing",
    question: "How does annual billing work?",
    answer: (
      <>
        Pay yearly and you get roughly 17% off — two months free per year. Same features, just billed annually instead of monthly. You can switch between monthly and yearly anytime via the billing portal.
      </>
    ),
  },
  {
    category: "Plans & pricing",
    question: "Can I cancel anytime?",
    answer: (
      <>
        Yes. Go to your Account page, click &ldquo;Manage subscription&rdquo;, and cancel from the Stripe portal. You&apos;ll keep access until the end of your current billing period — no early-termination charges, no hassle.
      </>
    ),
  },
  {
    category: "Plans & pricing",
    question: "Do you offer refunds?",
    answer: (
      <>
        We don&apos;t pro-rate refunds for partial months, but you keep access until your billing period ends. If something goes seriously wrong, email us at vr047836@gmail.com and we&apos;ll sort it out.
      </>
    ),
  },

  {
    category: "Listings & generation",
    question: "What counts as one listing?",
    answer: (
      <>
        Each time you click &ldquo;Generate tenancy listing&rdquo; counts as one listing — even if you generate 2 or 3 variants at once, that&apos;s still one usage. Regenerating a single variant with a different tone also counts as one listing.
      </>
    ),
  },
  {
    category: "Listings & generation",
    question: "Are the listings really compliant with UK law?",
    answer: (
      <>
        Tenancy is built to help you avoid the most common breaches in UK lettings law — including the <strong>Renters&apos; Rights Act 2025</strong>, the 2024 Material Information requirements, the Equality Act 2010, the Tenant Fees Act 2019, and Right to Rent. It flags risky phrasing like &ldquo;no DSS&rdquo;, &ldquo;12-month minimum&rdquo;, rental bidding language, blanket no-pets clauses, and other patterns that have caused complaints or fines. <strong>This is not legal advice.</strong> Tenancy is a checker and a writing tool — not a substitute for a solicitor, the <a href="[nrla.org.uk](https://nrla.org.uk)" target="_blank" rel="noopener" className="text-primary underline">NRLA</a>, or official guidance. For anything genuinely uncertain, consult a qualified property law professional or check <a href="[gov.uk](https://gov.uk)" target="_blank" rel="noopener" className="text-primary underline">gov.uk</a> and <a href="[england.shelter.org.uk](https://england.shelter.org.uk)" target="_blank" rel="noopener" className="text-primary underline">Shelter</a>.
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
  {
    category: "Listings & generation",
    question: "How many variants can I generate at once?",
    answer: (
      <>
        Free generates 1 listing per request. <strong>Pro</strong> can generate up to 2 variants per request — different tone or audience for comparison. <strong>Lister</strong> can generate up to 3 variants and also unlocks the full A/B testing sandbox.
      </>
    ),
  },

  {
    category: "Compliance checker",
    question: "How does the compliance checker work?",
    answer: (
      <>
        Paste any UK rental listing into the checker. It scans for risky language — discriminatory phrasing, banned fees, outdated terminology, Renters&apos; Rights Act breaches — and gives you a short, drop-in replacement for each flagged phrase. Click to replace, or rewrite manually.
      </>
    ),
  },
  {
    category: "Compliance checker",
    question: "Who can use the compliance checker?",
    answer: (
      <>
        <strong>Pro</strong> users get 75 compliance scans per month. <strong>Lister</strong> users get unlimited scans. Free users can&apos;t use the compliance checker — upgrade to Pro or Lister to unlock.
      </>
    ),
  },
  {
    category: "Compliance checker",
    question: "Is this legal advice?",
    answer: (
      <>
        <strong>No.</strong> The compliance checker catches common breaches but it&apos;s a tool, not a solicitor. For complex situations consult a qualified property law professional or check the <a href="[nrla.org.uk](https://nrla.org.uk)" target="_blank" rel="noopener" className="text-primary underline">NRLA</a>, <a href="[england.shelter.org.uk](https://england.shelter.org.uk)" target="_blank" rel="noopener" className="text-primary underline">Shelter</a>, or <a href="[gov.uk](https://gov.uk)" target="_blank" rel="noopener" className="text-primary underline">gov.uk</a>.
      </>
    ),
  },

  {
    category: "Vault",
    question: "What's the Vault?",
    answer: (
      <>
        Your saved listings. Each listing in the Vault can be searched, renamed, edited, sent to the compliance checker, sent to A/B testing, or exported as a PDF. Pro plans get 50 vault slots, Lister gets unlimited.
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

  {
    category: "Account & data",
    question: "How do I delete my account?",
    answer: (
      <>
        Go to your Account page and scroll to the Delete account section. Type DELETE to confirm. Your account, all vault listings, and any active subscription are permanently removed within seconds. There&apos;s no recovery — make sure you&apos;ve exported anything important first.
      </>
    ),
  },
  {
    category: "Account & data",
    question: "Do you train AI on my listings?",
    answer: (
      <>
        No. Your listings are sent to our AI provider (Anthropic) only at the moment of generation, and they aren&apos;t retained or used for training. We don&apos;t sell your data, and we don&apos;t store your listings anywhere except your private vault.
      </>
    ),
  },
  {
    category: "Account & data",
    question: "Can I change my email address?",
    answer: (
      <>
        Yes. On your Account page, enter the new email and click &ldquo;Send confirmation&rdquo;. You&apos;ll get a link at the new address — clicking it confirms the change. Your old email keeps working until you confirm.
      </>
    ),
  },
  {
    category: "Account & data",
    question: "How do I sign in?",
    answer: (
      <>
        Tenancy uses magic-link authentication — no passwords. Enter your email on the login page and we&apos;ll send you a 6-digit code and a sign-in link. Use either to sign in. Codes expire after one hour.
      </>
    ),
  },

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
        Subscription refunds work as described above — cancel anytime, keep access until the period ends. If you signed up by mistake in the last 24 hours and haven&apos;t generated any listings, email us and we&apos;ll refund as a goodwill gesture.
      </>
    ),
  },
]

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      {children}
    </div>
  )
}

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const categories = Array.from(new Set(faqs.map((f) => f.category)))

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 animate-[tenancy-rise_0.6s_ease-out]">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl animate-[tenancy-rise_0.6s_ease-out]">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-muted-foreground animate-[tenancy-rise_0.6s_ease-out]">
          Everything you need to know about Tenancy. Can&apos;t find what you&apos;re looking for?{" "}
          <a href="mailto:vr047836@gmail.com" className="text-primary underline">
            Email us
          </a>
          .
        </p>
      </div>

      <div className="space-y-10">
        {categories.map((category, ci) => (
          <Reveal key={category} delay={ci * 80}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {category}
            </h2>
            <Card className="transition-shadow duration-300 hover:shadow-md">
              <CardContent className="divide-y divide-border p-0">
                {faqs
                  .map((f, i) => ({ ...f, idx: i }))
                  .filter((f) => f.category === category)
                  .map((f) => {
                    const isOpen = openIdx === f.idx
                    return (
                      <button
                        key={f.idx}
                        onClick={() => setOpenIdx(isOpen ? null : f.idx)}
                        className="group w-full text-left"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center justify-between p-5 transition-colors group-hover:bg-muted/30">
                          <span className="font-medium text-foreground pr-4 transition-colors group-hover:text-primary">
                            {f.question}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ease-out",
                              isOpen && "rotate-180 text-primary"
                            )}
                          />
                        </div>
                        {/* Animated height + fade panel */}
                        <div
                          className={cn(
                            "grid transition-all duration-300 ease-out",
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                              {f.answer}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <Card className="mt-12 border-primary/30 bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Mail className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Still got questions?</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We aim to reply to every email within one working day.
            </p>
            <a
              href="mailto:vr047836@gmail.com"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
            >
              Email support
            </a>
          </CardContent>
        </Card>
      </Reveal>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-primary underline">
          ← Back to Tenancy
        </Link>
      </div>
    </div>
  )
}
