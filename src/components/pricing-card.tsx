'use client'

import { motion } from 'framer-motion'
import { Check, Star, Zap } from 'lucide-react'

interface PricingCardProps {
  name: string
  price: number
  currency: string
  coins: number
  engines: number
  searchesPerDay: number | string
  features: string[]
  popular?: boolean
  coinPackage?: boolean
  tagline?: string
  onSelect: () => void
  isLoading?: boolean
  currentPlan?: boolean
}

export function PricingCard({
  name,
  price,
  currency,
  coins,
  engines,
  searchesPerDay,
  features,
  popular,
  coinPackage,
  tagline,
  onSelect,
  isLoading,
  currentPlan,
}: PricingCardProps) {
  const isFree = price === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`
        relative rounded-2xl overflow-hidden transition-all duration-300
        ${popular 
          ? 'glow-accent-strong border-[var(--color-accent)]/40' 
          : 'border-[var(--border-color)] hover:border-[var(--border-light)]'
        }
        ${currentPlan ? 'ring-2 ring-[var(--color-accent)]' : ''}
        bg-[var(--bg-surface)] border
      `}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)]" />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{name}</h3>
              {popular && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent)] text-white">
                  <Star className="w-3 h-3" /> Popular
                </span>
              )}
            </div>
            {currentPlan && (
              <span className="text-xs text-[var(--color-accent)] mt-1 inline-flex items-center gap-1">
                <Zap className="w-3 h-3" /> Current Plan
              </span>
            )}
          </div>
        </div>

        {/* Tagline */}
        {tagline && (
          <p className="text-xs text-[var(--text-tertiary)] mb-4">{tagline}</p>
        )}

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            {isFree ? (
              <span className="text-3xl font-bold text-[var(--text-primary)]">Free</span>
            ) : (
              <>
                <span className="text-sm text-[var(--text-tertiary)]">{currency}</span>
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  {price.toLocaleString()}
                </span>
                <span className="text-sm text-[var(--text-tertiary)]">/month</span>
              </>
            )}
          </div>

          {/* Coin allowance */}
          {!coinPackage && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-[var(--color-coin)]">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">&#162;</span>
              </div>
              <span className="font-semibold">{coins.toLocaleString()} coins/month</span>
            </div>
          )}
        </div>

        {/* Features */}
        {!coinPackage && (
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Check className="w-4 h-4 text-[var(--color-green)] shrink-0" />
              <span>{engines} search engines</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Check className="w-4 h-4 text-[var(--color-green)] shrink-0" />
              <span>{searchesPerDay} searches/day</span>
            </div>
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Check className="w-4 h-4 text-[var(--color-green)] shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          type="button"
          onClick={onSelect}
          disabled={isLoading || currentPlan}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            w-full py-3 rounded-xl text-sm font-semibold transition-all
            ${popular && !currentPlan
              ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-purple)] text-white hover:shadow-lg hover:shadow-[var(--color-accent)]/20'
              : currentPlan
                ? 'bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)] cursor-not-allowed'
                : 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
            }
          `}
        >
          {isLoading ? 'Processing...' : currentPlan ? 'Current Plan' : isFree ? 'Get Started Free' : 'Subscribe'}
        </motion.button>
      </div>
    </motion.div>
  )
}

// Coin Package Card
interface CoinPackageCardProps {
  name: string
  coins: number
  price: number
  currency: string
  bestValue?: boolean
  onSelect: () => void
  isLoading?: boolean
}

export function CoinPackageCard({ name, coins, price, currency, bestValue, onSelect, isLoading }: CoinPackageCardProps) {
  const perCoin = (price / coins).toFixed(0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className={`
        relative rounded-2xl overflow-hidden p-5 transition-all duration-300
        ${bestValue 
          ? 'glow-accent border-[var(--color-accent)]/30' 
          : 'border-[var(--border-color)] hover:border-[var(--border-light)]'
        }
        bg-[var(--bg-surface)] border
      `}
    >
      {bestValue && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-accent)] text-white">
            Best Value
          </span>
        </div>
      )}

      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mb-3">
          <span className="text-2xl">&#129689;</span>
        </div>
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{name}</h4>
        <div className="text-2xl font-bold text-[var(--color-coin)] mb-1">{coins.toLocaleString()}</div>
        <div className="text-xs text-[var(--text-tertiary)] mb-3">coins</div>
        <div className="text-lg font-bold text-[var(--text-primary)] mb-1">
          {currency}{price.toLocaleString()}
        </div>
        <div className="text-xs text-[var(--text-tertiary)] mb-4">
          ~{currency}{perCoin}/coin
        </div>
        <motion.button
          type="button"
          onClick={onSelect}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg-surface-hover)] text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Buy Now'}
        </motion.button>
      </div>
    </motion.div>
  )
}
