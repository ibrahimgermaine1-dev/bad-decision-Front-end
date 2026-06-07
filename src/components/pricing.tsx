/**
 * BAD DECISION AI — Pricing Page
 * Shows tiers with Paystack payment integration.
 * Uses Paystack Inline JS (loaded from CDN: https://js.paystack.co/v2/inline.js)
 * No npm package needed — this works with any React version.
 */
'use client'

import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore, type TierName } from '@/stores/app-store'

// Coin packages for one-time purchases (Paystack checkout)
const COIN_PACKAGES = [
  { id: 'coins-500', coins: 500, priceNGN: 4000, priceUSD: 5, label: '500 Coins' },
  { id: 'coins-1500', coins: 1500, priceNGN: 12000, priceUSD: 15, label: '1,500 Coins' },
  { id: 'coins-3000', coins: 3000, priceNGN: 20000, priceUSD: 25, label: '3,000 Coins' },
  { id: 'coins-5000', coins: 5000, priceNGN: 28000, priceUSD: 35, label: '5,000 Coins' },
]

// Tier plans (Paystack one-time payment)
const TIER_PLANS: {
  tier: TierName
  name: string
  desc: string
  priceNGN: number
  priceUSD: number
  coins: number
  features: string[]
  gates: string
  coinCost: string
  popular?: boolean
}[] = [
  {
    tier: 'free',
    name: 'Free',
    desc: 'Try it out with 50 free coins',
    priceNGN: 0,
    priceUSD: 0,
    coins: 50,
    features: ['Gate 1: DNS Check only', '1 coin per verified lead', 'ads_intent engine', 'Basic lead data'],
    gates: 'Gate 1 only',
    coinCost: '1 coin/lead',
  },
  {
    tier: 'starter',
    name: 'Starter',
    desc: 'For freelancers getting started',
    priceNGN: 12000,
    priceUSD: 15,
    coins: 1500,
    features: ['Gate 1 + 2: DNS + Footprint', '2 coins per verified lead', 'All 4 search engines', 'Decision maker contact info', 'Email + phone validation'],
    gates: 'Gate 1 + 2',
    coinCost: '2 coins/lead',
    popular: true,
  },
  {
    tier: 'growth',
    name: 'Growth',
    desc: 'For growing agencies',
    priceNGN: 20000,
    priceUSD: 25,
    coins: 3000,
    features: ['Gate 1 + 2: DNS + Footprint', '2 coins per verified lead', 'All 4 search engines', 'Full contact enrichment', 'Priority processing'],
    gates: 'Gate 1 + 2',
    coinCost: '2 coins/lead',
  },
  {
    tier: 'pro',
    name: 'Pro',
    desc: 'For teams that need guaranteed results',
    priceNGN: 28000,
    priceUSD: 35,
    coins: 5000,
    features: ['Gate 1 + 2 + 3: Full SMTP', '3 coins per verified lead', 'All 4 search engines', 'Guaranteed deliverable emails', 'Catch-all detection', 'Priority support'],
    gates: 'Gate 1 + 2 + 3',
    coinCost: '3 coins/lead',
  },
]

/**
 * Load Paystack Inline JS from CDN if not already loaded.
 * Returns the PaystackPop global object.
 */
function getPaystackPop(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).PaystackPop) {
      resolve((window as any).PaystackPop)
      return
    }

    // Load the script
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v2/inline.js'
    script.async = true
    script.onload = () => {
      if ((window as any).PaystackPop) {
        resolve((window as any).PaystackPop)
      } else {
        reject(new Error('PaystackPop not found after script loaded'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load Paystack inline JS'))
    document.head.appendChild(script)
  })
}

export function PricingPage() {
  const setView = useAppStore((s) => s.setView)
  const userCountry = useAppStore((s) => s.userCountry)
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const [loading, setLoading] = useState<string | null>(null)

  const isNGN = userCountry === 'NG' || userCountry === 'GH'

  /**
   * Initialize Paystack checkout using the CDN-loaded inline JS.
   * No npm package needed — works with React 19.
   */
  async function handlePaystackCheckout(plan: typeof TIER_PLANS[number] | typeof COIN_PACKAGES[number]) {
    if (!isSignedIn || !userId) {
      setView('signin')
      return
    }

    const planId = 'id' in plan ? plan.id : plan.tier
    setLoading(planId)

    try {
      const PaystackPop = await getPaystackPop()

      const amount = isNGN ? ('priceNGN' in plan ? plan.priceNGN : 0) : ('priceUSD' in plan ? plan.priceUSD : 0)
      const coins = plan.coins
      const tier = 'tier' in plan ? plan.tier : null

      if (amount === 0) {
        setLoading(null)
        return
      }

      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        amount: amount * 100, // Paystack expects amount in kobo/cents
        currency: isNGN ? 'NGN' : 'USD',
        metadata: {
          coins,
          tier,
          user_id: userId,
        },
        onClose: () => {
          setLoading(null)
        },
        callback: (response: { reference: string }) => {
          console.log('[PAYSTACK] Payment successful:', response.reference)
          setLoading(null)
          setView('dashboard-coin-vault')
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error('[PAYSTACK] Checkout error:', error)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => setView('landing')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-royal flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-bold text-lg text-slate">Bad Decision AI</span>
          </button>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={() => setView('faq')} className="text-slate/60 hover:text-royal transition">FAQ</button>
            {isSignedIn ? (
              <button onClick={() => setView('dashboard-idle')} className="px-4 py-2 bg-royal text-white rounded-lg text-sm font-medium">Dashboard</button>
            ) : (
              <button onClick={() => setView('signin')} className="px-4 py-2 bg-royal text-white rounded-lg text-sm font-medium">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate mb-4">Simple, Transparent Pricing</h1>
          <p className="text-slate/60 max-w-2xl mx-auto">
            Pay only for verified leads with our coin system. Higher tiers unlock deeper email validation.
            All payments are processed securely via Paystack.
          </p>
        </div>

        {/* Tier Plans */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {TIER_PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`relative bg-white p-6 rounded-xl border transition-all ${
                plan.popular
                  ? 'border-royal shadow-lg shadow-royal/10 scale-[1.02]'
                  : 'border-border hover:border-royal/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-royal text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-slate mb-1">{plan.name}</h3>
              <p className="text-sm text-slate/50 mb-4">{plan.desc}</p>
              <div className="mb-4">
                {plan.priceUSD === 0 ? (
                  <span className="text-3xl font-bold text-slate">Free</span>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-slate">
                      {isNGN ? `₦${plan.priceNGN.toLocaleString()}` : `$${plan.priceUSD}`}
                    </span>
                    <span className="text-slate/40 text-sm ml-1">one-time</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-royal font-medium mb-4">{plan.coins.toLocaleString()} coins included</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate/70">
                    <span className="text-success mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePaystackCheckout(plan)}
                disabled={plan.priceUSD === 0 || loading === plan.tier}
                className={`w-full py-3 rounded-lg font-medium text-sm transition ${
                  plan.popular
                    ? 'bg-royal text-white hover:bg-royal-hover'
                    : plan.priceUSD === 0
                    ? 'bg-ghost text-slate/40 cursor-default'
                    : 'border border-royal text-royal hover:bg-royal-light'
                }`}
              >
                {loading === plan.tier ? 'Processing...' : plan.priceUSD === 0 ? 'Current Plan' : 'Buy with Paystack'}
              </button>
            </div>
          ))}
        </div>

        {/* Coin Top-Ups */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate mb-2">Need More Coins?</h2>
          <p className="text-slate/60">Top up your balance anytime with Paystack.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {COIN_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handlePaystackCheckout(pkg)}
              disabled={loading === pkg.id}
              className="bg-white p-4 rounded-xl border border-border hover:border-royal/30 hover:shadow-md transition text-left"
            >
              <div className="text-lg font-bold text-slate">{pkg.label}</div>
              <div className="text-sm text-royal font-medium">
                {isNGN ? `₦${pkg.priceNGN.toLocaleString()}` : `$${pkg.priceUSD}`}
              </div>
              {loading === pkg.id && (
                <div className="text-xs text-slate/40 mt-1">Processing...</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
