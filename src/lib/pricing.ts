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
    credits: 50,
    creditsPerLead: 1,
    enginesCount: 1,
    searchesPerDay: 2,
    planType: 'free',
    engines: ['smb_maps'],
    features: [
      '50 credits to get started',
      'Local Business search only',
      '2 searches per day',
      '1 credit per lead',
      'Basic email check',
      'Up to 25 leads per search',
      'Credits renew monthly (no accumulation)',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    priceUSD: 10,
    priceNGN: 13500,
    priceKobo: 1350000,
    credits: 500,
    creditsPerLead: 2,
    enginesCount: 2,
    searchesPerDay: 15,
    planType: 'paid',
    engines: ['smb_maps', 'web_absent'],
    features: [
      '500 credits per month',
      '2 search engines (smb_maps + web_absent)',
      '15 searches per day',
      '2 credits per lead',
      'Verified email addresses',
      'Up to 50 leads per search',
      'Credits expire in 60 days',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    priceUSD: 20,
    priceNGN: 27000,
    priceKobo: 2700000,
    credits: 1500,
    creditsPerLead: 2,
    enginesCount: 4,
    searchesPerDay: 50,
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '1,500 credits per month',
      'All 4 search engines',
      '50 searches per day',
      '2 credits per lead',
      'Verified email addresses',
      'Full contact details',
      'Priority search (faster results)',
      'Up to 75 leads per search',
      'Credits expire in 60 days',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 45,
    priceNGN: 61000,
    priceKobo: 6100000,
    credits: 4000,
    creditsPerLead: 3,
    enginesCount: 4,
    searchesPerDay: -1,
    planType: 'paid',
    engines: ['ads_intent', 'smb_maps', 'web_absent', 'social_intent'],
    features: [
      '4,000 credits per month',
      'All 4 search engines',
      'Unlimited searches',
      '3 credits per lead',
      'Guaranteed deliverable emails (DeepSeek Gate 3)',
      'Catch-all email detection',
      'Priority support',
      'Up to 100 leads per search',
      'Credits expire in 60 days',
      'Best for bulk lead generation',
    ],
  },
]

export const CREDIT_ADDONS: CreditAddon[] = [
  { id: 'credits-100', name: '100 Credits', credits: 100, priceNGN: 4000, priceKobo: 400000, priceUSD: 3 },
  { id: 'credits-500', name: '500 Credits', credits: 500, priceNGN: 16500, priceKobo: 1650000, priceUSD: 12 },
  { id: 'credits-1500', name: '1,500 Credits', credits: 1500, priceNGN: 41000, priceKobo: 4100000, priceUSD: 30 },
  { id: 'credits-3000', name: '3,000 Credits', credits: 3000, priceNGN: 75500, priceKobo: 7550000, priceUSD: 55 },
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
