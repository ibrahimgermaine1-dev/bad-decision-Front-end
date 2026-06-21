/**
 * Backend Proxy: GET /api/backend/credits
 * Fetches user credit balance from Supabase (credit_balances table).
 * FALLBACK: If the user has no credit_balances row (Clerk webhook may have
 * failed), auto-creates one with 100 free credits using direct Supabase
 * inserts (more reliable than the RPC which can fail on email constraints).
 * Rate limited. Secure: uses service role key server-side only.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Rate limit
    const rateLimitResult = checkRateLimit(req, { maxRequests: 30, windowMs: 60000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait.' },
        { status: 429 }
      )
    }

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      console.error('[PROXY /credits] Supabase not configured')
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const sbHeaders: Record<string, string> = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    }

    // 1. Call renew_free_credits RPC to check expiry + renew if needed
    await fetch(`${supabaseUrl}/rest/v1/rpc/renew_free_credits`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_user_id: userId }),
    })

    // 2. Check if user has a credit_balances row
    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/credit_balances?select=credits_balance,credits_reserved,total_purchased&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      { headers: sbHeaders }
    )

    if (!sbRes.ok) {
      const err = await sbRes.json().catch(() => ({ error: 'Fetch failed' }))
      console.error('[PROXY /credits] Supabase error:', err)
      return NextResponse.json(err, { status: sbRes.status })
    }

    const rows = await sbRes.json()

    // 2. If row exists, return the actual balance
    if (rows && rows.length > 0) {
      const data = rows[0]
      return NextResponse.json({
        credits_balance: data.credits_balance ?? 0,
        credits_reserved: data.credits_reserved ?? 0,
        total_purchased: data.total_purchased ?? 0,
      })
    }

    // 3. FALLBACK: No credit_balances row exists. The Clerk webhook may have
    //    failed or been delayed. Use the handle_new_user RPC (the same one
    //    the Clerk webhook uses) with the user's REAL email from Clerk —
    //    never a fake placeholder email, because that would break future
    //    Paystack receipts, Resend transactional emails, and forgot-password
    //    flows. If we can't get a real email, return 0 credits with a warning.
    console.log(`[PROXY /credits] No credit_balances row for user ${userId} — invoking handle_new_user RPC with real Clerk email`)

    const user = await currentUser()
    const realEmail = user?.emailAddresses?.[0]?.emailAddress || ''
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

    if (!realEmail) {
      // Extremely rare — Clerk user with no email address. Don't fabricate
      // a profile; ask the user to contact support.
      console.error(`[PROXY /credits] No email on Clerk user ${userId} — cannot auto-create profile`)
      return NextResponse.json({
        credits_balance: 0,
        credits_reserved: 0,
        total_purchased: 0,
      })
    }

    // Call handle_new_user RPC (idempotent — ON CONFLICT DO NOTHING).
    // This creates profile + credit_balances + credit_transactions atomically.
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/handle_new_user`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_clerk_id: userId,
        p_email: realEmail,
        p_full_name: fullName.slice(0, 256),
        p_country: 'US',
      }),
    })

    if (!rpcRes.ok) {
      const err = await rpcRes.json().catch(() => ({}))
      console.error('[PROXY /credits] handle_new_user RPC failed:', err)
    }

    // Step D: Re-fetch the balance to return the ACTUAL database value
    const verifyRes = await fetch(
      `${supabaseUrl}/rest/v1/credit_balances?select=credits_balance,credits_reserved,total_purchased&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      { headers: sbHeaders }
    )

    if (verifyRes.ok) {
      const verifyRows = await verifyRes.json()
      if (verifyRows && verifyRows.length > 0) {
        const v = verifyRows[0]
        console.log(`[PROXY /credits] Auto-create successful. Balance: ${v.credits_balance}`)
        return NextResponse.json({
          credits_balance: v.credits_balance ?? 0,
          credits_reserved: v.credits_reserved ?? 0,
          total_purchased: v.total_purchased ?? 0,
        })
      }
    }

    // If all else fails, return 0 (honest — don't fake credits)
    console.error('[PROXY /credits] Auto-create failed — returning 0 balance')
    return NextResponse.json({
      credits_balance: 0,
      credits_reserved: 0,
      total_purchased: 0,
    })
  } catch (error: any) {
    console.error('[PROXY /credits] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
