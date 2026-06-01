import Link from "next/link"
import { Sparkles, FileCheck, Shield, Download, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
      "Live scan for Right to Rent, deposit, DSS-discrimination, and Equality Act language. Catches risks before they cost you a fine.",
  },
  {
    icon: Download,
    title: "Full tenancy pack PDF",
    description:
      "One-click export of the listing, the MI table, and a clean cover sheet. Send to landlords or attach to portals in seconds.",
  },
]

const stats = [
  { value: "Parts A·B·C", label: "Material Information covered" },
  { value: "60s", label: "From details to listing" },
  { value: "2024", label: "Mandatory MI rules — built in" },
  { value: "UK only", label: "Built for British lettings, not retrofitted" },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.15,transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Built for UK letting agents</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Material Information–ready listings,{" "}
              <span className="text-primary">in 60 seconds</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              Tenancy generates compliant property descriptions, Material Information tables,
              and tenancy packs for UK letting agents. Built for Rightmove, Zoopla, and OnTheMarket — out of the box.
            </p>
            <p className="text-sm text-muted-foreground">
  Updated for the Renters' Rights Act 2025 — covers the new tenancy model, rental bidding ban, rent in advance restrictions, and anti-discrimination protections.
</p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/generator">
                  Generate a listing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
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
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything UK letting agents actually need
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Material Information, tenancy packs, and lettings-specific compliance — all in one place.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border bg-card transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for British lettings — not retrofitted from a US sales tool
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              British English, GBP, UK property terms (flat, garden, leasehold), and the actual legal framework that applies here.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Stop dreading Material Information.
            </h2>
            <p className="mt-4 text-pretty text-lg text-primary-foreground/80">
              Generate your first compliant tenancy listing in 60 seconds. Free to try.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Link href="/generator">
                  Try it free
                  <ArrowRight className="ml-2 h-4 w-4" />
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
          </div>
        </div>
      </section>
    </div>
  )
}
