import Link from "next/link"

export const metadata = {
  title: "Terms of Service · ListingAI",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: 21 May 2026</p>

        <p className="mt-6 text-foreground">
          These Terms of Service (&quot;Terms&quot;) govern your use of ListingAI. By creating an account or using the service, you agree to these Terms.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">1. The service</h2>
        <p className="text-foreground">
          ListingAI is an AI-powered tool for UK estate agents to generate, store, and audit property listing descriptions. The service is provided as-is and we may add, change, or remove features over time.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">2. Accounts</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>You must be 18 or over to use ListingAI.</li>
          <li>You are responsible for keeping your login details secure.</li>
          <li>You must provide accurate information when signing up.</li>
          <li>One account per person. Sharing accounts is not permitted.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">3. Subscriptions and billing</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Paid plans (Pro, Lister, Team) are billed monthly in GBP via Stripe.</li>
          <li>Subscriptions auto-renew until cancelled.</li>
          <li>You can cancel anytime from your Account page. Cancellation takes effect at the end of your current billing period.</li>
          <li>We do not provide refunds for partial months, but you keep access until the period ends.</li>
          <li>Prices may change with at least 30 days&apos; notice.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">4. Acceptable use</h2>
        <p className="text-foreground">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Use ListingAI to generate fraudulent, misleading, or unlawful property listings.</li>
          <li>Use the service to violate UK Fair Housing law (Equality Act 2010), advertising standards, or any other applicable law.</li>
          <li>Attempt to reverse-engineer, scrape, or abuse the service.</li>
          <li>Resell or redistribute access to your account.</li>
          <li>Use the service to harm, harass, or discriminate against any individual or group.</li>
        </ul>
        <p className="text-foreground">
          We may suspend or terminate accounts that violate these rules.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">5. AI-generated content</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>You own the listings you generate using ListingAI.</li>
          <li>AI output may occasionally be inaccurate, generic, or contain errors. You are responsible for reviewing and editing every listing before publishing.</li>
          <li>The Compliance Checker is an automated tool and not a substitute for legal advice. Always consult a qualified solicitor for genuinely sensitive listings.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">6. Intellectual property</h2>
        <p className="text-foreground">
          The ListingAI name, branding, code, and design are owned by us. The listings and content you create remain yours.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">7. Service availability</h2>
        <p className="text-foreground">
          We aim for high availability but do not guarantee uninterrupted service. Planned maintenance, third-party outages (Stripe, Supabase, Anthropic, Vercel), or technical issues may occasionally cause downtime.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">8. Limitation of liability</h2>
        <p className="text-foreground">
          To the fullest extent permitted by law, ListingAI is not liable for indirect, incidental, or consequential damages arising from your use of the service. Our total liability in any 12-month period is limited to the amount you paid us during that period.
        </p>
        <p className="text-foreground">
          Nothing in these Terms limits liability for death, personal injury caused by negligence, fraud, or any liability that cannot be limited under English law.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">9. Termination</h2>
        <p className="text-foreground">
          You can close your account anytime. We can suspend or terminate accounts that violate these Terms or for prolonged inactivity. On closure, your data is retained for 30 days then permanently deleted.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">10. Changes to these Terms</h2>
        <p className="text-foreground">
          We may update these Terms occasionally. Material changes will be communicated to active users by email at least 14 days before they take effect.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">11. Governing law</h2>
        <p className="text-foreground">
          These Terms are governed by the laws of England and Wales. Disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">12. Contact</h2>
        <p className="text-foreground">
          Questions? Email <a href="mailto:vr047836@gmail.com" className="text-primary underline">vr047836@gmail.com</a>.
        </p>

        <div className="mt-12 pt-6 border-t border-border">
          <Link href="/" className="text-sm text-primary underline">← Back to ListingAI</Link>
        </div>
      </div>
    </div>
  )
}
