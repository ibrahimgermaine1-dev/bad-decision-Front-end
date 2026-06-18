/**
 * Backend Proxy: GET /api/backend/credits
 * Fetches user credit balance from Supabase (credit_balances table).
 * FALLBACK: If the user has no credit_balances row (Clerk webhook may have
 * failed), auto-creates one with 50 free credits. This ensures users always
 * get their signup bonus even if the webhook didn't fire.
 * Rate limited.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
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

    const sbHeaders = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    }

    // 1. Check if user has a credit_balances row
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

    // 2. FALLBACK: If no row exists, the Clerk webhook didn't fire.
    // Auto-create the profile + credit_balances + 50 free credits.
    if (!rows || rows.length === 0) {
      console.log('[PROXY /credits] No credit_balances row for user — auto-creating with 50 free credits')

      // Get user email from Clerk (server-side, safe)
      const { currentUser } = await import('@clerk/nextjs/server')
      const user = await currentUser()
      const email = user?.emailAddresses?.[0]?.emailAddress || ''
      const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

      // Call handle_new_user RPC (idempotent — creates profile + credit_balances + credit_transactions)
      const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/handle_new_user`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_clerk_id: userId,
          p_email: email,
          p_full_name: fullName,
          p_country: 'US',
        }),
      })

      if (rpcRes.ok) {
        console.log('[PROXY /credits] Auto-created user with 50 free credits via handle_new_user RPC')
        // Re-fetch the balance to return the ACTUAL database value
        const verifyRes = await fetch(
          `${supabaseUrl}/rest/v1/credit_balances?select=credits_balance,credits_reserved,total_purchased&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
          { headers: sbHeaders }
        )
        if (verifyRes.ok) {
          const verifyRows = await verifyRes.json()
          if (verifyRows && verifyRows.length > 0) {
            const v = verifyRows[0]
            return NextResponse.json({
              credits_balance: v.credits_balance ?? 0,
              credits_reserved: v.credits_reserved ?? 0,
              total_purchased: v.total_purchased ?? 0,
            })
          }
        }
        // If re-fetch fails, return 50 (the RPC should have set it)
        return NextResponse.json({
          credits_balance: 50,
          credits_reserved: 0,
          total_purchased: 50,
        })
      } else {
        const err = await rpcRes.json().catch(() => ({}))
        console.error('[PROXY /credits] handle_new_user RPC failed:', err)
        // RPC failed — return 0 (do NOT fake 50 credits)
        return NextResponse.json({
          credits_balance: 0,
          credits_reserved: 0,
          total_purchased: 0,
        })
      }
    }

    // 3. Return the existing balance
    const data = rows[0]
    return NextResponse.json({
      credits_balance: data.credits_balance ?? 0,
      credits_reserved: data.credits_reserved ?? 0,
      total_purchased: data.total_purchased ?? 0,
    })
  } catch (error: any) {
    console.error('[PROXY /credits] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
