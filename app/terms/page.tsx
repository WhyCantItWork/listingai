import Link from "next/link"

export const metadata = {
  title: "Terms of Service · Tenancy",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: 3 June 2026</p>

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
          <li>You are responsible for keeping your email account secure, as Tenancy uses magic-link authentication for sign-in.</li>
          <li>You must provide accurate information when signing up.</li>
          <li>One account per person. Sharing accounts is not permitted.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">3. Subscriptions and billing</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Paid plans (Pro and Lister) are billed in GBP via Stripe, either monthly or yearly. Yearly plans receive a discount equivalent to roughly two months free.</li>
          <li>Subscriptions auto-renew until cancelled.</li>
          <li>You can cancel anytime from your Account page. Cancellation takes effect at the end of your current billing period.</li>
          <li>We do not provide refunds for partial periods, but you keep access until the period ends.</li>
          <li>Prices may change with at least 30 days&apos; notice. Existing subscribers will be notified by email before any change takes effect.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">4. Acceptable use</h2>
        <p className="text-foreground">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Use Tenancy to generate fraudulent, misleading, or unlawful property listings.</li>
          <li>Use the service to violate UK lettings law, including the Equality Act 2010, the Tenant Fees Act 2019 (as amended), the Housing Act 1988 (as amended), the Renters&apos; Rights Act 2025, the Material Information requirements published by National Trading Standards, or Right to Rent obligations under the Immigration Act 2014.</li>
          <li>Publish listings containing language that discriminates against individuals based on protected characteristics, including discrimination against tenants with children or those in receipt of benefits.</li>
          <li>Attempt to reverse-engineer, scrape, or abuse the service.</li>
          <li>Resell or redistribute access to your account.</li>
          <li>Use the service to harm, harass, or discriminate against any individual or group.</li>
        </ul>
        <p className="text-foreground">
          We may suspend or terminate accounts that violate these rules.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">5. AI-generated content</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>You own the listings you generate using Tenancy.</li>
          <li>AI output may occasionally be inaccurate, generic, or contain errors. You are responsible for reviewing and editing every listing before publishing.</li>
          <li>The Compliance Checker, A/B Test, and any other AI-driven tool is provided as guidance only. It is an automated drafting and research aid and not a substitute for legal advice. Always consult a qualified solicitor or property law specialist for genuinely sensitive listings.</li>
          <li>You are solely responsible for the legality and accuracy of any listing you publish to a property portal.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">6. Intellectual property</h2>
        <p className="text-foreground">
          The Tenancy name, branding, code, and design are owned by us. The listings and content you create remain yours.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">7. Service availability</h2>
        <p className="text-foreground">
          We aim for high availability but do not guarantee uninterrupted service. Planned maintenance, third-party outages (Stripe, Supabase, Anthropic, Vercel), or technical issues may occasionally cause downtime. We do not offer service-level credits for downtime.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">8. Limitation of liability</h2>
        <p className="text-foreground">
          To the fullest extent permitted by law, Tenancy is not liable for indirect, incidental, or consequential damages arising from your use of the service, including but not limited to losses arising from non-compliant listings, missed lettings, or fines from regulatory authorities. Our total liability in any 12-month period is limited to the amount you paid us during that period.
        </p>
        <p className="text-foreground">
          Nothing in these Terms limits liability for death, personal injury caused by negligence, fraud, or any liability that cannot be limited under English law.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">9. Termination</h2>
        <p className="text-foreground">
          You can close your account anytime from the Account page (the &quot;Delete account&quot; section). Account deletion is immediate and permanent: your profile, vault listings, and any active subscription are removed and cannot be recovered. We can also suspend or terminate accounts that violate these Terms or for prolonged inactivity.
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

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">13. Not a substitute for professional advice</h2>
        <p className="text-foreground">
          Tenancy provides automation and productivity tools. Our Compliance Checker is an AI-assisted research and drafting aid only. It is not legal advice and does not create a solicitor-client relationship between Tenancy and any user.
        </p>
        <p className="text-foreground mt-3">
          Users remain solely responsible for ensuring that any listing or document they publish to a property portal complies with all applicable UK laws, including but not limited to:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>the Equality Act 2010</li>
          <li>the Tenant Fees Act 2019 (as amended by the Renters&apos; Rights Act 2025)</li>
          <li>the Housing Act 1988 (as amended)</li>
          <li>the Renters&apos; Rights Act 2025</li>
          <li>the Material Information requirements published by National Trading Standards</li>
          <li>Right to Rent obligations under the Immigration Act 2014</li>
          <li>the Data Protection Act 2018 and UK GDPR</li>
        </ul>
        <p className="text-foreground mt-3">
          Some further provisions of the Renters&apos; Rights Act 2025 — including the Private Rented Sector Database, the PRS Landlord Ombudsman, the Decent Homes Standard for the PRS, and the extension of Awaab&apos;s Law to the PRS — will be commenced through secondary legislation at later dates. Users are responsible for keeping up to date with these changes via gov.uk, the NRLA, or qualified legal advice.
        </p>
        <p className="text-foreground mt-3">
          Nothing in Tenancy should be relied upon as a replacement for independent legal advice from a qualified solicitor or property law specialist. Users are strongly advised to have any listing or document reviewed by a professional before publication.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">14. Limitation on liability for user-generated content</h2>
        <p className="text-foreground">
          Tenancy is a platform through which users generate or store their own listings and documents. Users own all content they create, and Tenancy excludes liability for:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>any legal fines, penalties, damages or costs arising from a user&apos;s published material</li>
          <li>any claim that a listing breached the Equality Act 2010, Tenant Fees Act, Renters&apos; Rights Act 2025, or any other law</li>
          <li>any loss caused by a user disclosing incorrect Material Information or failing to disclose mandatory information</li>
        </ul>
        <p className="text-foreground mt-3">
          To the fullest extent permitted by law, Tenancy&apos;s total liability in connection with any claim shall not exceed the total amount actually paid by the user to Tenancy in the twelve months preceding the claim.
        </p>

        <div className="mt-12 pt-6 border-t border-border">
          <Link href="/" className="text-sm text-primary underline">← Back to Tenancy</Link>
        </div>
      </div>
    </div>
  )
}
