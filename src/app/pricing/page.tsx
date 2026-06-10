'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Coins, Check, HelpCircle } from 'lucide-react'
import { PricingCard, CoinPackageCard } from '@/components/pricing-card'

const tiers = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: 0,
    currency: '',
    coins: 50,
    engines: 2,
    searchesPerDay: 5,
    tagline: 'Kick the tires. See if it works before you pay a dime.',
    features: ['Basic lead data', 'Email export'],
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 10000,
    currency: '$',
    coins: 200,
    engines: 3,
    searchesPerDay: 25,
    tagline: 'You hunt alone. You need ammo that works.',
    features: ['CSV export', 'Email verification', 'Phone numbers', 'Priority support'],
    popular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 25000,
    currency: '$',
    coins: 600,
    engines: 4,
    searchesPerDay: 100,
    tagline: 'Your team needs more leads. More engines. More closed deals.',
    features: ['Advanced enrichment', 'Priority processing', 'Advanced filters', 'Bulk export', 'Social profiles'],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 50000,
    currency: '$',
    coins: 1500,
    engines: 4,
    searchesPerDay: 'Unlimited',
    tagline: 'Every lead checked. Every email verified. No limits. No excuses.',
    features: ['SMTP verification', 'All engines unlocked', 'API access', 'Custom enrichment', 'Dedicated support', 'White-label export'],
    popular: false,
  },
]

const coinPackages = [
  { id: 'micro', name: 'Micro', coins: 100, price: 5000, currency: '$' },
  { id: 'standard', name: 'Standard', coins: 300, price: 12000, currency: '$' },
  { id: 'bulk', name: 'Bulk', coins: 750, price: 25000, currency: '$', bestValue: true },
  { id: 'enterprise', name: 'Enterprise', coins: 2000, price: 60000, currency: '$' },
]

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [showCoins, setShowCoins] = useState(false)

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'explorer') {
      router.push('/dashboard')
      return
    }
    // Redirect to sign-in if not authenticated — Paystack requires email
    router.push(`/sign-up?redirect=/pricing&plan=${planId}`)
  }

  const handleBuyCoins = async (packageId: string) => {
    // Redirect to sign-in if not authenticated — Paystack requires email
    router.push(`/sign-up?redirect=/pricing&coins=${packageId}`)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
              You Put In Coins. You Get <span className="gradient-text">Leads</span>.
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-2">
              Like a vending machine. Put in coins. Get leads out. No hidden fees. No contracts. No fine print. Cancel whenever you want.
            </p>
            <p className="text-base text-[var(--text-tertiary)] max-w-xl mx-auto">
              Start with 50 free coins. That is enough to find your first batch of real, verified contacts and close your first deal. Upgrade when you are ready.
            </p>
          </motion.div>
        </div>

        {/* How Coins Work */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-3xl mx-auto"
        >
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">How Coins Work</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Coins are how you pay for searches. Each search type costs a different number of coins because some searches are harder to run than others. You only spend coins when you search. You never pay for bad results.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Each search costs coins</p>
                  <p className="text-[var(--text-tertiary)]">Ads Intent costs 10 coins. SMB Maps costs 8. Web Absent costs 12. Social Intent costs 15. That is it. No surprises.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-green-bg)] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[var(--color-green)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Coins never expire</p>
                  <p className="text-[var(--text-tertiary)]">Use them today, next week, next year. They sit in your account until you need them. No pressure.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-orange-bg)] flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4 text-[var(--color-orange)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Monthly coin allowance</p>
                  <p className="text-[var(--text-tertiary)]">Your plan gives you coins every month. Use them or save them. Your choice. They stack up if you do not use them.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-blue-bg)] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-[var(--color-blue)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Top up anytime</p>
                  <p className="text-[var(--text-tertiary)]">Run out of coins? Buy more. No need to upgrade your whole plan just to keep searching.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plan Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <PricingCard
                name={tier.name}
                price={tier.price}
                currency={tier.currency}
                coins={tier.coins}
                engines={tier.engines}
                searchesPerDay={tier.searchesPerDay}
                features={tier.features}
                popular={tier.popular}
                tagline={tier.tagline}
                onSelect={() => handleSelectPlan(tier.id)}
                isLoading={loadingPlan === tier.id}
              />
            </motion.div>
          ))}
        </div>

        {/* Coin Top-up Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <button
              type="button"
              onClick={() => setShowCoins(!showCoins)}
              className="inline-flex items-center gap-2 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              <Coins className="w-5 h-5" />
              <span className="text-lg font-semibold">Need More Coins Right Now?</span>
            </button>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">
              Run out of coins before your next monthly refill? Top up anytime. They never expire.
            </p>
          </div>

          {showCoins && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {coinPackages.map((pkg) => (
                <CoinPackageCard
                  key={pkg.id}
                  name={pkg.name}
                  coins={pkg.coins}
                  price={pkg.price}
                  currency={pkg.currency}
                  bestValue={pkg.bestValue}
                  onSelect={() => handleBuyCoins(pkg.id)}
                  isLoading={loadingPlan === pkg.id}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Quick FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
            Questions People Ask Before They Buy
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="What are coins?"
              answer="Coins are how you pay for searches. Each search type costs a different number of coins. Ads Intent costs 10 coins per search, SMB Maps costs 8, Web Absent costs 12, and Social Intent costs 15. Your plan gives you a monthly pile of coins. You can also buy more anytime. Coins never expire."
            />
            <FAQItem
              question="Do coins expire?"
              answer="No. Your coins sit in your account until you use them. Monthly coin allowances pile up on top of whatever you already have. There is no timer. No pressure."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes. Cancel whenever you want. No contracts. No penalties. No hoops to jump through. Your remaining coins stay in your account even after you cancel, so you can use them later if you come back."
            />
            <FAQItem
              question="What if I get bad results?"
              answer="We verify every email against the real mail server before you see it. If it bounces, you do not pay for it. We eat the cost of bad data so you do not have to. That is the deal."
            />
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              See all FAQ
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-[var(--text-tertiary)]"
        >
          &#9662;
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="px-4 pb-4 text-sm text-[var(--text-secondary)]">{answer}</p>
      </motion.div>
    </div>
  )
}
