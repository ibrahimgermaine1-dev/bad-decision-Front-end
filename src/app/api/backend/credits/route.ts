/**
 * Backend Proxy: GET /api/backend/credits
 * Fetches user credit balance from Supabase (credit_balances table).
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

    // Direct Supabase REST API for credit balance
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      console.error('[PROXY /credits] Supabase not configured')
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/credit_balances?select=credits_balance,credits_reserved,total_purchased&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    )

    if (!sbRes.ok) {
      const err = await sbRes.json().catch(() => ({ error: 'Fetch failed' }))
      console.error('[PROXY /credits] Supabase error:', err)
      return NextResponse.json(err, { status: sbRes.status })
    }

    const rows = await sbRes.json()
    const data = rows?.[0] || { credits_balance: 0, credits_reserved: 0, total_purchased: 0 }

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
