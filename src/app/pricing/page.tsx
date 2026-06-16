'use client'

/**
 * PRICING PAGE — Premium Dark Theme
 * Long-form, value-driven, Dan Kennedy copy.
 * Paystack payment integration preserved.
 */
import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useAppStore } from '@/stores/app-store'
import { fetchCoinBalance, verifyPayment } from '@/lib/api'
import { TIERS, COIN_ADDONS, type TierId, getTierById, formatAddonPrice } from '@/lib/pricing'
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
      router.push('/dashboard')
      return
    }

    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Payment is not ready yet. Please contact support.')
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
            }
            setTier(tierId)
            setPaymentProcessing(false)
            router.push('/dashboard')
          },
          onClose: () => {
            setPaymentProcessing(false)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Payment is still loading. Try again in a moment.')
        setPaymentProcessing(false)
      }
    } catch (err) {
      setPaymentError('Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const handleBuyCoins = (addon: typeof COIN_ADDONS[0]) => {
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setPaymentError('Payment is not ready yet. Please contact support.')
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
            }
          },
          onClose: () => {
            setPaymentProcessing(false)
          },
        })
        handler.openIframe()
      } else {
        setPaymentError('Payment is still loading. Try again in a moment.')
        setPaymentProcessing(false)
      }
    } catch (err) {
      setPaymentError('Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const allTiers = TIERS

  return (
    <div className="bg-[#08080C]">
      <Script src="https://js.paystack.co/v2/inline.js" />

      {/* Hero */}
      <section className="bg-radial-glow bg-grid pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-6">
            <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F5F7] mb-6 leading-tight">
            Start free. <br /><span className="text-gradient-violet">Pay only when it works.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A8A8B8] max-w-2xl mx-auto leading-relaxed mb-6">
            You get 50 free leads the moment you sign up. No credit card needed.
            When you want more, pick a plan that fits. Or buy coins one at a time.
            You are never locked in.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14141C] border border-[#25252F] text-[13px]">
            <span className="text-[#6B6B7B]">Currency:</span>
            <span className="font-semibold text-[#F5F5F7]">{isNigeria ? 'Nigerian Naira' : 'US Dollar'}</span>
          </div>
        </div>
      </section>

      {/* Payment Error */}
      {paymentError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="rounded-xl bg-[#2A1010] border border-[#F87171]/20 p-4">
            <p className="text-[14px] text-[#F87171]">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Pricing Grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {allTiers.map((plan) => {
              const isPopular = plan.popular
              const isCurrent = plan.id === tier && isSignedIn

              return (
                <div
                  key={plan.id}
                  className={`card-premium p-6 sm:p-7 relative flex flex-col ${
                    isPopular ? 'border-[#7C5CFC]/40 glow-violet-sm' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[#7C5CFC] px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-[#F5F5F7]">{plan.name}</h3>

                  <div className="mt-4">
                    {plan.priceUSD === 0 ? (
                      <span className="text-4xl font-bold text-[#F5F5F7]">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-[#F5F5F7]">
                          {isNigeria ? `₦${plan.priceNGN.toLocaleString()}` : `$${plan.priceUSD}`}
                        </span>
                        <span className="text-sm text-[#6B6B7B]">/mo</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-[#1A1535] text-[13px] font-semibold text-[#7C5CFC]">
                    {plan.coins.toLocaleString()} coins
                  </div>

                  <div className="h-px bg-[#25252F] my-5"></div>

                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[13px] text-[#A8A8B8] leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full mt-6 py-3 rounded-lg font-semibold text-[14px] transition-all ${
                      isCurrent
                        ? 'bg-[#14141C] text-[#6B6B7B] cursor-default border border-[#25252F]'
                        : isPopular
                        ? 'bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white shadow-lg shadow-[#7C5CFC]/20'
                        : 'bg-[#14141C] hover:bg-[#1A1A24] text-[#F5F5F7] border border-[#25252F] hover:border-[#3D3D4A]'
                    }`}
                    disabled={isCurrent || paymentProcessing}
                    onClick={() => handlePurchase(plan.id)}
                  >
                    {isCurrent ? 'Current Plan' : paymentProcessing ? 'Please wait...' : plan.priceUSD === 0 ? 'Start Free' : `Get ${plan.name}`}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[14px] text-[#6B6B7B]">
              Every new account gets <span className="font-semibold text-[#F5F5F7]">50 free coins</span>. No credit card needed.
            </p>
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section className="py-20 bg-[#0E0E14] border-y border-[#25252F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-8 text-center">Why this is the best money you will spend.</h2>
          <div className="space-y-6">
            <div className="card-premium p-7">
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-3">One closed deal pays for a year.</h3>
              <p className="text-[15px] text-[#A8A8B8] leading-relaxed">
                The Pro plan costs $35 a month. If you close one client from our leads, you have paid for the entire year.
                Everything after that is profit. Most of our users close their first deal in the first week.
                Do the math. This is the easiest yes you will ever say.
              </p>
            </div>
            <div className="card-premium p-7">
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-3">You are not paying for dead emails.</h3>
              <p className="text-[15px] text-[#A8A8B8] leading-relaxed">
                Every other lead vendor charges you for every contact on the list.
                The good ones and the dead ones. With us, you only pay for emails that work.
                The dead ones never reach you. That means every coin you spend goes toward a real lead.
                You get more value for less money. That is not a pitch. That is math.
              </p>
            </div>
            <div className="card-premium p-7">
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-3">Cancel anytime. No contracts.</h3>
              <p className="text-[15px] text-[#A8A8B8] leading-relaxed">
                You are not locked in. Cancel your plan anytime. Keep your coins.
                Keep your leads. Keep your collections. If you want to come back later, your account will be waiting.
                We do not believe in trapping people. We believe in earning their stay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coin Addons */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#1A1535] border border-[#7C5CFC]/20 mb-4">
              <span className="text-[12px] text-[#7C5CFC] font-semibold uppercase tracking-wider">Coin Top-Ups</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-3">Need more coins? Buy what you need.</h2>
            <p className="text-[15px] text-[#A8A8B8]">No plan needed. Buy coins anytime. They never expire.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {COIN_ADDONS.map((addon) => (
              <div key={addon.id} className="card-premium p-7 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#1A1535] border border-[#7C5CFC]/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gradient-violet">{addon.coins.toLocaleString()}</p>
                <p className="text-[13px] text-[#6B6B7B] mt-1 mb-4">coins</p>
                <p className="text-xl font-bold text-[#F5F5F7] mb-5">
                  {formatAddonPrice(addon, userCountry)}
                </p>
                <button
                  onClick={() => handleBuyCoins(addon)}
                  className="w-full py-3 rounded-lg bg-[#7C5CFC] hover:bg-[#6B4CE6] text-white font-semibold text-[14px] transition-colors disabled:opacity-50"
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Please wait...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 bg-[#0E0E14] border-t border-[#25252F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] mb-4">
            If the email bounces, you do not pay.
          </h2>
          <p className="text-[15px] text-[#A8A8B8] mb-8 max-w-xl mx-auto">
            That is our promise. Every email is tested before you spend a coin.
            If we are wrong, you get your coins back. No questions asked.
          </p>
          <Link
            href="/guarantee"
            className="inline-flex items-center gap-2 text-[#7C5CFC] hover:text-[#6B4CE6] font-semibold text-base transition-colors"
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
