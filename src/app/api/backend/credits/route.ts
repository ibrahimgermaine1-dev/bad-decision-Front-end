/**
 * Backend Proxy: GET /api/backend/credits
 * Fetches user credit balance from Supabase (credit_balances table).
 * FALLBACK: If the user has no credit_balances row (Clerk webhook may have
 * failed), auto-creates one with 50 free credits using direct Supabase
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

    // 3. FALLBACK: No credit_balances row exists. Auto-create profile +
    //    credit_balances + credit_transactions with 50 free credits.
    //    Use DIRECT Supabase inserts (not the RPC) for better error handling.
    console.log(`[PROXY /credits] No credit_balances row for user ${userId} — auto-creating with 50 free credits`)

    // Get user info from Clerk (server-side, safe — not exposed to browser)
    const user = await currentUser()
    const realEmail = user?.emailAddresses?.[0]?.emailAddress || ''
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

    // Use a unique email if real email is empty (avoids UNIQUE constraint conflict)
    const emailToUse = realEmail || `${userId}@clerk.placeholder`

    // Step A: Insert profile (ON CONFLICT DO NOTHING — idempotent)
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
      body: JSON.stringify({
        id: userId,
        email: emailToUse,
        full_name: fullName,
        tier: 'free',
        country: 'US',
      }),
    })

    if (!profileRes.ok && profileRes.status !== 409) {
      // 409 = conflict (row already exists) — that's OK
      // If email conflicts with another user, try the placeholder email
      if (realEmail) {
        console.log(`[PROXY /credits] Profile insert with real email failed, trying placeholder email`)
        const profileRes2 = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: { ...sbHeaders, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
          body: JSON.stringify({
            id: userId,
            email: `${userId}@clerk.placeholder`,
            full_name: fullName,
            tier: 'free',
            country: 'US',
          }),
        })
        if (!profileRes2.ok && profileRes2.status !== 409) {
          const err2 = await profileRes2.json().catch(() => ({}))
          console.error('[PROXY /credits] Profile insert failed:', err2)
        }
      } else {
        const err = await profileRes.json().catch(() => ({}))
        console.error('[PROXY /credits] Profile insert failed:', err)
      }
    }

    // Step B: Insert credit_balances with 50 credits (ON CONFLICT DO NOTHING)
    const balanceRes = await fetch(`${supabaseUrl}/rest/v1/credit_balances`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
      body: JSON.stringify({
        user_id: userId,
        credits_balance: 50,
        credits_reserved: 0,
        total_purchased: 50,
      }),
    })

    if (!balanceRes.ok && balanceRes.status !== 409) {
      const err = await balanceRes.json().catch(() => ({}))
      console.error('[PROXY /credits] credit_balances insert failed:', err)
    }

    // Step C: Insert credit_transactions for the signup bonus (idempotent)
    const txRes = await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Content-Type': 'application/json', 'Prefer': 'resolution=ignore-duplicates' },
      body: JSON.stringify({
        user_id: userId,
        amount: 50,
        transaction_type: 'signup_bonus',
        description: '50 free credits for signing up',
        reference_id: `signup_${userId}`,
      }),
    })

    if (!txRes.ok && txRes.status !== 409) {
      const err = await txRes.json().catch(() => ({}))
      console.error('[PROXY /credits] credit_transactions insert failed:', err)
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
