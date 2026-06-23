/**
 * Bad Decision — Server-Side Credit Pricing (SINGLE SOURCE OF TRUTH)
 * ================================================================
 * SECURITY: This module is the ONLY place that maps Paystack payment
 * amounts to credit quantities. The Paystack webhook and the payment
 * verify route MUST use this — never trust client-supplied metadata
 * for credit amounts (it can be tampered with in the browser).
 *
 * The frontend's `src/lib/pricing.ts` mirrors these values for display
 * only. If you change a price here, change it there too.
 */

export interface CreditGrant {
  credits: number
  tier: string | null  // null = credit top-up, no tier change
  description: string
}

/**
 * Pricing tiers — matches `src/lib/pricing.ts` TIERS array.
 * Amounts are in NGN kobo (1 NGN = 100 kobo) and USD cents.
 */
export const PRICING = {
  // Tier upgrades (one-time credit purchases that also bump the tier)
  // Prices verified June 2026: $10/$20/$45 = ₦13,500/₦27,000/₦61,000 at ₦1,369/$
  TIERS: {
    starter: { credits: 500,  ngnKobo: 1_350_000, usdCents: 1000 },
    growth:  { credits: 1500, ngnKobo: 2_700_000, usdCents: 2000 },
    pro:     { credits: 4000, ngnKobo: 6_100_000, usdCents: 4500 },
  },
  // Credit top-up packs (no tier change) — priced higher per-credit than tiers
  ADDONS: [
    { credits: 100,  ngnKobo:   400_000, usdCents:  300 },
    { credits: 500,  ngnKobo: 1_650_000, usdCents: 1200 },
    { credits: 1500, ngnKobo: 4_100_000, usdCents: 3000 },
    { credits: 3000, ngnKobo: 7_550_000, usdCents: 5500 },
  ],
} as const

/**
 * Resolve a verified Paystack payment into a credit grant.
 *
 * Args:
 *   amount: Paystack `data.amount` (in kobo for NGN, cents for USD)
 *   currency: 'NGN' | 'USD' | other (treated as USD)
 *
 * Returns:
 *   { credits, tier, description } — never returns 0 credits for a valid payment.
 *   If the amount doesn't match any known package exactly, falls back to a
 *   generous per-kobo/per-cent rate so users always get their money's worth.
 *
 * NOTE: This function does NOT consult `metadata.credits` or `metadata.plan`.
 * Those fields are client-controlled and can be tampered with. The verified
 * `amount`/`currency` from Paystack is the only trusted input.
 */
export function resolveCreditGrant(amount: number, currency: string): CreditGrant {
  const cur = (currency || 'NGN').toUpperCase()

  // ---- Exact-match path: NGN ----
  if (cur === 'NGN') {
    // Tier upgrades
    for (const [tierId, t] of Object.entries(PRICING.TIERS)) {
      if (amount === t.ngnKobo) {
        return {
          credits: t.credits,
          tier: tierId,
          description: `${tierId.charAt(0).toUpperCase() + tierId.slice(1)} tier upgrade — ${t.credits} credits`,
        }
      }
    }
    // Add-on packs
    for (const a of PRICING.ADDONS) {
      if (amount === a.ngnKobo) {
        return {
          credits: a.credits,
          tier: null,
          description: `${a.credits} credit top-up`,
        }
      }
    }
    // Fallback: amount doesn't match a known package. Use a fair per-kobo rate
    // (1 credit per 110 kobo = 1 credit per ₦1.10). Based on the Small add-on
    // pack: ₦4,000 / 100 credits = ₦40/credit. Rounded up to 110 for safety.
    const fallbackCredits = Math.max(1, Math.round(amount / 110))
    return {
      credits: fallbackCredits,
      tier: null,
      description: `${fallbackCredits} credit top-up (manual/fallback)`,
    }
  }

  // ---- Exact-match path: USD (and any non-NGN currency) ----
  // Treat any non-NGN currency as USD cents for pricing purposes.
  for (const [tierId, t] of Object.entries(PRICING.TIERS)) {
    if (amount === t.usdCents) {
      return {
        credits: t.credits,
        tier: tierId,
        description: `${tierId.charAt(0).toUpperCase() + tierId.slice(1)} tier upgrade — ${t.credits} credits`,
      }
    }
  }
  for (const a of PRICING.ADDONS) {
    if (amount === a.usdCents) {
      return {
        credits: a.credits,
        tier: null,
        description: `${a.credits} credit top-up`,
      }
    }
  }
  // Fallback: 1 credit per cent
  const fallbackCredits = Math.max(1, Math.round(amount))
  return {
    credits: fallbackCredits,
    tier: null,
    description: `${fallbackCredits} credit top-up (manual/fallback)`,
  }
}
