import Link from "next/link"
import { ArrowRight, FileCheck, ScanLine, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: FileCheck,
    title: "Start with a listing draft",
    description: "Turn the property details you provide into a description you can edit. Verify every detail before publishing.",
  },
  {
    icon: ScanLine,
    title: "Review advert wording",
    description: "Use the free checker to flag wording for further review. Its suggestions are a starting point, not a legal verdict.",
  },
  {
    icon: Download,
    title: "Organise listing information",
    description: "Prepare Material Information tables and listing PDFs for review. These are not a tenancy agreement or a complete set of legal documents.",
  },
]

const steps = [
  { title: "Add your property details", description: "Start with facts you have verified. Do not include tenant personal information." },
  { title: "Review the draft", description: "Check the description, fill in missing information and make it sound like your agency." },
  { title: "Publish when you are ready", description: "Confirm the applicable requirements and portal fields, then use your usual publishing process." },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden">
      <section className="relative isolate bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />
              Built for UK letting agents
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Property details in.{" "}
              <span className="text-primary">A listing draft out.</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              Tenancy helps you write rental descriptions, organise Material Information
              and review advert wording. Start with a draft, not a blank page.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/free-check">
                  <ScanLine aria-hidden="true" className="mr-2 h-4 w-4" />
                  Check my advert free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/generator">
                  Draft a listing
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free advert check: no sign-up required. Listing generation uses an account.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <Link href="/pricing" className="font-medium underline underline-offset-4">Compare plans and limits</Link>
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-5xl rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-foreground">What a listing draft can look like</h2>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">Illustrative example, not a customer result</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-secondary/50 p-5">
                <h3 className="text-sm font-semibold text-foreground">Property notes</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  2-bed flat. Leeds. £1,100 pcm. Unfurnished. Separate kitchen.
                  Balcony. Available 1 November 2026.
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <h3 className="text-sm font-semibold text-foreground">Illustrative draft</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  An unfurnished two-bedroom flat in Leeds, available from 1 November 2026
                  at £1,100 per calendar month. The property includes a separate kitchen
                  and a balcony.
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Description only, not a complete advert. Confirm missing details and all
              required disclosures before publication. Actual output will vary.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">From property notes to your review</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">Writing assistance for your existing lettings workflow. You stay responsible for the final advert.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-border bg-card p-6">
                <feature.icon aria-hidden="true" className="mb-4 h-7 w-7 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{index + 1}</span>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
          <aside className="mt-10 rounded-xl border border-border bg-secondary/30 p-6">
            <h3 className="font-semibold text-foreground">AI assistance, not a compliance guarantee</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tenancy can make mistakes and miss information. It does not verify property
              facts, certify legal compliance or replace professional advice. Requirements
              differ across England, Wales, Scotland and Northern Ireland and can change.
              Check current official guidance and obtain qualified advice where needed.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-t border-border bg-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Try it on one advert.</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with the free wording check. Then tell us what was useful,
            what it missed, or what would make Tenancy fit your agency.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Use public advert text only. Remove personal or confidential information.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/free-check">Check my advert free<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <a href="mailto:vr047836@gmail.com?subject=Tenancy%20feedback">Send feedback</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
