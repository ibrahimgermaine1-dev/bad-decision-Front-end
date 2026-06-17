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

    const { reference } = await req.json()
    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    // Validate reference format (Paystack references are typically alphanumeric + hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(reference)) {
      return NextResponse.json({ error: 'Invalid reference format' }, { status: 400 })
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY
    if (!secretKey) {
      console.error('[PAYMENT_VERIFY] PAYSTACK_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Payment verification not configured' }, { status: 503 })
    }

    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
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

    // Wait a moment for webhook to process, then fetch balance
    // The webhook handles credit addition — this endpoint just confirms
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Fetch updated balance from Supabase
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
