"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Sparkles,
  FileCheck,
  Shield,
  Download,
  ArrowRight,
  CheckCircle2,
  Zap,
  ScrollText,
  ScanLine,
} from "lucide-react"
import { CheckerDemo } from "@/components/checker-demo"
import { Button } from "@/components/ui/button"
import { ABDemo } from "@/components/ab-demo"
import { VaultDemo } from "@/components/vault-demo"

const features = [
  {
    icon: FileCheck,
    title: "Material Information ready",
    description:
      "Generates Parts A, B, and C-compliant listings out of the box. Filled-in, formatted, ready to paste into Rightmove or Zoopla.",
  },
  {
    icon: Shield,
    title: "UK lettings compliance",
    description:
      "Scans for Right to Rent, deposit caps, DSS-discrimination, and Renters' Rights Act language. Catches risks before they cost you a fine.",
  },
  {
    icon: Download,
    title: "Full tenancy pack PDF",
    description:
      "One-click export of the listing, the MI table, and a clean cover sheet. Send to landlords or attach to portals in seconds.",
  },
  {
    icon: ScrollText,
    title: "Built for the Renters' Rights Act",
    description:
      "Indefinite periodic tenancies, the rental bidding ban, rent-in-advance limits, and pet-request rules — all baked into every listing.",
  },
]

const stats = [
  { value: "Parts A·B·C", label: "Material Information covered" },
  { value: "60s", label: "From details to listing" },
  { value: "RRA 2025", label: "Renters' Rights Act — built in" },
  { value: "UK only", label: "British lettings, not retrofitted" },
]

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
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
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero */}
      <section className="relative isolate">
        {/* Animated gradient backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(60% 60% at 20% 20%, var(--color-primary) 0%, transparent 60%), radial-gradient(50% 50% at 80% 30%, color-mix(in oklch, var(--color-primary) 60%, transparent) 0%, transparent 55%)",
            backgroundSize: "200% 200%",
            animation: "tenancy-drift 18s ease-in-out infinite",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,var(--color-background))]"
        />

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="tenancy-rise mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Built for UK letting agents</span>
            </div>

            <h1 className="tenancy-rise tenancy-rise-1 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Material Information–ready listings,{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                in 60 seconds
              </span>
            </h1>

            <p className="tenancy-rise tenancy-rise-2 mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              Tenancy generates compliant property descriptions, Material
              Information tables, and tenancy packs for UK letting agents. Built
              for Rightmove, Zoopla, and OnTheMarket — out of the box.
            </p>

            <div className="tenancy-rise tenancy-rise-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group w-full sm:w-auto">
                <Link href="/generator">
                  Generate a listing
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="group w-full sm:w-auto">
                <Link href="/free-check">
                  <ScanLine className="mr-2 h-4 w-4" />
                  Check my advert free
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>

            <div className="tenancy-rise tenancy-rise-4 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                5 free listings per month
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Cancel anytime
              </span>
            </div>

            {/* Live checker demo */}
            <div className="tenancy-rise tenancy-rise-4 mt-12">
              <CheckerDemo />
            </div>

            {/* Live A/B demo */}
            <div className="tenancy-rise tenancy-rise-4 mt-6">
              <ABDemo />
            </div>
                        {/* Live vault demo */}
            <div className="tenancy-rise tenancy-rise-4 mt-6">
              <VaultDemo />
            </div>
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="border-t border-border bg-secondary/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything UK letting agents actually need
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Material Information, tenancy packs, and lettings-specific
              compliance — all in one place.
            </p>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for British lettings — not retrofitted from a US sales tool
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              British English, GBP, UK property terms (flat, garden, leasehold),
              and the actual legal framework that applies here.
            </p>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden border-t border-border py-20 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-primary"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(50% 80% at 50% 0%, color-mix(in oklch, white 30%, transparent) 0%, transparent 70%)",
            backgroundSize: "200% 200%",
            animation: "tenancy-drift 14s ease-in-out infinite",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary-foreground/10 p-3">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Stop dreading Material Information.
            </h2>
            <p className="mt-4 text-pretty text-lg text-primary-foreground/80">
              Generate your first compliant tenancy listing in 60 seconds. Free
              to try.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="group w-full sm:w-auto">
                <Link href="/generator">
                  Try it free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
              >
                <Link href="/pricing">See all plans</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
