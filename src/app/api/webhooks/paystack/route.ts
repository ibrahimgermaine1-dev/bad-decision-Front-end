/**
 * Paystack Webhook — Add coins after successful payment
 *
 * Flow:
 * 1. Verify the HMAC-SHA512 signature from Paystack
 * 2. Only process charge.success events
 * 3. Find the user by email
 * 4. Add the purchased coins via Supabase RPC
 * 5. Upgrade tier if it's a plan purchase
 *
 * IMPORTANT: All user_id columns are TEXT (Clerk IDs like "user_xxx").
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-client'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // Read the raw body for signature verification
    const rawBody = await req.text()

    // ============================================================
    // STEP 1: Verify Paystack signature (CRITICAL for security)
    // ============================================================
    const paystackSignature = req.headers.get('x-paystack-signature')
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    if (!paystackSecretKey) {
      console.error('[PAYSTACK_WEBHOOK] Missing PAYSTACK_SECRET_KEY env var')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    if (!paystackSignature) {
      console.error('[PAYSTACK_WEBHOOK] Missing x-paystack-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Compute HMAC-SHA512 of the raw body using the secret key
    const expectedSignature = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== paystackSignature) {
      console.error('[PAYSTACK_WEBHOOK] Invalid signature — possible tampering')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // ============================================================
    // STEP 2: Parse the verified body
    // ============================================================
    const body = JSON.parse(rawBody)
    const { event, data } = body

    // Only handle successful charge
    if (event !== 'charge.success') {
      return NextResponse.json({ ok: true })
    }

    const userEmail = data.customer?.email
    const amount = data.amount // In kobo (cents)
    const currency = data.currency || 'NGN'
    const reference = data.reference || ''

    if (!userEmail) {
      return NextResponse.json({ error: 'No email in payment data' }, { status: 400 })
    }

    const supabase = createServerClient()

    // ============================================================
    // STEP 3: Find user by email (profiles.email is TEXT)
    // ============================================================
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('email', userEmail)
      .limit(1)
      .single()

    if (findError || !profile) {
      console.error('[PAYSTACK_WEBHOOK] User not found by email:', userEmail, findError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // profile.id is TEXT — the Clerk user ID (e.g., "user_3EpAbGzlWhXf8l8H1clTpAxaDY0")
    const userId = profile.id

    // ============================================================
    // STEP 4: Determine what they bought based on metadata or amount
    // ============================================================
    let purchasedTier: string | null = null
    let coinsToAdd = 0

    // Check metadata first (we store it during checkout)
    const metadata = data.metadata || {}
    if (metadata.coins) {
      coinsToAdd = Number(metadata.coins)
      if (metadata.tier) {
        purchasedTier = metadata.tier
      }
    } else {
      // Fallback: determine from amount
      if (currency === 'NGN') {
        const ngnAmount = amount / 100
        if (ngnAmount >= 28000) { purchasedTier = 'pro'; coinsToAdd = 5000 }
        else if (ngnAmount >= 20000) { purchasedTier = 'growth'; coinsToAdd = 3000 }
        else if (ngnAmount >= 12000) { purchasedTier = 'starter'; coinsToAdd = 1500 }
        else if (ngnAmount >= 4000) coinsToAdd = 500
        else coinsToAdd = Math.round(ngnAmount / 8)
      } else {
        const usdAmount = amount / 100
        if (usdAmount >= 35) { purchasedTier = 'pro'; coinsToAdd = 5000 }
        else if (usdAmount >= 25) { purchasedTier = 'growth'; coinsToAdd = 3000 }
        else if (usdAmount >= 15) { purchasedTier = 'starter'; coinsToAdd = 1500 }
        else if (usdAmount >= 5) coinsToAdd = 500
        else coinsToAdd = Math.round(usdAmount * 100)
      }
    }

    // ============================================================
    // STEP 5: Add coins via Supabase RPC (p_user_id is TEXT)
    // ============================================================
    const { error: coinError } = await supabase.rpc('add_coins', {
      p_user_id: userId,
      p_amount: coinsToAdd,
    })

    if (coinError) {
      console.error('[PAYSTACK_WEBHOOK] Coin add error:', coinError)
      return NextResponse.json({ error: coinError.message }, { status: 500 })
    }

    // ============================================================
    // STEP 6: Upgrade tier if they bought a plan
    // ============================================================
    if (purchasedTier) {
      const { error: tierError } = await supabase
        .from('profiles')
        .update({ tier: purchasedTier })
        .eq('id', userId)

      if (tierError) {
        console.error('[PAYSTACK_WEBHOOK] Tier update error:', tierError)
        // Don't fail the webhook — coins were added successfully
      }
    }

    console.log(`[PAYSTACK_WEBHOOK] Payment success: ${userEmail} -> ${coinsToAdd} coins${purchasedTier ? ` (${purchasedTier} tier)` : ''} ref=${reference}`)
    return NextResponse.json({ ok: true, coins_added: coinsToAdd, tier: purchasedTier })

  } catch (error: any) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
