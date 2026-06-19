import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Bad Decision',
  description:
    'The Terms of Service that govern your use of the Bad Decision B2B lead intelligence platform, including account registration, credits, payments, and acceptable use.',
}

const LAST_UPDATED = 'June 17, 2026'

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-14 sm:pt-20 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-xs text-primary font-semibold uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
            Bad Decision platform, website, and services. By creating an account or using the
            Service, you agree to be bound by these Terms.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* 1. Acceptance of Terms */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                These Terms constitute a legally binding agreement between you (&ldquo;User&rdquo;,
                &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and Bad Decision
                (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;)
                governing your access to and use of the Bad Decision web application, website located
                at https://bad-decision-front-end.vercel.app (the &ldquo;Site&rdquo;), and the B2B
                lead intelligence services provided through it (collectively, the
                &ldquo;Service&rdquo;).
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                By creating an account, accessing the Service, or clicking to accept these Terms,
                you confirm that you have read, understood, and agree to be bound by these Terms,
                our Privacy Policy, and our Refund Policy, each of which is incorporated by
                reference. If you do not agree with any part of these Terms, you must not access
                or use the Service.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                You represent and warrant that you are at least eighteen (18) years of age, that
                you have the legal capacity to enter into a binding agreement, and, if you are
                using the Service on behalf of a company or other legal entity, that you have the
                authority to bind that entity to these Terms.
              </p>
            </div>

            {/* 2. Description of Service */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Bad Decision is a B2B lead intelligence platform that enables Users to discover,
                verify, and export contact information for businesses and decision-makers. The
                Service combines live web search, structured data sources, map data, and AI-driven
                validation to return verified contact records, including business names, websites,
                phone numbers, social profiles, and tested email addresses.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                The Service is provided on a credit-based model. Users receive a limited number of
                complimentary credits on signup and may purchase additional credits or subscribe to
                a recurring tier. Credits are deducted from the User&apos;s balance as searches are
                run and verified contact records are returned.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We may modify, suspend, or discontinue any aspect of the Service at any time,
                including the availability of any feature, database, data source, or content. We
                will not be liable to you or to any third party for any modification, suspension, or
                discontinuance of the Service.
              </p>
            </div>

            {/* 3. Account Registration and Responsibilities */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                3. Account Registration and Responsibilities
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                To access the Service, you must register an account. Account authentication is
                handled by Clerk, our third-party identity provider, which supports email and
                password authentication as well as Google OAuth. You agree to provide accurate,
                current, and complete information during the registration process and to update
                such information to keep it accurate, current, and complete.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                You are solely responsible for maintaining the confidentiality and security of your
                account credentials and for all activities that occur under your account. You agree
                to notify us immediately at support@baddecision.app of any unauthorized use of your
                account or any other security breach. We will not be liable for any loss or damage
                arising from your failure to comply with this obligation.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                One account is intended for one individual User. You may not share, transfer, sell,
                or sublicense your account credentials to any other person or entity. If you
                require multiple seats for a team, contact us at support@baddecision.app to
                discuss a team arrangement.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate any account that, in our sole
                discretion, violates these Terms, appears to be used in an unauthorized manner, or
                poses a security risk to the Service or to other Users.
              </p>
            </div>

            {/* 4. Credit System and Pricing */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">4. Credit System and Pricing</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                The Service operates on a credit-based model. A &ldquo;credit&rdquo; (also referred
                to as a &ldquo;credit&rdquo; in the user interface) is the unit of consumption used to
                run searches and to receive verified contact records. New Users receive fifty (50)
                complimentary credits on signup at no cost. Additional credits may be purchased
                individually or as part of a recurring subscription tier.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Current subscription tiers and their published prices are as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>Free tier &mdash; 50 complimentary credits on signup, no payment required.</li>
                <li>Starter tier &mdash; $15 USD per billing cycle.</li>
                <li>Growth tier &mdash; $25 USD per billing cycle.</li>
                <li>Pro tier &mdash; $35 USD per billing cycle.</li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Pricing, credit allotments, and tier features are subject to change. We will
                provide reasonable notice of any material pricing change to active subscribers.
                Any change in pricing will not affect credits you have already purchased or earned;
                purchased credits do not expire.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Credits have no cash value, are not currency, and are non-transferable. Credits may
                not be redeemed for cash, sold, or exchanged between Users. The number of credits
                required to run a given search or to receive a verified contact record may vary
                based on plan, query complexity, and data source.
              </p>
            </div>

            {/* 5. Acceptable Use Policy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">5. Acceptable Use Policy</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                You agree to use the Service only for lawful business purposes and in compliance
                with all applicable local, state, national, and international laws and regulations,
                including but not limited to data protection, anti-spam, and consumer protection
                laws. You may not use the Service in any manner that could damage, disable,
                overload, or impair the Service or interfere with any other party&apos;s use.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Without limiting the foregoing, you agree that you will not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  Use the Service to send unsolicited commercial email (spam) or to violate the
                  CAN-SPAM Act, the European GDPR, the Nigerian NDPR, or any other applicable
                  anti-spam or data protection law;
                </li>
                <li>
                  Resell, redistribute, license, sublicense, or commercially exploit contact
                  records obtained through the Service as a standalone data product, lead list, or
                  competing service;
                </li>
                <li>
                  Use automated scripts, bots, scrapers, or any similar tool to access the Service,
                  extract data from it, or place undue load on its infrastructure, except through
                  the interfaces and at the rates we expressly authorize;
                </li>
                <li>
                  Attempt to reverse engineer, decompile, disassemble, or otherwise derive the
                  source code, internal structure, or underlying algorithms of the Service;
                </li>
                <li>
                  Use the Service to stalk, harass, threaten, defame, or otherwise harm any
                  individual or business identified in the contact records;
                </li>
                <li>
                  Upload, transmit, or store any malware, virus, worm, Trojan, or other malicious
                  code through the Service;
                </li>
                <li>
                  Use the Service to gather contacts for purposes that are fraudulent, deceptive,
                  unlawful, or in violation of any third-party rights, including intellectual
                  property and privacy rights.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Violations of this Acceptable Use Policy may result in immediate suspension or
                termination of your account, forfeiture of unused credits, and where appropriate,
                referral to law enforcement. You are solely responsible for your use of the contact
                records you obtain through the Service and for ensuring that your outreach
                activities comply with all applicable laws.
              </p>
            </div>

            {/* 6. Intellectual Property */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">6. Intellectual Property</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                The Service, including its software, design, text, graphics, logos, trademarks,
                service marks, and all other content and materials made available through the
                Service, are the exclusive property of Bad Decision or its licensors and are
                protected by international copyright, trademark, and other intellectual property
                laws. Nothing in these Terms grants you any right, title, or interest in the
                Service other than the limited right to use it in accordance with these Terms.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Contact records returned by the Service are compiled from publicly available data
                sources and from third-party data providers. To the extent that any individual
                contact record is protected by a third party&apos;s intellectual property rights,
                those rights remain with the original rights holder. We grant you a limited,
                non-exclusive, non-transferable, revocable license to use the contact records you
                obtain through the Service for your own internal business purposes, subject to
                these Terms.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                You retain all rights, title, and interest in the search queries you submit and in
                any collections, lists, or exports you create using the Service. By submitting a
                search query, you grant us a non-exclusive, royalty-free, worldwide license to use,
                process, and store that query solely for the purpose of operating, securing, and
                improving the Service.
              </p>
            </div>

            {/* 7. User Data and Privacy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">7. User Data and Privacy</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We respect your privacy and are committed to protecting your personal data. Our
                collection, use, disclosure, and retention of personal data is described in detail
                in our Privacy Policy, available at{' '}
                <a
                  href="/privacy"
                  className="text-primary hover:underline"
                >
                  /privacy
                </a>
                . The Privacy Policy is incorporated into these Terms by reference.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                You are responsible for ensuring that your use of the contact records you obtain
                through the Service complies with applicable data protection laws, including
                providing any required notices or obtaining any required consents before sending
                marketing communications to the individuals identified in those records.
              </p>
            </div>

            {/* 8. Payment Terms */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">8. Payment Terms</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                All payments for credits and subscription tiers are processed by Paystack, our
                third-party payment processor. Paystack supports card payments in Nigerian Naira
                (NGN) and in United States Dollars (USD), as well as additional currencies and
                methods depending on your location. We do not store, process, or transmit your full
                card number, CVV, or other raw payment credentials. Payment authorization and
                settlement are handled entirely by Paystack.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                By purchasing credits or subscribing to a paid tier, you authorize Paystack to
                charge the designated payment method for the full amount of the purchase, plus any
                applicable taxes and fees. Subscription tiers are billed on a recurring basis
                until cancelled. You may cancel a subscription at any time from your account
                dashboard, and the cancellation will take effect at the end of the current billing
                cycle.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                All payments are processed using idempotent payment identifiers to prevent
                duplicate charges. If you believe you have been charged in error, please contact
                us at support@baddecision.app and review our Refund Policy at{' '}
                <a href="/refund" className="text-primary hover:underline">
                  /refund
                </a>
                .
              </p>
            </div>

            {/* 9. Refund Policy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">9. Refund Policy</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Because the Service provides digital, non-tangible credits that are consumed
                immediately upon use, credits that have been purchased or used are generally
                non-refundable. Our complete Refund Policy, including the circumstances under which
                we issue credit refunds (for example, when a search returns zero verified leads) and
                the procedure for requesting a refund, is available at{' '}
                <a href="/refund" className="text-primary hover:underline">
                  /refund
                </a>{' '}
                and is incorporated into these Terms by reference.
              </p>
            </div>

            {/* 10. Service Availability and Limitations */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                10. Service Availability and Limitations
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We strive to maintain high availability but do not guarantee that the Service will
                be uninterrupted, error-free, or available at all times. The Service may be
                unavailable due to scheduled maintenance, system upgrades, network failures, acts
                of God, or failures of third-party providers, including but not limited to Clerk,
                Paystack, Supabase, DeepSeek, Serper.dev, and OpenStreetMap.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Search results and contact records returned by the Service depend on the
                availability and accuracy of third-party data sources and may be incomplete,
                outdated, or inaccurate. We do not guarantee that any specific business, decision
                maker, or email address will be found or that any email address will continue to
                be valid after it has been verified. Verification reflects the state of the mailbox
                at the time of testing only.
              </p>
            </div>

            {/* 11. Disclaimers and Limitation of Liability */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                11. Disclaimers and Limitation of Liability
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
                BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY,
                INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
                SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR THAT ANY CONTACT RECORD
                RETURNED WILL BE ACCURATE, COMPLETE, OR CURRENT.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BAD DECISION,
                ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
                PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF, OR
                INABILITY TO USE, THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT
                (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WE
                HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                OUR TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE
                SERVICE, FROM ALL CAUSES OF ACTION AND UNDER ALL THEORIES OF LIABILITY, SHALL BE
                LIMITED TO THE GREATER OF (A) THE AMOUNTS YOU HAVE PAID TO US IN THE THIRTY (30)
                DAYS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR (B) FIFTY UNITED
                STATES DOLLARS (USD $50.00). SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR
                LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO
                YOU.
              </p>
            </div>

            {/* 12. Indemnification */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">12. Indemnification</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless Bad Decision, its affiliates,
                officers, directors, employees, agents, and licensors from and against any and all
                claims, damages, losses, liabilities, costs, and expenses (including reasonable
                attorneys&apos; fees) arising out of or in connection with: (a) your use of the
                Service; (b) your violation of these Terms or any applicable law or regulation;
                (c) your violation of any third-party right, including intellectual property and
                privacy rights; or (d) your use of the contact records returned by the Service,
                including any outreach or communications you send to the individuals identified in
                those records. We reserve the right, at our own expense, to assume the exclusive
                defense and control of any matter otherwise subject to indemnification by you, in
                which case you will cooperate with us in asserting any available defenses.
              </p>
            </div>

            {/* 13. Termination */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">13. Termination</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                You may cancel your account at any time by stopping use of the Service and
                cancelling any active subscription from your account dashboard. We may suspend or
                terminate your account and these Terms immediately, without notice, if we believe
                in good faith that you have violated these Terms, that your account poses a
                security risk to the Service, or as otherwise required by law.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Upon termination, your right to use the Service will immediately cease. Any credits
                remaining in your account at the time of termination may be forfeited, except
                where prohibited by law. Contact records and collections you have already exported
                prior to termination remain yours subject to these Terms. Sections of these Terms
                that by their nature should survive termination shall survive, including
                intellectual property, disclaimers, limitation of liability, indemnification, and
                governing law.
              </p>
            </div>

            {/* 14. Governing Law and Dispute Resolution */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                14. Governing Law and Dispute Resolution
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                These Terms and any dispute arising out of or in connection with them shall be
                governed by and construed in accordance with the laws of the Federal Republic of
                Nigeria, without regard to its conflict of law provisions. You and Bad Decision
                submit to the exclusive jurisdiction of the competent courts located in Lagos,
                Nigeria, for the resolution of any dispute that cannot be settled amicably.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                For Users located outside Nigeria, the foregoing choice of law and jurisdiction
                shall not deprive you of the protection afforded to you by the mandatory consumer
                protection laws of the country in which you reside. Before initiating litigation,
                you agree to first contact us at support@baddecision.app in good faith to attempt
                to resolve the dispute informally.
              </p>
            </div>

            {/* 15. Changes to These Terms */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                15. Changes to These Terms
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We may revise these Terms from time to time. The most current version will always
                be posted on this page with the &ldquo;Last updated&rdquo; date revised accordingly.
                If we make material changes that adversely affect your rights, we will provide
                notice through the Service or by email to the address associated with your account
                at least thirty (30) days before the changes take effect. Your continued use of the
                Service after the effective date of any change constitutes your acceptance of the
                revised Terms. If you do not agree to the revised Terms, you must stop using the
                Service and cancel any active subscription before the effective date.
              </p>
            </div>

            {/* 16. Contact Information */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">16. Contact Information</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                If you have any questions, comments, or concerns about these Terms or the Service,
                please contact us at:
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
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
