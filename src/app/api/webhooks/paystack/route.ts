/**
 * Paystack Webhook — Add coins after successful payment
 * With real HMAC-SHA512 signature verification.
 *
 * When Paystack confirms a payment:
 * 1. Verify the HMAC-SHA512 signature
 * 2. Find the user by email or reference
 * 3. Add the purchased coins to their ledger
 * 4. Upgrade tier if it's a plan purchase
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Verify Paystack webhook signature using HMAC-SHA512
 */
function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.warn('[PAYSTACK_WEBHOOK] No PAYSTACK_SECRET_KEY configured, skipping verification')
    return true
  }
  const hash = createHmac('sha512', secret).update(payload).digest('hex')
  return hash === signature
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''

    // Verify signature
    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { event, data } = body

    // Only handle successful charge
    if (event !== 'charge.success') {
      return NextResponse.json({ ok: true })
    }

    const userEmail = data.customer?.email
    const reference = data.reference
    const amount = data.amount // In kobo (divide by 100 for NGN)
    const currency = data.currency || 'NGN'

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

    // Determine what they bought based on amount
    let purchasedTier: string | null = null
    let coinsToAdd = 0

    if (currency === 'NGN') {
      const ngnAmount = amount / 100 // Convert from kobo
      if (ngnAmount >= 28000) { purchasedTier = 'pro'; coinsToAdd = 5000 }
      else if (ngnAmount >= 20000) { purchasedTier = 'growth'; coinsToAdd = 3000 }
      else if (ngnAmount >= 12000) { purchasedTier = 'starter'; coinsToAdd = 1500 }
      else {
        if (ngnAmount >= 4000) coinsToAdd = 500
        else coinsToAdd = Math.round(ngnAmount / 8)
      }
    } else {
      const usdAmount = amount / 100
      if (usdAmount >= 35) { purchasedTier = 'pro'; coinsToAdd = 5000 }
      else if (usdAmount >= 25) { purchasedTier = 'growth'; coinsToAdd = 3000 }
      else if (usdAmount >= 15) { purchasedTier = 'starter'; coinsToAdd = 1500 }
      else {
        if (usdAmount >= 5) coinsToAdd = 500
        else coinsToAdd = Math.round(usdAmount * 100)
      }
    }

    // Add coins using the stored procedure
    const { error: coinError } = await supabase.rpc('add_coins', {
      p_user_id: userId,
      p_amount: coinsToAdd,
    })

    if (coinError) {
      console.error('[PAYSTACK_WEBHOOK] Coin add error:', coinError)
      return NextResponse.json({ error: coinError.message }, { status: 500 })
    }

    // Upgrade tier if they bought a plan
    if (purchasedTier) {
      const { error: tierError } = await supabase
        .from('profiles')
        .update({ tier: purchasedTier })
        .eq('id', userId)

      if (tierError) {
        console.error('[PAYSTACK_WEBHOOK] Tier update error:', tierError)
      }
    }

    console.log(`[PAYSTACK_WEBHOOK] Payment success: ${userEmail} -> ${coinsToAdd} coins${purchasedTier ? ` (${purchasedTier} tier)` : ''}`)
    return NextResponse.json({ ok: true, coins_added: coinsToAdd, tier: purchasedTier })

  } catch (error: any) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
