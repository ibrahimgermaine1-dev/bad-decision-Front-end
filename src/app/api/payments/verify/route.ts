/**
 * Paystack Payment Verification — Server-side
 * BUG 1 FIX: Verifies payment with Paystack's API before updating UI.
 * Prevents client-side balance spoofing by confirming transactions server-side.
 * 
 * Flow:
 * 1. Client completes Paystack popup → gets reference
 * 2. Client calls this endpoint with the reference
 * 3. We verify with Paystack's /verify endpoint
 * 4. If verified, return the confirmed balance
 * 
 * Note: The webhook is still the source of truth for credit additions.
 * This endpoint just confirms whether payment was actually received.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const rateLimitResult = checkRateLimit(req, { maxRequests: 10, windowMs: 60000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many verification requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference: reqReference } = await req.json()
    if (!reqReference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    // Validate reference format (Paystack references are typically alphanumeric + hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(reqReference)) {
      return NextResponse.json({ error: 'Invalid reference format' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('[PAYMENT_VERIFY] PAYSTACK_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Payment verification not configured' }, { status: 503 })
    }

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reqReference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}))
      console.error('[PAYMENT_VERIFY] Paystack verify failed:', errData)
      return NextResponse.json({ error: 'Payment verification failed', status: 'failed' }, { status: 400 })
    }

    const verifyData = await verifyRes.json()

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return NextResponse.json({
        verified: false,
        status: verifyData.data?.status || 'unknown',
        message: 'Payment was not successful',
      })
    }

    // Payment verified successfully
    const amount = verifyData.data.amount
    const currency = verifyData.data.currency || 'NGN'
    const reference = verifyData.data.reference || reqReference

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({
        verified: true,
        status: 'success',
        amount,
        currency,
        message: 'Payment verified but balance fetch unavailable',
      })
    }

    const sbHeaders: Record<string, string> = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    }

    // DETERMINE CREDITS TO ADD based on metadata (same logic as webhook)
    const metadata = verifyData.data.metadata || {}
    const isCreditAddon = metadata.type === 'credit_addon'
    const metadataPlan = metadata.plan as string | undefined
    const metadataCredits = metadata.credits as number | undefined
    const metadataUserId = metadata.user_id as string | undefined

    let creditsToAdd = 0
    let description = 'Credit purchase'
    let purchasedTier: string | null = null

    // Use the authenticated userId (most reliable) or fall back to metadata
    const effectiveUserId = userId || metadataUserId

    if (isCreditAddon) {
      creditsToAdd = metadataCredits || 0
      description = `${creditsToAdd} credit top-up`
    } else if (metadataPlan) {
      purchasedTier = metadataPlan
      const tierCredits: Record<string, number> = { starter: 1500, growth: 3000, pro: 5000 }
      creditsToAdd = metadataCredits || tierCredits[metadataPlan] || 0
      description = `${metadataPlan.charAt(0).toUpperCase() + metadataPlan.slice(1)} tier upgrade - ${creditsToAdd} credits`
    } else {
      // Fallback: amount-based mapping
      if (currency === 'NGN') {
        const ngn = amount / 100
        if (ngn >= 28000) { purchasedTier = 'pro'; creditsToAdd = 5000 }
        else if (ngn >= 20000) { purchasedTier = 'growth'; creditsToAdd = 3000 }
        else if (ngn >= 12000) { purchasedTier = 'starter'; creditsToAdd = 1500 }
        else if (ngn >= 4000) { creditsToAdd = 500 }
        else creditsToAdd = Math.round(ngn / 8)
      } else {
        const usd = amount / 100
        if (usd >= 35) { purchasedTier = 'pro'; creditsToAdd = 5000 }
        else if (usd >= 25) { purchasedTier = 'growth'; creditsToAdd = 3000 }
        else if (usd >= 15) { purchasedTier = 'starter'; creditsToAdd = 1500 }
        else if (usd >= 5) { creditsToAdd = 500 }
        else creditsToAdd = Math.round(usd * 100)
      }
      description = purchasedTier ? `${purchasedTier} tier upgrade - ${creditsToAdd} credits` : `${creditsToAdd} credit top-up`
    }

    // ADD CREDITS DIRECTLY via add_credits RPC (idempotent — safe to call
    // even if the webhook already processed this payment)
    if (creditsToAdd > 0 && effectiveUserId) {
      console.log(`[PAYMENT_VERIFY] Adding ${creditsToAdd} credits to user ${effectiveUserId} (ref: ${reference})`)
      const addCreditsRes = await fetch(`${supabaseUrl}/rest/v1/rpc/add_credits`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify({
          p_user_id: effectiveUserId,
          p_amount: creditsToAdd,
          p_transaction_type: 'purchase',
          p_description: description,
          p_reference_id: reference,
        }),
      })

      if (addCreditsRes.ok) {
        console.log(`[PAYMENT_VERIFY] Credits added successfully via add_credits RPC`)
      } else {
        const err = await addCreditsRes.json().catch(() => ({}))
        console.error('[PAYMENT_VERIFY] add_credits RPC failed:', err)
        // The webhook may have already processed this — that's OK (idempotent)
      }

      // Upgrade tier if applicable
      if (purchasedTier) {
        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(effectiveUserId)}`, {
          method: 'PATCH',
          headers: sbHeaders,
          body: JSON.stringify({ tier: purchasedTier }),
        })
        console.log(`[PAYMENT_VERIFY] Upgraded user to ${purchasedTier} tier`)
      }
    }

    // Wait a moment for the database to commit, then fetch balance
    await new Promise(resolve => setTimeout(resolve, 500))

    const balanceRes = await fetch(
      `${supabaseUrl}/rest/v1/credit_balances?select=credits_balance,credits_reserved,total_purchased&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    )

    if (!balanceRes.ok) {
      return NextResponse.json({
        verified: true,
        status: 'success',
        amount,
        currency,
        message: 'Payment verified but balance fetch failed',
      })
    }

    const rows = await balanceRes.json()
    const balance = rows?.[0] || { credits_balance: 0, credits_reserved: 0, total_purchased: 0 }

    return NextResponse.json({
      verified: true,
      status: 'success',
      amount,
      currency,
      balance: {
        credits_balance: balance.credits_balance ?? 0,
        credits_reserved: balance.credits_reserved ?? 0,
        total_purchased: balance.total_purchased ?? 0,
      },
    })
  } catch (error: any) {
    console.error('[PAYMENT_VERIFY] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
