/**
 * Paystack Payment Verification — Server-side
 * ============================================
 * Flow:
 * 1. Client completes Paystack popup → gets reference
 * 2. Client calls this endpoint with the reference
 * 3. We verify with Paystack's /verify endpoint
 * 4. If verified, compute credits from the VERIFIED amount (never from
 *    client-supplied metadata — see src/lib/server-pricing.ts), add via
 *    add_credits RPC (idempotent), and return the confirmed balance.
 *
 * SECURITY: This endpoint and the Paystack webhook both compute credits
 * from the same trusted source (server-pricing.ts). Client-supplied
 * metadata is used ONLY for user identification (metadata.user_id).
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { resolveCreditGrant } from '@/lib/server-pricing'

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

    // === CREDIT GRANT — computed from VERIFIED amount only ===
    // SECURITY: We deliberately IGNORE metadata.credits and metadata.plan.
    // Those fields are set by the browser and can be tampered with. The
    // verified amount/currency from Paystack is the only trusted input.
    // See `src/lib/server-pricing.ts` for the canonical pricing table.
    const metadata = verifyData.data.metadata || {}
    const metadataUserId = metadata.user_id as string | undefined

    // Use the authenticated userId (most reliable) or fall back to metadata
    const effectiveUserId = userId || metadataUserId

    const grant = resolveCreditGrant(amount, currency)
    const creditsToAdd = grant.credits
    const purchasedTier = grant.tier
    const description = grant.description

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
