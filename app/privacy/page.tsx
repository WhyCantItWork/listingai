import Link from "next/link"

export const metadata = {
  title: "Privacy Policy · ListingAI",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: 21 May 2026</p>

        <p className="mt-6 text-foreground">
          ListingAI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains what personal data we collect, how we use it, and your rights under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">1. Who we are</h2>
        <p className="text-foreground">
          ListingAI is operated as a sole-trader service. The data controller for the purposes of UK GDPR is the operator of ListingAI, contactable at <a href="mailto:vr047836@gmail.com" className="text-primary underline">vr047836@gmail.com</a>.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">2. What we collect</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li><strong>Account data:</strong> email address and password (passwords are hashed and never visible to us).</li>
          <li><strong>Listing content:</strong> property details and generated descriptions you create using the service.</li>
          <li><strong>Payment data:</strong> processed by Stripe. We do not store card details on our servers.</li>
          <li><strong>Usage data:</strong> number of listings generated, tier, login timestamps.</li>
          <li><strong>Technical data:</strong> IP address, browser type, and device information collected automatically by our hosting provider.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">3. How we use your data</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>To provide the service (account access, listing generation, vault storage).</li>
          <li>To process your subscription payments via Stripe.</li>
          <li>To send essential account emails (verification, password reset, billing notifications).</li>
          <li>To improve the service and prevent abuse.</li>
        </ul>
        <p className="text-foreground">
          We do not sell your data, and we do not use your listings to train AI models.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">4. Third-party processors</h2>
        <p className="text-foreground">
          To run ListingAI we share necessary data with the following processors. Each is contractually required to handle your data securely.
        </p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li><strong>Supabase</strong> (database and authentication) — hosted in the EU.</li>
          <li><strong>Stripe</strong> (payment processing) — UK/EU and US.</li>
          <li><strong>Anthropic</strong> (AI generation via Claude API) — US-based.</li>
          <li><strong>Vercel</strong> (website hosting) — global edge network.</li>
        </ul>
        <p className="text-foreground">
          When data is transferred outside the UK/EU, we rely on appropriate safeguards including the UK International Data Transfer Addendum and Standard Contractual Clauses.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">5. How long we keep your data</h2>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Account data: while your account is active, plus 30 days after deletion.</li>
          <li>Listings: while your account is active. Deleted on request or account closure.</li>
          <li>Payment records: 7 years, in line with UK tax law.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">6. Your rights</h2>
        <p className="text-foreground">Under UK GDPR, you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1 text-foreground">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Request a portable copy of your data.</li>
          <li>Object to processing or withdraw consent.</li>
          <li>Lodge a complaint with the Information Commissioner&apos;s Office (ICO) at <a href="[ico.org.uk](https://ico.org.uk)" className="text-primary underline">ico.org.uk</a>.</li>
        </ul>
        <p className="text-foreground">
          To exercise any of these rights, email <a href="mailto:vr047836@gmail.com" className="text-primary underline">vr047836@gmail.com</a>.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">7. Cookies</h2>
        <p className="text-foreground">
          We use only essential cookies required for authentication and session management. We do not use advertising or tracking cookies.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">8. Security</h2>
        <p className="text-foreground">
          We use industry-standard security measures including HTTPS encryption, hashed passwords, and access controls. No system is 100% secure, but we work hard to protect your data.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">9. Changes to this policy</h2>
        <p className="text-foreground">
          We may update this policy from time to time. Significant changes will be communicated to active users by email.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">10. Contact</h2>
        <p className="text-foreground">
          Questions about this policy or your data? Email <a href="mailto:vr047836@gmail.com" className="text-primary underline">vr047836@gmail.com</a>.
        </p>

        <div className="mt-12 pt-6 border-t border-border">
          <Link href="/" className="text-sm text-primary underline">← Back to ListingAI</Link>
        </div>
      </div>
    </div>
  )
}
