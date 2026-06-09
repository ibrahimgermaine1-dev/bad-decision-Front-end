/**
 * Paystack Webhook — Add coins after successful payment
 * When Paystack confirms a payment:
 * 1. Read the metadata to determine plan vs add-on
 * 2. Find the user by email or reference
 * 3. Add the purchased coins to their ledger
 * 4. Upgrade tier if it's a plan purchase (not add-on)
 *
 * Note: This is the primary webhook for all Paystack payments (NGN and USD).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-client'

export async function POST(req: NextRequest) {
  try {
    // Guard: skip if Supabase env vars are missing (e.g. during build)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration incomplete' }, { status: 503 })
    }

    const body = await req.json()

    const { event, data } = body

    // Only handle successful charge
    if (event !== 'charge.success') {
      return NextResponse.json({ ok: true })
    }

    const userEmail = data.customer?.email
    const amount = data.amount // In kobo (divide by 100 for NGN)
    const currency = data.currency || 'NGN'
    const metadata = data.metadata || {}
    const isAddon = metadata.is_addon === true || (metadata.tier === null && metadata.coins)

    if (!userEmail) {
      return NextResponse.json({ error: 'No email in payment data' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find user by email
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('email', userEmail)
      .limit(1)
      .single()

    if (findError || !profile) {
      console.error('[PAYSTACK_WEBHOOK] User not found:', userEmail)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = profile.id

    // Determine what they bought — prefer metadata, fall back to amount
    let purchasedTier: string | null = null
    let coinsToAdd = 0

    if (isAddon && metadata.coins) {
      // Add-on purchase — coins specified in metadata
      coinsToAdd = Number(metadata.coins)
    } else if (metadata.tier) {
      // Plan purchase — tier specified in metadata
      purchasedTier = metadata.tier
      coinsToAdd = Number(metadata.coins) || 0
    } else {
      // Fallback: determine by amount
      if (currency === 'NGN') {
        const ngnAmount = amount / 100
        if (ngnAmount >= 50000) { purchasedTier = 'pro'; coinsToAdd = 12000 }
        else if (ngnAmount >= 25000) { purchasedTier = 'growth'; coinsToAdd = 5000 }
        else if (ngnAmount >= 18000) { coinsToAdd = 5000 }
        else if (ngnAmount >= 12000) { coinsToAdd = 3000 }
        else if (ngnAmount >= 10000) { purchasedTier = 'starter'; coinsToAdd = 2000 }
        else if (ngnAmount >= 6500) { coinsToAdd = 1500 }
        else if (ngnAmount >= 2500) { coinsToAdd = 500 }
        else coinsToAdd = Math.round(ngnAmount / 8)
      } else {
        const usdAmount = amount / 100
        if (usdAmount >= 35) { purchasedTier = 'pro'; coinsToAdd = 12000 }
        else if (usdAmount >= 18) { purchasedTier = 'growth'; coinsToAdd = 5000 }
        else if (usdAmount >= 14) { coinsToAdd = 5000 }
        else if (usdAmount >= 9) { coinsToAdd = 3000 }
        else if (usdAmount >= 8) { purchasedTier = 'starter'; coinsToAdd = 2000 }
        else if (usdAmount >= 5) { coinsToAdd = 1500 }
        else if (usdAmount >= 2) { coinsToAdd = 500 }
        else coinsToAdd = Math.round(usdAmount * 100)
      }
    }

    // Add coins
    const { error: coinError } = await supabase.rpc('add_coins', {
      p_user_id: userId,
      p_amount: coinsToAdd,
    })

    if (coinError) {
      console.error('[PAYSTACK_WEBHOOK] Coin add error:', coinError)
      return NextResponse.json({ error: coinError.message }, { status: 500 })
    }

    // Upgrade tier if they bought a plan (NOT add-on)
    if (purchasedTier) {
      const { error: tierError } = await supabase
        .from('profiles')
        .update({ tier: purchasedTier })
        .eq('id', userId)

      if (tierError) {
        console.error('[PAYSTACK_WEBHOOK] Tier update error:', tierError)
      }
    }

    // Record in payments table
    try {
      await supabase.from('payments').insert({
        user_id: userId,
        paystack_reference: data.reference || '',
        amount_kobo: amount,
        currency,
        coins_added: coinsToAdd,
        tier_purchased: purchasedTier,
        is_addon: isAddon,
        status: 'success',
      })
    } catch (e) {
      console.error('[PAYSTACK_WEBHOOK] Payment record error (non-critical):', e)
    }

    console.log(`[PAYSTACK_WEBHOOK] Payment success: ${userEmail} -> ${coinsToAdd} coins${purchasedTier ? ` (${purchasedTier} tier)` : ' (add-on)'}`)
    return NextResponse.json({ ok: true, coins_added: coinsToAdd, tier: purchasedTier })

  } catch (error: any) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
