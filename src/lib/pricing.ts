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
    engines: ['companies'],
    features: [
      '50 credits to get started',
      'Companies search',
      '2 searches per day',
      '1 credit per lead',
      'Basic email check',
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
    enginesCount: 1,
    searchesPerDay: 15,
    planType: 'paid',
    engines: ['companies'],
    features: [
      '500 credits per month',
      'Companies search',
      '15 searches per day',
      '2 credits per lead',
      'Verified email addresses',
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
    enginesCount: 3,
    searchesPerDay: 50,
    planType: 'paid',
    engines: ['companies', 'ads_running', 'ecommerce'],
    features: [
      '1,500 credits per month',
      'All 3 search engines',
      '50 searches per day',
      '2 credits per lead',
      'WhatsApp and Telegram indicators',
      'Full contact details',
      'Priority search (faster results)',
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
    enginesCount: 3,
    searchesPerDay: -1,
    planType: 'paid',
    engines: ['companies', 'ads_running', 'ecommerce'],
    features: [
      '4,000 credits per month',
      'All 3 search engines',
      'Unlimited searches',
      '3 credits per lead',
      'Guaranteed deliverable emails',
      'WhatsApp and Telegram indicators',
      'Export WhatsApp and Telegram leads',
      'Priority support',
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
