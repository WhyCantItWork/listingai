import Link from "next/link"

export const metadata = {
  title: "Terms of Service · Tenancy",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: 23 May 2026</p>

        <p className="mt-6 text-foreground">
          These Terms of Service (&quot;Terms&quot;) govern your use of Tenancy. By creating an account or using the service, you agree to these Terms.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">1. The service</h2>
        <p className="text-foreground">
          Tenancy is an AI-powered tool for UK letting agents to generate, store, audit, and export property listing descriptions. Features include the Listing Generator, Vault storage, Compliance Checker, A/B testing, and PDF export. The service is provided as-is and we may add, change, or remove features over time.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">2. Accounts</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>You must be 18 or over to use Tenancy.</li>
          <li>You are responsible for keeping your login details secure.</li>
          <li>You must provide accurate information when signing up.</li>
          <li>One account per person. Sharing accounts is not permitted.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">3. Subscriptions and billing</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Paid plans (Pro, Lister, Team) are billed in GBP via Stripe, either monthly or yearly. Yearly plans receive a 17% discount equivalent to two months free.</li>
          <li>Subscriptions auto-renew until cancelled.</li>
          <li>You can cancel anytime from your Account page. Cancellation takes effect at the end of your current billing period.</li>
          <li>We do not provide refunds for partial periods, but you keep access until the period ends.</li>
          <li>Prices may change with at least 30 days&apos; notice. Existing subscribers will be notified by email before any change takes effect.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">4. Top-ups</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Top-ups are one-off payments that add extra listings or vault storage to your monthly allowance.</li>
          <li>Top-ups are valid for 30 days from the date of purchase, regardless of your subscription billing cycle.</li>
          <li>Buying additional top-ups before an existing one expires stacks the allowances and resets the 30-day window from the most recent purchase.</li>
          <li>Top-ups are non-refundable once purchased.</li>
          <li>Top-ups are only available on Pro plans. Lister and Team plans already include unlimited usage.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">5. Acceptable use</h2>
        <p className="text-foreground">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Use Tenancy to generate fraudulent, misleading, or unlawful property listings.</li>
          <li>Use the service to violate UK lettings law, including the Equality Act 2010, the Tenant Fees Act 2019, the Housing Act 1988, the Material Information requirements introduced in 2024, or Right to Rent obligations under the Immigration Act 2014.</li>
          <li>Publish listings containing language that discriminates against individuals based on protected characteristics, including DSS/benefits discrimination (illegal since 2020).</li>
          <li>Attempt to reverse-engineer, scrape, or abuse the service.</li>
          <li>Resell or redistribute access to your account.</li>
          <li>Use the service to harm, harass, or discriminate against any individual or group.</li>
        </ul>
        <p className="text-foreground">
          We may suspend or terminate accounts that violate these rules.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">6. AI-generated content</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>You own the listings you generate using Tenancy.</li>
          <li>AI output may occasionally be inaccurate, generic, or contain errors. You are responsible for reviewing and editing every listing before publishing.</li>
          <li>The Compliance Checker, A/B Test, and any other AI-driven tool is provided as guidance only. It is an automated tool and not a substitute for legal advice. Always consult a qualified solicitor or property law specialist for genuinely sensitive listings.</li>
          <li>You are solely responsible for the legality and accuracy of any listing you publish to a property portal.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">7. Intellectual property</h2>
        <p className="text-foreground">
          The Tenancy name, branding, code, and design are owned by us. The listings and content you create remain yours.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">8. Service availability</h2>
        <p className="text-foreground">
          We aim for high availability but do not guarantee uninterrupted service. Planned maintenance, third-party outages (Stripe, Supabase, Anthropic, Vercel), or technical issues may occasionally cause downtime. We do not offer service-level credits for downtime.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">9. Limitation of liability</h2>
        <p className="text-foreground">
          To the fullest extent permitted by law, Tenancy is not liable for indirect, incidental, or consequential damages arising from your use of the service, including but not limited to losses arising from non-compliant listings, missed lettings, or fines from regulatory authorities. Our total liability in any 12-month period is limited to the amount you paid us during that period.
        </p>
        <p className="text-foreground">
          Nothing in these Terms limits liability for death, personal injury caused by negligence, fraud, or any liability that cannot be limited under English law.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">10. Termination</h2>
        <p className="text-foreground">
          You can close your account anytime by contacting <a href="mailto:vr047836@gmail.com" className="text-primary underline">vr047836@gmail.com</a>. We can suspend or terminate accounts that violate these Terms or for prolonged inactivity. On closure, your data is retained for 30 days then permanently deleted. Vault listings are deleted permanently on account closure.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">11. Changes to these Terms</h2>
        <p className="text-foreground">
          We may update these Terms occasionally. Material changes will be communicated to active users by email at least 14 days before they take effect.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">12. Governing law</h2>
        <p className="text-foreground">
          These Terms are governed by the laws of England and Wales. Disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">13. Contact</h2>
        <p className="text-foreground">
          Questions? Email <a href="mailto:vr047836@gmail.com" className="text-primary underline">vr047836@gmail.com</a>.
        </p>

        <div className="mt-12 pt-6 border-t border-border">
          <Link href="/" className="text-sm text-primary underline">← Back to Tenancy</Link>
        </div>
      </div>
    </div>
  )
}
