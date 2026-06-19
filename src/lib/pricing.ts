/**
 * Bad Decision — Pricing Configuration
 * SINGLE SOURCE OF TRUTH for all pricing data.
 */

export type TierId = 'free' | 'starter' | 'growth' | 'pro'

export interface PricingTier {
  id: TierId
  name: string
  priceUSD: number
  priceNGN: number
  priceKobo: number
  credits: number
  creditsPerLead: number
  enginesCount: number
  searchesPerDay: number
  planType: 'free' | 'paid'
  engines: string[]
  features: string[]
  popular?: boolean
}

export interface CreditAddon {
  id: string
  name: string
  credits: number
  priceNGN: number
  priceKobo: number
  priceUSD: number
}

export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceUSD: 0,
    priceNGN: 0,
    priceKobo: 0,
    credits: 100,
    creditsPerLead: 1,
    enginesCount: 1,
    searchesPerDay: 3,
    planType: 'free',
    engines: ['smb_maps'],
    features: [
      '100 credits to get started',
      'Local Business search',
      '3 searches per day',
      '1 credit per lead',
      'Basic email check',
      'Business name, address, and phone',
      'Up to 50 leads per search',
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
      'Verified email addresses',
      'Contact person name and role',
      'Phone number included',
      'Up to 100 leads per search',
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
      'Verified email addresses',
      'Full contact details',
      'Priority search (faster results)',
      'Up to 100 leads per search',
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
    searchesPerDay: -1,
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '5,000 credits per month',
      'All 4 search engines',
      'Unlimited searches',
      '3 credits per lead',
      'Guaranteed deliverable emails',
      'Catch-all email detection',
      'Priority support',
      'Up to 100 leads per search',
      'Best for bulk lead generation',
    ],
  },
]

export const CREDIT_ADDONS: CreditAddon[] = [
  { id: 'credits-500', name: '500 Credits', credits: 500, priceNGN: 4000, priceKobo: 400000, priceUSD: 5 },
  { id: 'credits-1500', name: '1,500 Credits', credits: 1500, priceNGN: 12000, priceKobo: 1200000, priceUSD: 15 },
  { id: 'credits-3000', name: '3,000 Credits', credits: 3000, priceNGN: 20000, priceKobo: 2000000, priceUSD: 25 },
  { id: 'credits-5000', name: '5,000 Credits', credits: 5000, priceNGN: 28000, priceKobo: 2800000, priceUSD: 35 },
]

export function getTierById(id: string): PricingTier {
  return TIERS.find(t => t.id === id) || TIERS[0]
}

export function formatPrice(tier: PricingTier, country: string): string {
  if (tier.priceUSD === 0) return 'Free'
  if (country === 'NG') return `₦${tier.priceNGN.toLocaleString()}`
  return `$${tier.priceUSD}`
}

export function formatAddonPrice(addon: CreditAddon, country: string): string {
  if (country === 'NG') return `₦${addon.priceNGN.toLocaleString()}`
  return `$${addon.priceUSD}`
}

export function isEngineAvailable(engineId: string, tierId: TierId): boolean {
  const tier = getTierById(tierId)
  return tier.engines.includes(engineId)
}

export function getPaystackAmount(tier: PricingTier): number {
  return tier.priceKobo
}

export function getAddonPaystackAmount(addon: CreditAddon): number {
  return addon.priceKobo
}

export function getCreditsPerLead(tierId: TierId): number {
  const tier = getTierById(tierId)
  return tier.creditsPerLead
}
