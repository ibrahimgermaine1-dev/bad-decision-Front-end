'use client'

/**
 * PRICING PAGE — Recurring Subscriptions via Paystack Plans API
 * User clicks "Subscribe" → backend creates subscription → user is
 * redirected to Paystack to authorize recurring billing.
 */
import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { TIERS, type TierId, getTierById } from '@/lib/pricing'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Tier hierarchy: free < starter < growth < pro.
// Higher number = higher tier. Used to disable downgrade buttons.
const TIER_RANK: Record<TierId, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  pro: 3,
}

function tierRank(id: string | undefined | null): number {
  if (!id) return -1
  return id in TIER_RANK ? TIER_RANK[id as TierId] : -1
}

export default function PricingPage() {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { userCountry, tier, setTier, setCreditBalance } = useAppStore()
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const router = useRouter()
  const isNigeria = userCountry === 'NG'

  const handlePurchase = async (tierId: TierId) => {
    const selectedTier = getTierById(tierId)

    if (selectedTier.planType === 'free') {
      router.push('/dashboard')
      return
    }

    if (!isSignedIn) {
      // Redirect to sign-in, but come BACK to the pricing page after
      router.push('/sign-in?redirect_url=/pricing')
      return
    }

    setPaymentProcessing(true)
    setPaymentError('')

    try {
      // Call backend to initialize a Paystack subscription
      const res = await fetch('/api/backend/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setPaymentError(data.detail || data.error || 'Could not start subscription. Please try again.')
        setPaymentProcessing(false)
        return
      }

      // Redirect to Paystack authorization URL
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        setPaymentError('No authorization URL returned. Please try again.')
        setPaymentProcessing(false)
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const allTiers = TIERS

  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border mb-6">
            <span className="text-[12px] text-primary font-semibold uppercase tracking-wider">Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Start free. <br /><span className="text-gradient-violet">Pay only when it works.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            You get 50 free credits the moment you sign up. No credit card needed.
            When you want more, pick a plan that fits. You are never locked in.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-[13px]">
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-semibold text-card-foreground">{isNigeria ? 'Nigerian Naira' : 'US Dollar'}</span>
          </div>
        </div>
      </section>

      {/* Payment Error */}
      {paymentError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-[14px] text-destructive">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Pricing Grid */}
      <section id="pricing-table" className="pb-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {allTiers.map((plan) => {
              const isPopular = plan.popular
              const isCurrent = plan.id === tier && isSignedIn
              // Disable any tier at or below the user's current tier.
              // (You can't downgrade from the pricing page, and you can't
              // re-buy the plan you already have.)
              const currentRank = isSignedIn ? tierRank(tier) : -1
              const planRank = tierRank(plan.id)
              const isAtOrBelow = isSignedIn && planRank <= currentRank
              const isDisabled = isCurrent || isAtOrBelow
              const isUpgrade = isSignedIn && planRank > currentRank

              // Button label logic:
              // - Current plan: "Current Plan" (disabled, greyed)
              // - Lower or equal tier that's not the current plan: "Included" (disabled)
              // - Higher tier: "Upgrade to <Name>" (clickable)
              // - Not signed in: original labels ("Start Free" / "Get <Name>")
              let buttonLabel: string
              if (isCurrent) {
                buttonLabel = 'Current Plan'
              } else if (isAtOrBelow) {
                buttonLabel = 'Included'
              } else if (isUpgrade) {
                buttonLabel = `Upgrade to ${plan.name}`
              } else if (paymentProcessing) {
                buttonLabel = 'Please wait...'
              } else {
                buttonLabel = plan.priceUSD === 0 ? 'Start Free' : `Get ${plan.name}`
              }

              return (
                <div
                  key={plan.id}
                  className={`card-premium p-6 sm:p-7 relative flex flex-col ${
                    isPopular ? 'border-primary/40 glow-violet-sm' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>

                  <div className="mt-4">
                    {plan.priceUSD === 0 ? (
                      <span className="text-4xl font-bold text-foreground">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          {isNigeria ? `₦${plan.priceNGN.toLocaleString()}` : `$${plan.priceUSD}`}
                        </span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-muted text-[13px] font-semibold text-primary">
                    {plan.credits.toLocaleString()} credits
                  </div>

                  <div className="h-px bg-border my-5"></div>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[13px] text-muted-foreground leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full mt-6 py-3 rounded-lg font-semibold text-[14px] transition-all flex items-center justify-center gap-2 ${
                      isDisabled
                        ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                        : isPopular
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                        : 'bg-card hover:bg-card/80 text-card-foreground border border-border hover:border-primary/50'
                    } ${paymentProcessing && !isDisabled ? 'opacity-75 cursor-wait' : ''} active:scale-[0.98]`}
                    disabled={isDisabled || paymentProcessing}
                    onClick={() => handlePurchase(plan.id)}
                  >
                    {paymentProcessing && !isDisabled && (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    )}
                    {buttonLabel}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[14px] text-muted-foreground">
              Every new account gets <span className="font-semibold text-foreground">50 free credits</span>. No credit card needed.
            </p>
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-8 text-center">Why this is the best money you will spend.</h2>
          <div className="space-y-6">
            <div className="card-premium p-7">
              <h3 className="text-lg font-bold text-foreground mb-3">One closed deal pays for a year.</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                The Pro plan costs $35 a month. If you close one client from our leads, you have paid for the entire year.
                Everything after that is profit. Most of our users close their first deal in the first week.
                Do the math. This is the easiest yes you will ever say.
              </p>
            </div>
            <div className="card-premium p-7">
              <h3 className="text-lg font-bold text-foreground mb-3">You are not paying for dead emails.</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Every other lead vendor charges you for every contact on the list.
                The good ones and the dead ones. With us, you only pay for emails that work.
                The dead ones never reach you. That means every credit you spend goes toward a real lead.
                You get more value for less money. That is not a pitch. That is math.
              </p>
            </div>
            <div className="card-premium p-7">
              <h3 className="text-lg font-bold text-foreground mb-3">Cancel anytime. No contracts.</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                You are not locked in. Cancel your plan anytime. Keep your credits.
                Keep your leads. Keep your collections. If you want to come back later, your account will be waiting.
                We do not believe in trapping people. We believe in earning their stay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-4">
            If the email bounces, you do not pay.
          </h2>
          <p className="text-[15px] text-muted-foreground mb-8 max-w-xl mx-auto">
            That is our promise. Every email is tested before you spend a credit.
            If we are wrong, you get your credits back. No questions asked.
          </p>
          <Link
            href="/guarantee"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-base transition-colors"
          >
            Read our full guarantee
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
