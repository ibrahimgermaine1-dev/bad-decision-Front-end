import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Bad Decision',
  description:
    'The Privacy Policy that explains what data Bad Decision collects, how we collect and use it, who we share it with, and the rights you have over your personal data.',
}

const LAST_UPDATED = 'June 17, 2026'

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-14 sm:pt-20 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-xs text-primary font-semibold uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            This Privacy Policy explains what information Bad Decision collects, how we use it, who
            we share it with, and the choices and rights you have over your data. We built this
            Service for business owners, and we treat your data the way we would want ours treated.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* 1. Introduction */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">1. Introduction</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Bad Decision (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                &ldquo;our&rdquo;) operates a B2B lead intelligence platform available at
                https://bad-decision-front-end.vercel.app (the &ldquo;Service&rdquo;). We are
                committed to protecting and respecting your privacy. This Privacy Policy describes
                how we collect, use, disclose, retain, and safeguard your personal data when you
                access the Service.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                This Policy applies to all Visitors, Users, and others who access the Service
                (&ldquo;Users&rdquo; or &ldquo;you&rdquo;). It does not apply to information about
                the businesses and decision-makers that appear in the contact records returned by
                the Service; that information is compiled from publicly available sources and is
                addressed in our Terms of Service. By using the Service, you consent to the
                practices described in this Policy.
              </p>
            </div>

            {/* 2. What Data We Collect */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">2. What Data We Collect</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We collect the following categories of personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">Account data:</span> Your email
                  address, full name (if you provide it), and any profile information you submit
                  during signup. If you sign up via Google OAuth, we receive the email address and
                  basic profile information that Google shares with us.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Authentication data:</span>
                  Login events, session tokens, and authentication metadata managed by Clerk, our
                  identity provider. We do not store your raw password; Clerk handles password
                  hashing and verification.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Payment data:</span> Transaction
                  identifiers, the last four digits of your card, card brand, expiry date, billing
                  country, and payment status returned by Paystack. We never receive or store your
                  full card number, CVV, or PIN.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Search and query data:</span>
                  The search terms you submit, the filters you apply (industry, location,
                  decision-maker role), and the collections and lists you create within the
                  Service.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Usage data:</span> Information
                  about how you interact with the Service, including device type, browser,
                  operating system, IP address, approximate location (derived from IP), referring
                  URL, pages viewed, time on page, and feature usage.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Communications data:</span> The
                  contents of any emails, support tickets, or feedback you send to us.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Technical data:</span> Cookies,
                  local storage entries, and similar technologies as described in the
                  &ldquo;Cookies and Tracking&rdquo; section below.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We do not collect or process special categories of personal data such as health
                information, religious beliefs, racial or ethnic origin, or biometric data, and you
                should not submit such data to us.
              </p>
            </div>

            {/* 3. How We Collect Data */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">3. How We Collect Data</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We collect personal data through the following methods:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">Directly from you:</span> When
                  you register an account, purchase credits, contact support, or otherwise
                  interact with us.
                </li>
                <li>
                  <span className="text-foreground font-semibold">From Clerk (authentication):</span>{' '}
                  When you sign up or log in using email and password or Google OAuth, Clerk
                  transmits identity and session information to us to authenticate your session.
                </li>
                <li>
                  <span className="text-foreground font-semibold">From Paystack (payments):</span>{' '}
                  When you make a purchase, Paystack transmits a transaction reference, payment
                  status, and limited card metadata to us so we can credit your account.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Automatically from your device:</span>{' '}
                  Through cookies, server logs, and similar technologies when you access the
                  Service.
                </li>
                <li>
                  <span className="text-foreground font-semibold">From our infrastructure
                  providers:</span> Hosting, database, and analytics providers may collect
                  technical and usage data on our behalf.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Where we rely on third-party providers to collect data on our behalf, those
                providers act as independent data controllers for their own purposes (such as fraud
                detection) and as data processors on our behalf for the limited purposes set out in
                this Policy.
              </p>
            </div>

            {/* 4. Why We Collect Data */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                4. Why We Collect and Use Data
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We process personal data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">To provide the Service:</span>{' '}
                  To create and manage your account, run your searches, store your credits, save
                  your collections, and deliver verified contact records.
                </li>
                <li>
                  <span className="text-foreground font-semibold">To process payments:</span> To
                  verify transactions, issue credits, manage subscriptions, and prevent duplicate
                  or fraudulent charges.
                </li>
                <li>
                  <span className="text-foreground font-semibold">To communicate with you:</span>{' '}
                  To send transactional messages (receipts, password resets, account notices),
                  respond to support requests, and deliver important Service announcements.
                </li>
                <li>
                  <span className="text-foreground font-semibold">To improve the Service:</span>{' '}
                  To analyze usage patterns, troubleshoot bugs, optimize performance, and develop
                  new features.
                </li>
                <li>
                  <span className="text-foreground font-semibold">To secure the Service:</span> To
                  detect, prevent, and respond to fraud, abuse, security incidents, and violations
                  of our Terms of Service.
                </li>
                <li>
                  <span className="text-foreground font-semibold">To comply with legal
                  obligations:</span> To meet recordkeeping, tax, anti-fraud, and other regulatory
                  requirements under Nigerian and applicable international law.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                The legal bases we rely on for processing include: performance of our contract with
                you; compliance with legal obligations; our legitimate interests in operating,
                securing, and improving the Service; and your consent where expressly requested.
                You may withdraw consent at any time without affecting the lawfulness of processing
                based on consent before its withdrawal.
              </p>
            </div>

            {/* 5. How We Process Data */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                5. How We Process Data (Sub-processors)
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                To deliver the Service, we share or transfer limited personal data to the
                following categories of third-party processors:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">Clerk</span> &mdash; Identity
                  and authentication provider. Stores your email, hashed password, OAuth tokens,
                  and session metadata. Clerk processes data in the United States.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Paystack</span> &mdash; Payment
                  processor. Receives your card and billing information directly in its
                  PCI-DSS-compliant environment. We receive only a payment reference and limited
                  metadata. Paystack processes data in Nigeria and other supported regions.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Supabase</span> &mdash;
                  Database and infrastructure provider hosting our PostgreSQL database. Stores
                  your account data, credits balance, search history, and collections. Supabase
                  processes data in the region we configure for our project.
                </li>
                <li>
                  <span className="text-foreground font-semibold">DeepSeek</span> &mdash;
                  AI provider used for email validation, lead enrichment, and decision-maker
                  identification. We transmit search-relevant data necessary to perform these
                  tasks; we do not transmit your full account data.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Serper.dev</span> &mdash;
                  Google search API provider used to discover business listings matching your
                  search queries. We transmit anonymized search terms and receive matching
                  results.
                </li>
                <li>
                  <span className="text-foreground font-semibold">OpenStreetMap</span> &mdash;
                  Open geospatial data source used to enrich location and map data for results.
                  We transmit only the geographic portions of your search query.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Infrastructure providers</span>{' '}
                  &mdash; Hosting, CDN, monitoring, and error-tracking providers used to operate
                  the Service. These providers receive limited technical data such as IP
                  addresses and request metadata.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Each processor is bound by written agreements that require them to protect personal
                data with appropriate technical and organizational measures and to process personal
                data only on our documented instructions. We do not sell your personal data to any
                third party.
              </p>
            </div>

            {/* 6. Data Sharing */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">6. Data Sharing and Disclosure</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We do not sell, rent, or trade your personal data. We share personal data only with
                the processors listed above, and in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  When required by law, court order, or valid government request, and only to the
                  extent necessary to comply.
                </li>
                <li>
                  To investigate, prevent, or respond to fraud, security incidents, or violations
                  of our Terms of Service.
                </li>
                <li>
                  To enforce or defend our rights, privacy, safety, or property, or those of our
                  Users or the public.
                </li>
                <li>
                  In connection with a merger, acquisition, reorganization, sale of assets, or
                  similar corporate transaction, subject to confidentiality protections equivalent
                  to this Policy.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Aggregated and de-identified data that can no longer reasonably be used to identify
                you may be used for analytics, product improvement, and public reporting without
                restriction.
              </p>
            </div>

            {/* 7. Data Retention */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">7. Data Retention</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We retain personal data only for as long as is necessary to fulfil the purposes for
                which it was collected, including for the purposes of satisfying any legal,
                accounting, or reporting requirements. Specific retention periods are:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  Account data is retained for the lifetime of your account and deleted or
                  anonymized within ninety (90) days of account closure, except where retention is
                  required by law.
                </li>
                <li>
                  Search and query data is retained for the lifetime of your account so you can
                  access your collections; it is deleted or anonymized within ninety (90) days of
                  account closure.
                </li>
                <li>
                  Payment and transaction records are retained for seven (7) years as required by
                  applicable tax and accounting laws, after which they are deleted or anonymized.
                </li>
                <li>
                  Server logs and technical usage data are retained for ninety (90) days, after
                  which they are deleted or aggregated.
                </li>
                <li>
                  Communications data (support tickets, emails) is retained for two (2) years for
                  quality and dispute resolution purposes.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                When you delete your account, we will remove or anonymize your personal data within
                a reasonable period, except where we are legally required to retain it.
              </p>
            </div>

            {/* 8. Data Security */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">8. Data Security</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your
                personal data against unauthorized access, alteration, disclosure, or destruction.
                These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  Row-level security (RLS) policies in Supabase that ensure every User can only
                  read and write their own data; service role keys are never exposed to the
                  browser.
                </li>
                <li>
                  Encryption of data in transit using TLS 1.2 or higher for all connections
                  between your browser, our servers, and our processors.
                </li>
                <li>
                  Encryption of sensitive data at rest where supported by our infrastructure
                  provider.
                </li>
                <li>
                  Strict access controls: production database and service-role credentials are
                  stored only as environment variables on our hosting platform and are accessible
                  only to a small number of authorized personnel.
                </li>
                <li>
                  Authentication delegated to Clerk, which enforces secure password hashing, MFA
                  options, and session management.
                </li>
                <li>
                  Payment data handled exclusively by Paystack in a PCI-DSS-compliant environment.
                </li>
                <li>
                  Regular security review of dependencies, infrastructure configuration, and
                  access logs.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                No method of transmission over the Internet or method of electronic storage is
                completely secure. While we strive to protect your personal data, we cannot
                guarantee absolute security. In the event of a personal data breach affecting your
                rights, we will notify you and the relevant supervisory authority as required by
                applicable law.
              </p>
            </div>

            {/* 9. Your Rights */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">9. Your Data Protection Rights</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights with respect to your
                personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">Access:</span> Request a copy of
                  the personal data we hold about you.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Rectification:</span> Request
                  correction of inaccurate or incomplete personal data.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Erasure:</span> Request deletion
                  of your personal data, subject to legal retention obligations.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Restriction:</span> Request that
                  we limit processing of your personal data in certain circumstances.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Portability:</span> Receive a
                  copy of your personal data in a structured, machine-readable format and transmit
                  it to another controller.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Objection:</span> Object to
                  processing based on legitimate interests or for direct marketing.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Withdrawal of consent:</span>{' '}
                  Withdraw consent at any time where processing relies on consent.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                To exercise any of these rights, contact us at support@baddecision.app. We will
                respond to your request within thirty (30) days. If you are not satisfied with our
                response, you have the right to lodge a complaint with your local data protection
                authority or with the Nigerian Data Protection Commission (NDPC).
              </p>
            </div>

            {/* 10. Cookies and Tracking */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                10. Cookies and Tracking Technologies
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies (local storage, session storage) to
                operate the Service, remember your preferences, and analyze usage. We use the
                following categories:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">Essential cookies:</span>{' '}
                  Required for authentication, session management, and basic functionality. The
                  Service cannot operate without these.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Preference cookies:</span>{' '}
                  Remember your settings such as theme, filters, and last-used locations.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Analytics cookies:</span> Help us
                  understand how the Service is used so we can improve it.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Your browser allows you to control or delete cookies. Disabling essential cookies
                will prevent you from logging in or using the Service. We do not use cookies for
                cross-site advertising or sell cookie-derived data to advertising networks.
              </p>
            </div>

            {/* 11. International Data Transfers */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Bad Decision operates from Nigeria and uses processors located in Nigeria, the
                United States, the European Economic Area, and other regions. When we transfer
                personal data to processors located outside your country of residence, we rely on
                appropriate safeguards such as standard contractual clauses, processor
                certifications, or other transfer mechanisms recognized under applicable data
                protection law.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                By using the Service, you acknowledge that your personal data may be processed in
                countries that may have data protection laws different from those of your country
                of residence. We take reasonable steps to ensure that your personal data receives
                a consistent level of protection regardless of where it is processed.
              </p>
            </div>

            {/* 12. Children's Privacy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">12. Children&apos;s Privacy</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                The Service is intended for business use and is not directed to individuals under
                the age of eighteen (18). We do not knowingly collect personal data from anyone
                under 18. If you believe we have collected personal data from a child, please
                contact us at support@baddecision.app and we will promptly delete it.
              </p>
            </div>

            {/* 13. Changes to This Policy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                13. Changes to This Privacy Policy
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. The most current version will
                be posted on this page with the &ldquo;Last updated&rdquo; date revised
                accordingly. If we make material changes that affect how we process your personal
                data, we will provide notice through the Service or by email to the address
                associated with your account at least thirty (30) days before the changes take
                effect. Your continued use of the Service after the effective date of any change
                constitutes your acceptance of the revised Policy.
              </p>
            </div>

            {/* 14. Contact Information */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">14. Contact Information</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                If you have any questions, requests, or concerns about this Privacy Policy or our
                handling of your personal data, please contact our Data Protection contact at:
              </p>
              <ul className="list-none pl-0 mt-4 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                <li>
                  <span className="text-foreground font-semibold">Email:</span>{' '}
                  <a
                    href="mailto:support@baddecision.app"
                    className="text-primary hover:underline"
                  >
                    support@baddecision.app
                  </a>
                </li>
                <li>
                  <span className="text-foreground font-semibold">Website:</span>{' '}
                  <a
                    href="https://bad-decision-front-end.vercel.app"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://bad-decision-front-end.vercel.app
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                For the avoidance of doubt, references to &ldquo;Bad Decision&rdquo; in this Policy
                refer to the operating entity of the Service. Communications regarding this Policy
                should be sent to the email address above; we will respond within thirty (30) days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
