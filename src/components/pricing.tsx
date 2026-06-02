'use client'

/**
 * PRICING PAGE — Geo-Routed, Paystack Only
 * White background. 4-column grid. Growth card inverted (midnight bg).
 * No emojis. Direct-response copy. No tech jargon.
 */
import { useState } from 'react'
import { useAppStore, type UserTier } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

interface PricingTier {
  id: UserTier
  name: string
  coins: number
  priceUSD: number
  priceNGN: number
  features: string[]
  popular?: boolean
  isFree?: boolean
}

const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    coins: 50,
    priceUSD: 0,
    priceNGN: 0,
    isFree: true,
    features: [
      '50 coins to start',
      '2 search types (Ads + Local)',
      'Basic email check',
      'View results in app',
      'No CSV export',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    coins: 1500,
    priceUSD: 15,
    priceNGN: 12000,
    features: [
      '1,500 coins per month',
      'All 4 search types',
      'Find Decision Makers',
      'Contact Footprint Check',
      'CSV Export included',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    coins: 3000,
    priceUSD: 25,
    priceNGN: 20000,
    popular: true,
    features: [
      '3,000 coins per month',
      'All 4 search types',
      'Priority Contact Check',
      'Smart Collections',
      'CSV Export included',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    coins: 5000,
    priceUSD: 35,
    priceNGN: 28000,
    features: [
      '5,000 coins per month',
      'All 4 search types',
      'Guaranteed Inbox Test',
      'Catch-all Detection',
      'Smart Collections',
    ],
  },
]

export function PricingPage() {
  const { setView, userCountry, tier, addCoins, setTier } = useAppStore()
  const [paystackOpen, setPaystackOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)

  const isNigeria = userCountry === 'NG'

  const handlePurchase = (plan: PricingTier) => {
    if (plan.isFree) {
      setView('signup')
      return
    }
    setSelectedTier(plan)
    setPaystackOpen(true)
  }

  const handlePaystackSuccess = () => {
    if (selectedTier) {
      addCoins(selectedTier.coins)
      setTier(selectedTier.id)
    }
    setPaystackOpen(false)
    setView('dashboard-idle')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Header */}
      <section className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight">
            Pricing That Scales.
          </h1>
          <p className="mt-4 text-lg text-[#64748B]">Stop paying thousands for stale databases. Pay only for verified contacts.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 text-sm">
            <span className="text-[#64748B]">Currency:</span>
            <span className="font-semibold text-[#0F172A]">{isNigeria ? 'Nigerian Naira (NGN)' : 'US Dollar (USD)'}</span>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-4">
            {TIERS.map((plan) => {
              const price = isNigeria ? plan.priceNGN : plan.priceUSD
              const symbol = isNigeria ? 'N' : '$'
              const isInverted = plan.popular

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-6 relative ${
                    isInverted
                      ? 'bg-[#0B1120] border-[#2563EB] text-white'
                      : plan.isFree
                      ? 'bg-white border-[#E2E8F0] text-[#0F172A]'
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
                    {plan.isFree ? (
                      <span className={`text-4xl font-bold tracking-tight ${isInverted ? 'text-white' : 'text-[#0F172A]'}`}>
                        Free
                      </span>
                    ) : (
                      <>
                        <span className={`text-4xl font-bold tracking-tight ${isInverted ? 'text-white' : 'text-[#0F172A]'}`}>
                          {symbol}{price.toLocaleString()}
                        </span>
                        <span className={`text-sm ${isInverted ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>/month</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className={`text-sm font-medium ${isInverted ? 'text-[#2563EB]' : 'text-[#2563EB]'}`}>
                      {plan.coins.toLocaleString()} coins
                    </span>
                  </div>

                  <Separator className={`my-5 ${isInverted ? 'bg-[#1E293B]' : 'bg-[#E2E8F0]'}`} />

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isInverted ? 'text-[#2563EB]' : 'text-[#2563EB]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm ${isInverted ? 'text-[#CBD5E1]' : 'text-[#475569]'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full mt-6 py-4 font-semibold text-sm ${
                      isInverted
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                        : plan.id === tier
                        ? 'bg-[#F8FAFC] text-[#64748B] cursor-default'
                        : plan.isFree
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                        : 'bg-white border-2 border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB]'
                    }`}
                    variant={isInverted || plan.isFree ? 'default' : 'outline'}
                    disabled={plan.id === tier && !plan.isFree}
                    onClick={() => handlePurchase(plan)}
                  >
                    {plan.isFree ? 'Get Started Free' : plan.id === tier ? 'Current Plan' : `Get ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Paystack Dialog */}
      <Dialog open={paystackOpen} onOpenChange={setPaystackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
          </DialogHeader>
          {selectedTier && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#E2E8F0] p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedTier.name} Plan</span>
                  <span className="font-bold text-lg">
                    {isNigeria ? 'N' : '$'}{isNigeria ? selectedTier.priceNGN.toLocaleString() : selectedTier.priceUSD}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-[#64748B]">
                  <span>Coins included</span>
                  <span>{selectedTier.coins.toLocaleString()}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>{isNigeria ? 'N' : '$'}{isNigeria ? selectedTier.priceNGN.toLocaleString() : selectedTier.priceUSD} {isNigeria ? 'NGN' : 'USD'}</span>
                </div>
              </div>
              <p className="text-xs text-center text-[#64748B]">
                Payments are processed securely. We never see your card details.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaystackOpen(false)}>Cancel</Button>
            <Button onClick={handlePaystackSuccess} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
              Buy Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
