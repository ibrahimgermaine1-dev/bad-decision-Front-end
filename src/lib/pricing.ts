/**
 * Bad Decision — Pricing Configuration
 * SINGLE SOURCE OF TRUTH for all pricing data.
 * Every component imports from here. No local pricing constants.
 *
 * Currency: NGN (Nigerian Naira) and USD
 * Payment: Paystack (amounts in kobo for NGN, cents for USD)
 * Naming: "credits" (NOT "coins")
 */

export type TierId = 'free' | 'starter' | 'growth' | 'pro'

export interface PricingTier {
  id: TierId
  name: string
  priceUSD: number
  priceNGN: number
  priceKobo: number       // priceNGN × 100 (Paystack API requires amounts in kobo)
  credits: number          // credits included in this tier
  creditsPerLead: number   // how many credits each lead costs
  enginesCount: number    // how many search engines unlocked
  searchesPerDay: number  // daily search limit (-1 = unlimited)
  planType: 'free' | 'paid'
  engines: string[]       // engine IDs unlocked
  features: string[]      // display features
  popular?: boolean       // highlight as most popular
}

export interface CreditAddon {
  id: string
  name: string
  credits: number
  priceNGN: number
  priceKobo: number       // priceNGN × 100
  priceUSD: number
}

// ============================================================
// TIERS
// ============================================================
// Per the handoff brief:
//   free = ads_intent ONLY, 50 credits, 1 credit/lead, Gate 1 only
//   starter = all 4 engines, 1500 credits, 2 credits/lead, Gate 1+2
//   growth = all 4 engines, 3000 credits, 2 credits/lead, Gate 1+2 + priority
//   pro = all 4 engines, 5000 credits, 3 credits/lead, Gate 1+2+3
export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceUSD: 0,
    priceNGN: 0,
    priceKobo: 0,
    credits: 50,
    creditsPerLead: 1,
    enginesCount: 1,
    searchesPerDay: 3,
    planType: 'free',
    engines: ['ads_intent'],
    features: [
      '50 credits to get started',
      '1 search engine (Ads Intelligence)',
      '3 searches per day',
      '1 credit per lead',
      'Basic email verification (Gate 1)',
      'Company name + website',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    priceUSD: 15,
    priceNGN: 12000,
    priceKobo: 1200000,
    credits: 1500,
    creditsPerLead: 2,
    enginesCount: 4,
    searchesPerDay: 25,
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '1,500 credits per month',
      'All 4 search engines',
      '25 searches per day',
      '2 credits per lead',
      'Enhanced email verification (Gate 1 + 2)',
      'Decision maker name + role',
      'Phone number validation',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    priceUSD: 25,
    priceNGN: 20000,
    priceKobo: 2000000,
    credits: 3000,
    creditsPerLead: 2,
    enginesCount: 4,
    searchesPerDay: 75,
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '3,000 credits per month',
      'All 4 search engines',
      '75 searches per day',
      '2 credits per lead',
      'Enhanced email verification (Gate 1 + 2)',
      'Full contact enrichment',
      'Priority processing (faster queue)',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 35,
    priceNGN: 28000,
    priceKobo: 2800000,
    credits: 5000,
    creditsPerLead: 3,
    enginesCount: 4,
    searchesPerDay: -1, // unlimited
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '5,000 credits per month',
      'All 4 search engines',
      'Unlimited searches',
      '3 credits per lead',
      'Guaranteed deliverable emails (Gate 1 + 2 + 3)',
      'Catch-all domain detection',
      'Priority support',
    ],
  },
]

// ============================================================
// CREDIT ADDONS (Top-ups)
// ============================================================
export const CREDIT_ADDONS: CreditAddon[] = [
  {
    id: 'credits-500',
    name: '500 Credits',
    credits: 500,
    priceNGN: 4000,
    priceKobo: 400000,
    priceUSD: 5,
  },
  {
    id: 'credits-1500',
    name: '1,500 Credits',
    credits: 1500,
    priceNGN: 12000,
    priceKobo: 1200000,
    priceUSD: 15,
  },
  {
    id: 'credits-3000',
    name: '3,000 Credits',
    credits: 3000,
    priceNGN: 20000,
    priceKobo: 2000000,
    priceUSD: 25,
  },
  {
    id: 'credits-5000',
    name: '5,000 Credits',
    credits: 5000,
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
 * Format a credit addon price for display.
 */
export function formatAddonPrice(addon: CreditAddon, country: string): string {
  if (country === 'NG') {
    return `₦${addon.priceNGN.toLocaleString()}`
  }
  return `$${addon.priceUSD}`
}

/**
 * Check if an engine is available for a given tier.
 * Free tier only gets ads_intent.
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
 * Get the Paystack amount in kobo for a credit addon.
 */
export function getAddonPaystackAmount(addon: CreditAddon): number {
  return addon.priceKobo
}

/**
 * Get the credits-per-lead cost for a tier.
 */
export function getCreditsPerLead(tierId: TierId): number {
  const tier = getTierById(tierId)
  return tier.creditsPerLead
}
