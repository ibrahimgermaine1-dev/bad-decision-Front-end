/**
 * Bad Decision AI — Pricing Configuration
 */

export interface PricingTier {
  id: UserTier
  name: string
  coins: number
  priceUSD: number
  priceNGN: number
  enginesUnlocked: string[]
  gatesUnlocked: string[]
  popular?: boolean
}

type UserTier = 'free' | 'starter' | 'growth' | 'pro'

export const PRICING_TIERS: PricingTier[] = [
  { id: 'free', name: 'Free', coins: 50, priceUSD: 0, priceNGN: 0, enginesUnlocked: ['Ads Intent', 'SMB Maps'], gatesUnlocked: ['Gate 1: DNS Verify'] },
  { id: 'starter', name: 'Starter', coins: 1500, priceUSD: 15, priceNGN: 12000, enginesUnlocked: ['Ads Intent', 'SMB Maps', 'Web Absent', 'Social Intent'], gatesUnlocked: ['Gate 1: DNS Verify', 'Gate 2: Footprint Check'] },
  { id: 'growth', name: 'Growth', coins: 3000, priceUSD: 25, priceNGN: 20000, enginesUnlocked: ['Ads Intent', 'SMB Maps', 'Web Absent', 'Social Intent'], gatesUnlocked: ['Gate 1: DNS Verify', 'Gate 2: Footprint Check (Priority AI)'], popular: true },
  { id: 'pro', name: 'Pro', coins: 5000, priceUSD: 35, priceNGN: 28000, enginesUnlocked: ['Ads Intent', 'SMB Maps', 'Web Absent', 'Social Intent'], gatesUnlocked: ['Gate 1: DNS Verify', 'Gate 2: Footprint Check', 'Gate 3: SMTP Verify'] },
]

export const ENGINE_CONFIG = [
  { id: 'ads_intent' as const, name: 'Ads Intent', description: 'Find businesses actively running online ads', icon: 'Megaphone', coinCost: { free: 1, starter: 2, growth: 2, pro: 3 } },
  { id: 'smb_maps' as const, name: 'SMB Maps', description: 'Find local brick-and-mortar businesses', icon: 'MapPin', coinCost: { free: 1, starter: 2, growth: 2, pro: 3 } },
  { id: 'web_absent' as const, name: 'Web Absent', description: 'Find businesses without their own website', icon: 'Globe', coinCost: { free: 1, starter: 2, growth: 2, pro: 3 } },
  { id: 'social_intent' as const, name: 'Social Intent', description: 'Real-time demand radar from social platforms', icon: 'Zap', coinCost: { free: 1, starter: 2, growth: 2, pro: 3 } },
]

export function getCoinCost(tier: UserTier): number {
  switch (tier) { case 'pro': return 3; case 'starter': case 'growth': return 2; default: return 1 }
}

export function getPrice(tier: PricingTier, country: string): { amount: number; currency: string; symbol: string } {
  if (country === 'NG') return { amount: tier.priceNGN, currency: 'NGN', symbol: '₦' }
  return { amount: tier.priceUSD, currency: 'USD', symbol: '$' }
}

export function isEngineAvailable(engineId: string, tier: UserTier): boolean {
  if (tier === 'free') return engineId === 'ads_intent' || engineId === 'smb_maps'
  return true
}
