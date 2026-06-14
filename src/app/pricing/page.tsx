'use client'

/**
 * PRICING PAGE — Dedicated /pricing route
 * Geo-Routed, Paystack Only
 * Real Paystack integration via inline JS.
 * White background. 3-column grid. Growth card inverted (midnight bg).
 * No emojis. Direct-response copy. No tech jargon.
 * Imports TIERS and COIN_ADDONS from @/lib/pricing
 */
import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore, type UserTier } from '@/stores/app-store'
import { fetchCoinBalance, verifyPayment } from '@/lib/api'
import { TIERS, COIN_ADDONS, type TierId, getTierById, formatPrice, formatAddonPrice } from '@/lib/pricing'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Script from 'next/script'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const { userCountry, tier, setTier, setCoinBalance } = useAppStore()
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const router = useRouter()
  const isNigeria = userCountry === 'NG'

  const handlePurchase = (tierId: TierId) => {
    const selectedTier = getTierById(tierId)

    if (selectedTier.planType === 'free') {
      // Free tier — redirect to dashboard
      router.push('/')
      return
    }

    if (!isSignedIn) {
      router.push('/')
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Payment system is not configured. Please contact support.')
      return
    }

    setPaymentProcessing(true)
    setPaymentError('')

    try {
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          reference: crypto.randomUUID(),
          email: user?.primaryEmailAddress?.emailAddress || '',
          amount: selectedTier.priceKobo,
          publicKey,
          currency: 'NGN',
          metadata: {
            user_id: userId || '',
            plan: selectedTier.id,
            coins: selectedTier.coins,
            custom_fields: [
              { display_name: 'Plan', variable_name: 'plan', value: selectedTier.id },
              { display_name: 'Coins', variable_name: 'coins', value: selectedTier.coins.toString() },
            ],
          },
          callback: (response: any) => {
            const reference = response?.reference || ''
            if (reference) {
              verifyPayment(reference).then((result) => {
                if (result.verified && result.balance) {
                  setCoinBalance({
                    coins_balance: result.balance.coins_balance ?? 0,
                    coins_reserved: result.balance.coins_reserved ?? 0,
                    coins_lifetime: result.balance.coins_lifetime ?? 0,
                  })
                }
              }).catch(() => {
                // Verification failed — webhook may still process it
                setTimeout(async () => {
                  try {
                    const balance = await fetchCoinBalance()
                    setCoinBalance({
                      coins_balance: balance.coins_balance ?? 0,
                      coins_reserved: balance.coins_reserved ?? 0,
                      coins_lifetime: balance.coins_lifetime ?? 0,
                    })
                  } catch {}
                }, 3000)
              })
            } else {
              setTimeout(async () => {
                try {
                  const balance = await fetchCoinBalance()
                  setCoinBalance({
                    coins_balance: balance.coins_balance ?? 0,
                    coins_reserved: balance.coins_reserved ?? 0,
                    coins_lifetime: balance.coins_lifetime ?? 0,
                  })
                } catch {}
              }, 3000)
            }
            setTier(tierId)
            setPaymentProcessing(false)
            router.push('/')
          },
          onClose: () => {
            setPaymentProcessing(false)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Payment system is loading. Please try again in a moment.')
        setPaymentProcessing(false)
      }
    } catch (err) {
      console.error('[Pricing] Paystack error:', err)
      setPaymentError('Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const handleBuyCoins = (addon: typeof COIN_ADDONS[0]) => {
    if (!isSignedIn) {
      router.push('/')
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Payment system is not configured. Please contact support.')
      return
    }

    setPaymentProcessing(true)
    setPaymentError('')

    try {
      if (typeof window !== 'undefined' && (window as any).PaystackPop) {
        const handler = (window as any).PaystackPop.setup({
          reference: crypto.randomUUID(),
          email: user?.primaryEmailAddress?.emailAddress || '',
          amount: addon.priceKobo,
          publicKey,
          currency: 'NGN',
          metadata: {
            user_id: userId || '',
            coins: addon.coins,
            type: 'coin_addon',
            custom_fields: [
              { display_name: 'Coins', variable_name: 'coins', value: addon.coins.toString() },
            ],
          },
          callback: (response: any) => {
            const reference = response?.reference || ''
            if (reference) {
              verifyPayment(reference).then((result) => {
                if (result.verified && result.balance) {
                  setCoinBalance({
                    coins_balance: result.balance.coins_balance ?? 0,
                    coins_reserved: result.balance.coins_reserved ?? 0,
                    coins_lifetime: result.balance.coins_lifetime ?? 0,
                  })
                }
                setPaymentProcessing(false)
              }).catch(() => {
                setTimeout(async () => {
                  try {
                    const balance = await fetchCoinBalance()
                    setCoinBalance({
                      coins_balance: balance.coins_balance ?? 0,
                      coins_reserved: balance.coins_reserved ?? 0,
                      coins_lifetime: balance.coins_lifetime ?? 0,
                    })
                  } catch {}
                }, 3000)
                setPaymentProcessing(false)
              })
            } else {
              setTimeout(async () => {
                try {
                  const balance = await fetchCoinBalance()
                  setCoinBalance({
                    coins_balance: balance.coins_balance ?? 0,
                    coins_reserved: balance.coins_reserved ?? 0,
                    coins_lifetime: balance.coins_lifetime ?? 0,
                  })
                } catch {}
              }, 3000)
              setPaymentProcessing(false)
            }
          },
          onClose: () => {
            setPaymentProcessing(false)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Payment system is loading. Please try again in a moment.')
        setPaymentProcessing(false)
      }
    } catch (err) {
      console.error('[Pricing] Paystack error:', err)
      setPaymentError('Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const paidTiers = TIERS.filter(t => t.planType === 'paid')
  const freeTier = TIERS.find(t => t.planType === 'free')!

  return (
    <div className="min-h-screen bg-white">
      {/* Paystack Inline Script */}
      <Script src="https://js.paystack.co/v2/inline.js" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="font-semibold text-[#0F172A]">Bad Decision AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/faq" className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors">FAQ</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
            Pricing That Scales.
          </h1>
          <p className="mt-4 text-lg text-[#64748B]">Stop paying thousands for stale databases. Pay only for verified contacts.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 text-sm">
            <span className="text-[#64748B]">Currency:</span>
            <span className="font-semibold text-[#0F172A]">{isNigeria ? 'Nigerian Naira (NGN)' : 'US Dollar (USD)'}</span>
          </div>
        </div>
      </section>

      {/* Payment Error Banner */}
      {paymentError && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
          <div className="rounded-lg bg-[#FEE2E2] border border-[#DC2626]/20 p-3">
            <p className="text-sm text-[#DC2626]">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Pricing Grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paidTiers.map((plan) => {
              const isInverted = plan.popular

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-6 sm:p-8 relative ${
                    isInverted
                      ? 'bg-[#0B1120] border-[#2563EB] text-white'
                      : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[#2563EB] px-4 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className={`text-lg font-semibold ${isInverted ? 'text-white' : 'text-[#0F172A]'}`}>{plan.name}</h3>
                  <div className="mt-4">
                    <span className={`text-4xl sm:text-5xl font-bold tracking-tight ${isInverted ? 'text-white' : 'text-[#0F172A]'}`}>
                      {isNigeria ? `₦${plan.priceNGN.toLocaleString()}` : `$${plan.priceUSD}`}
                    </span>
                    <span className={`text-sm ${isInverted ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>/month</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-sm font-medium text-[#2563EB]">
                      {plan.coins.toLocaleString()} coins
                    </span>
                  </div>

                  <Separator className={`my-6 ${isInverted ? 'bg-[#1E293B]' : 'bg-[#E2E8F0]'}`} />

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm ${isInverted ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full mt-8 py-5 font-semibold ${
                      isInverted
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                        : plan.id === tier
                        ? 'bg-[#F8FAFC] text-[#64748B] cursor-default'
                        : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB]'
                    }`}
                    variant={isInverted ? 'default' : 'outline'}
                    disabled={plan.id === tier && isSignedIn || paymentProcessing}
                    onClick={() => handlePurchase(plan.id)}
                  >
                    {plan.id === tier && isSignedIn ? 'Current Plan' : paymentProcessing ? 'Processing...' : `Get ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Free tier note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#64748B]">
              Every new account gets <span className="font-semibold text-[#0F172A]">50 free coins</span>. No credit card needed. Try it first.
            </p>
          </div>
        </div>
      </section>

      {/* Coin Addons */}
      <section className="pb-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Need More Coins?</h2>
            <p className="mt-3 text-[#64748B]">Top up your coin balance anytime.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {COIN_ADDONS.map((addon) => (
              <div key={addon.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center">
                <p className="text-3xl font-bold text-[#0F172A]">{addon.coins.toLocaleString()}</p>
                <p className="text-sm text-[#64748B] mt-1">coins</p>
                <p className="text-xl font-semibold text-[#0F172A] mt-3">
                  {formatAddonPrice(addon, userCountry)}
                </p>
                <Button
                  onClick={() => handleBuyCoins(addon)}
                  className="mt-4 w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
