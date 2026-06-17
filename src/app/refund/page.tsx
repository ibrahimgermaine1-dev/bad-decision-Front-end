import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy — Bad Decision',
  description:
    'The Refund Policy for Bad Decision, including how credit purchases, failed searches, tier upgrades, duplicate charges, and chargebacks are handled.',
}

const LAST_UPDATED = 'June 17, 2026'

export default function RefundPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-14 sm:pt-20 sm:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-xs text-primary font-semibold uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Refund Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Bad Decision provides digital credits that are consumed in real time as searches run.
            Because of how the Service works, our refund rules are different from those of a
            physical-goods store. Please read this Policy carefully before purchasing.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* 1. Overview */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">1. Overview</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                This Refund Policy (&ldquo;Policy&rdquo;) forms part of, and is incorporated into,
                our Terms of Service. Capitalized terms used but not defined here have the meanings
                given to them in the Terms. By purchasing credits or subscribing to a paid tier,
                you acknowledge that you have read and agree to this Policy.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Our guiding principle is simple: you should only pay for what works. If a search
                returns zero verified leads, we refund the credits automatically. If an email we
                verified bounces within a reasonable window after you send to it, we refund the
                credits for that contact on request. Outside of those scenarios, credit purchases
                are final.
              </p>
            </div>

            {/* 2. Digital Goods Disclaimer */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                2. Digital Goods Disclaimer
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                The credits you purchase through the Service are digital, intangible goods. They
                are not physical products, they cannot be physically returned, and they are
                consumed immediately upon use. Under applicable consumer protection law, the right
                of withdrawal may not apply to digital content that has been delivered, accessed, or
                consumed with your consent and acknowledgment that you thereby lose the right of
                withdrawal.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                By purchasing credits, you expressly acknowledge that you are waiving any
                applicable right of withdrawal for those credits once they are added to your
                account, to the maximum extent permitted by the mandatory consumer protection laws
                of your country of residence.
              </p>
            </div>

            {/* 3. Credit Purchases Are Final */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                3. Credit Purchases Are Final
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Except as expressly provided in this Policy, all purchases of credits are final and
                non-refundable. Once credits have been added to your account, they are available
                for immediate use, and the digital goods they represent are considered delivered.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Unused credits do not expire. If you decide that the Service is no longer for you,
                you may stop using it at any time, and any unused credits will remain in your
                account indefinitely so you can return and use them whenever you wish. This is
                intended to give you the full value of every purchase, even if we are unable to
                offer a cash refund.
              </p>
            </div>

            {/* 4. Failed Search Refunds */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                4. Failed Searches &mdash; Automatic Credit Refunds
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                When you run a search and the Service returns zero (0) verified contact records,
                the credits that were reserved for that search are automatically returned to your
                account. You do not need to request this refund; it happens within minutes of the
                search completing.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                If the Service returns fewer verified contacts than the credits reserved, only the
                credits corresponding to the verified contacts actually returned are deducted from
                your account. The remaining reserved credits are returned automatically.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                A &ldquo;verified contact record&rdquo; is one in which the email address has
                passed our validation pipeline (DNS check, SMTP mailbox check, and where
                applicable, catch-all detection). Records that do not pass validation are not
                counted toward your credit consumption.
              </p>
            </div>

            {/* 5. Bounce Guarantee */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                5. Email Bounce Guarantee
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                If an email address that we verified and delivered to you bounces within fourteen
                (14) days of delivery when you send a legitimate, properly formatted message from
                a properly configured sender domain, contact us at support@baddecision.app with the
                bounce record (the bounce notification from your email provider). We will refund
                the credits corresponding to that contact to your account. There are no forms, no
                waiting periods, and no limits on the number of bounce refunds you can request.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                This bounce guarantee does not apply to bounces caused by your sender reputation,
                your message content, the recipient&apos;s inbox being full, the recipient marking
                your message as spam, or temporary delivery failures (4xx SMTP codes) that resolve
                on retry. It applies only to permanent delivery failures (5xx SMTP codes) on
                emails we previously verified as deliverable.
              </p>
            </div>

            {/* 6. Tier Upgrades and Downgrades */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                6. Tier Upgrades, Downgrades, and Cancellations
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Subscription tiers (Free, Starter at $15, Growth at $25, Pro at $35) are billed in
                advance on a recurring basis. The following rules apply to tier changes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">Upgrades:</span> When you upgrade
                  to a higher tier mid-cycle, you are charged the prorated difference for the
                  remaining days in the current cycle. The additional credits included in the
                  higher tier are added to your account immediately.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Downgrades:</span> When you
                  downgrade to a lower tier mid-cycle, the change takes effect at the end of the
                  current billing cycle. You retain access to the higher tier for the remainder of
                  the cycle you have already paid for. We do not issue prorated refunds for
                  downgrades.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Cancellations:</span> When you
                  cancel a subscription, the cancellation takes effect at the end of the current
                  billing cycle. You retain access to the paid features through the end of the
                  cycle you have already paid for. We do not issue refunds for the unused portion
                  of a cancelled billing cycle, but any credits you have purchased or earned remain
                  in your account and do not expire.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Tier credits vs purchased
                  credits:</span> Credits included as part of a subscription tier are forfeited
                  when the tier is cancelled or downgraded, unless they were purchased separately
                  with a one-time payment. Credits purchased separately remain in your account
                  regardless of tier changes.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We do not offer prorated refunds for partial billing cycles under any
                circumstance, except where required by mandatory consumer protection law.
              </p>
            </div>

            {/* 7. Double-Charge Protection */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                7. Double-Charge and Duplicate Payment Protection
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                All payment requests to Paystack include a unique idempotency key derived from your
                user ID and the purchase intent. This means that if a payment request is replayed
                (for example, because of a network retry or a double-click), Paystack recognizes it
                as a duplicate and does not charge you a second time. Your account is credited only
                once per purchase intent.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                If, despite this safeguard, you observe a duplicate charge on your payment method,
                contact us at support@baddecision.app with the transaction references from your
                bank or card statement. We will investigate within five (5) business days and, if a
                duplicate is confirmed, refund the duplicate amount in full to the original payment
                method.
              </p>
            </div>

            {/* 8. Chargeback Policy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">8. Chargeback Policy</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                We strongly encourage you to contact us at support@baddecision.app before
                initiating a chargeback with your bank or card issuer. Most disputes can be
                resolved faster and more amicably through direct communication, and we will make
                every reasonable effort to address your concern.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                If you do initiate a chargeback and we believe the charge is valid (for example,
                because credits were delivered and consumed in accordance with these Terms), we may
                contest the chargeback by submitting evidence to Paystack and your card issuer.
                Initiating a fraudulent or bad-faith chargeback may result in immediate suspension
                of your account, forfeiture of remaining credits, and where appropriate, referral
                to law enforcement.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Accounts that have a chargeback filed against them may be restricted from making
                further purchases until the dispute is resolved.
              </p>
            </div>

            {/* 9. Exceptions */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                9. Exceptions &mdash; When We Will Refund
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Notwithstanding the general rule that credit purchases are final, we will issue a
                full refund to your original payment method in the following situations:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>
                  <span className="text-foreground font-semibold">Fraud or unauthorized
                  use:</span> If your account or payment method was used without your authorization
                  and you report it to us within sixty (60) days of the unauthorized transaction.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Duplicate charges:</span> As
                  described in Section 7, where our idempotency safeguard fails and you are charged
                  twice for the same purchase intent.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Service failure:</span> If we
                  completely fail to deliver the Service for an extended period (more than seven
                  (7) consecutive days) due to a problem on our side, and you have an active
                  subscription, we will issue a prorated refund for the affected period on request.
                </li>
                <li>
                  <span className="text-foreground font-semibold">Legal requirement:</span> Where a
                  refund is required by the mandatory consumer protection laws of your country of
                  residence.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Refunds under this section will be issued to the original payment method within ten
                (10) business days of approval. The time for the refund to appear in your account
                depends on your bank or card issuer and may take up to thirty (30) days.
              </p>
            </div>

            {/* 10. How to Request a Refund */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                10. How to Request a Refund
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                To request a refund or a credit adjustment, please contact us at:
              </p>
              <ul className="list-none pl-0 mb-4 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                <li>
                  <span className="text-foreground font-semibold">Email:</span>{' '}
                  <a
                    href="mailto:support@baddecision.app"
                    className="text-primary hover:underline"
                  >
                    support@baddecision.app
                  </a>
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Please include the following information in your request so we can process it
                quickly:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                <li>Your account email address.</li>
                <li>The transaction reference or date of the charge in question.</li>
                <li>The amount of the charge.</li>
                <li>A brief description of the reason for your refund request.</li>
                <li>
                  For bounce refund requests, the email address that bounced and the bounce
                  notification from your email provider.
                </li>
              </ul>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We aim to respond to all refund requests within two (2) business days. Refund
                decisions are made on a case-by-case basis and at our sole discretion, except where
                a refund is required by applicable law or by the explicit terms of this Policy.
              </p>
            </div>

            {/* 11. Processing Time */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                11. Processing Time and Currency
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-4">
                Approved cash refunds are issued to the original payment method via Paystack within
                ten (10) business days of approval. Refunds are processed in the same currency as
                the original charge (NGN or USD). Exchange-rate gains or losses between the
                original charge date and the refund date are not reimbursed by Bad Decision.
              </p>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                Approved credit refunds (for failed searches, bounces, and similar situations) are
                applied to your Bad Decision account balance immediately upon approval, typically
                within minutes for automatic refunds and within two (2) business days for refunds
                requiring manual review.
              </p>
            </div>

            {/* 12. Changes to This Policy */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                12. Changes to This Refund Policy
              </h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                We may update this Refund Policy from time to time. The most current version will
                be posted on this page with the &ldquo;Last updated&rdquo; date revised
                accordingly. If we make material changes that reduce your refund rights, we will
                provide notice through the Service or by email to the address associated with your
                account at least thirty (30) days before the changes take effect. Changes to this
                Policy do not affect refund rights you accrued before the effective date of the
                change.
              </p>
            </div>

            {/* 13. Contact Information */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">13. Contact Information</h2>
              <p className="text-[15px] sm:text-base text-muted-foreground leading-relaxed">
                If you have any questions about this Refund Policy or about a specific transaction,
                please contact us:
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
