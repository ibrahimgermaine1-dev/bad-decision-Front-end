/**
 * Bad Decision AI — Pricing Configuration
 * SINGLE SOURCE OF TRUTH for all pricing data.
 * Every component imports from here. No local pricing constants.
 * 
 * Currency: NGN (Nigerian Naira) and USD
 * Payment: Paystack (amounts in kobo for NGN, cents for USD)
 * No "API Access" anywhere in features.
 */

export type TierId = 'free' | 'starter' | 'growth' | 'pro'

export interface PricingTier {
  id: TierId
  name: string
  priceUSD: number
  priceNGN: number
  priceKobo: number       // priceNGN × 100 (Paystack API requires amounts in kobo)
  coins: number
  enginesCount: number    // how many search engines unlocked
  searchesPerDay: number  // daily search limit (-1 = unlimited)
  planType: 'free' | 'paid'
  engines: string[]       // engine IDs unlocked
  features: string[]      // display features (NO "API Access")
  popular?: boolean       // highlight as most popular
}

export interface CoinAddon {
  id: string
  name: string
  coins: number
  priceNGN: number
  priceKobo: number       // priceNGN × 100
  priceUSD: number
}

// ============================================================
// TIERS
// ============================================================
export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceUSD: 0,
    priceNGN: 0,
    priceKobo: 0,
    coins: 50,
    enginesCount: 2,
    searchesPerDay: 3,
    planType: 'free',
    engines: ['ads_intent', 'smb_maps'],
    features: [
      '50 coins to get started',
      '2 search engines',
      '3 searches per day',
      'Live Internet Scan',
      'Basic contact data',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    priceUSD: 15,
    priceNGN: 12000,
    priceKobo: 1200000,
    coins: 1500,
    enginesCount: 4,
    searchesPerDay: 25,
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '1,500 coins per month',
      'All 4 search engines',
      '25 searches per day',
      'Live Internet Scan',
      'Find Decision Makers',
      'Contact Footprint Check',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    priceUSD: 25,
    priceNGN: 20000,
    priceKobo: 2000000,
    coins: 3000,
    enginesCount: 4,
    searchesPerDay: 75,
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '3,000 coins per month',
      'All 4 search engines',
      '75 searches per day',
      'Live Internet Scan',
      'Find Decision Makers',
      'Priority Contact Check',
      'Smart Collections',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 35,
    priceNGN: 28000,
    priceKobo: 2800000,
    coins: 5000,
    enginesCount: 4,
    searchesPerDay: -1, // unlimited
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '5,000 coins per month',
      'All 4 search engines',
      'Unlimited searches',
      'Live Internet Scan',
      'Find Decision Makers',
      'Guaranteed Inbox Test',
      'Smart Collections',
      'Catch-all detection',
    ],
  },
]

// ============================================================
// COIN ADDONS (Top-ups)
// ============================================================
export const COIN_ADDONS: CoinAddon[] = [
  {
    id: 'coins-500',
    name: '500 Coins',
    coins: 500,
    priceNGN: 4000,
    priceKobo: 400000,
    priceUSD: 5,
  },
  {
    id: 'coins-1500',
    name: '1,500 Coins',
    coins: 1500,
    priceNGN: 12000,
    priceKobo: 1200000,
    priceUSD: 15,
  },
  {
    id: 'coins-5000',
    name: '5,000 Coins',
    coins: 5000,
    priceNGN: 28000,
    priceKobo: 2800000,
    priceUSD: 35,
  },
]

// ============================================================
// HELPERS
// ============================================================

/**
 * Get a tier by its ID. Returns the free tier if not found.
 */
export function getTierById(id: string): PricingTier {
  return TIERS.find(t => t.id === id) || TIERS[0]
}

/**
 * Format a price for display.
 * Returns the localized price string with currency symbol.
 */
export function formatPrice(tier: PricingTier, country: string): string {
  if (tier.priceUSD === 0) return 'Free'
  if (country === 'NG') {
    return `₦${tier.priceNGN.toLocaleString()}`
  }
  return `$${tier.priceUSD}`
}

/**
 * Format a coin addon price for display.
 */
export function formatAddonPrice(addon: CoinAddon, country: string): string {
  if (country === 'NG') {
    return `₦${addon.priceNGN.toLocaleString()}`
  }
  return `$${addon.priceUSD}`
}

/**
 * Check if an engine is available for a given tier.
 * Free tier only gets ads_intent and smb_maps.
 */
export function isEngineAvailable(engineId: string, tierId: TierId): boolean {
  const tier = getTierById(tierId)
  return tier.engines.includes(engineId)
}

/**
 * Get the Paystack amount in kobo for a tier.
 * Always uses NGN pricing for Paystack.
 */
export function getPaystackAmount(tier: PricingTier): number {
  return tier.priceKobo
}

/**
 * Get the Paystack amount in kobo for a coin addon.
 */
export function getAddonPaystackAmount(addon: CoinAddon): number {
  return addon.priceKobo
}
