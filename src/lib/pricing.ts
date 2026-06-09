/**
 * Bad Decision — Pricing Configuration
 * All tier definitions, coin add-ons, and currency logic.
 */

export type TierId = 'free' | 'starter' | 'growth' | 'pro'

export interface PricingTier {
  id: TierId
  name: string
  tagline: string
  coins: number
  priceNGN: number
  priceUSD: number
  features: string[]
  popular?: boolean
  /** Which search engines are available */
  engines: string[]
}

export interface CoinAddon {
  coins: number
  priceNGN: number
  priceUSD: number
  label: string
}

// ============================================================
// TIERS
// ============================================================
export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try Before You Buy',
    coins: 250,
    priceNGN: 0,
    priceUSD: 0,
    engines: ['Local Businesses', 'Companies Running Ads'],
    features: [
      '250 coins on signup',
      '2 search engines: Local Businesses + Companies Running Ads',
      'Basic contact details (name, phone, address)',
      'Export to CSV',
      'Up to 5 saved searches',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Start Closing Deals',
    coins: 2000,
    priceNGN: 10000,
    priceUSD: 8,
    engines: ['Local Businesses', 'Companies Running Ads', 'Businesses Without Websites', 'Social Demand Radar'],
    features: [
      '2,000 coins per month',
      'All 4 search engines',
      'Direct email addresses',
      'Decision maker names',
      'Export to CSV',
      'Unlimited saved searches',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Scale Your Pipeline',
    coins: 5000,
    priceNGN: 25000,
    priceUSD: 18,
    popular: true,
    engines: ['Local Businesses', 'Companies Running Ads', 'Businesses Without Websites', 'Social Demand Radar'],
    features: [
      '5,000 coins per month',
      'All 4 search engines',
      'Priority contact verification',
      'Social demand radar with real-time alerts',
      'Unlimited saved searches',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Dominate Your Market',
    coins: 12000,
    priceNGN: 50000,
    priceUSD: 35,
    engines: ['Local Businesses', 'Companies Running Ads', 'Businesses Without Websites', 'Social Demand Radar'],
    features: [
      '12,000 coins per month',
      'All 4 search engines',
      'Guaranteed email delivery (inbox verification)',
      'Catch-all email detection',
      'First access to new search engines',
      'Priority support',
    ],
  },
]

// ============================================================
// COIN ADD-ONS (one-time purchases)
// ============================================================
export const COIN_ADDONS: CoinAddon[] = [
  { coins: 500, priceNGN: 2500, priceUSD: 2, label: '500 Coins' },
  { coins: 1500, priceNGN: 6500, priceUSD: 5, label: '1,500 Coins' },
  { coins: 3000, priceNGN: 12000, priceUSD: 9, label: '3,000 Coins' },
  { coins: 5000, priceNGN: 18000, priceUSD: 14, label: '5,000 Coins' },
]

// ============================================================
// HELPERS
// ============================================================
export function getTierById(id: TierId): PricingTier | undefined {
  return TIERS.find((t) => t.id === id)
}

export function formatPrice(amount: number, currency: 'NGN' | 'USD'): string {
  if (currency === 'NGN') {
    return `\u20A6${amount.toLocaleString()}`
  }
  return `$${amount}`
}

export function getTierPrice(tier: PricingTier, currency: 'NGN' | 'USD'): string {
  if (tier.id === 'free') return currency === 'NGN' ? 'Free' : 'Free'
  return formatPrice(tier.priceNGN, currency)
}

export function getAddonPrice(addon: CoinAddon, currency: 'NGN' | 'USD'): string {
  return formatPrice(currency === 'NGN' ? addon.priceNGN : addon.priceUSD, currency)
}
