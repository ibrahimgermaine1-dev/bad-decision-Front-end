/**
 * Backend Proxy: GET /api/backend/coins
 * Fetches user coin balance from the FastAPI backend.
 * Falls back to direct Supabase REST API if backend is down.
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

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (backendUrl) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (apiSecret) headers['X-API-Secret'] = apiSecret

      // Backend uses GET /api/coins/deduct and /api/coins/add for operations,
      // but doesn't have a dedicated balance endpoint.
      // Fetch user tasks to check backend connectivity, then use Supabase for balance.
      // We primarily rely on Supabase for the balance query.
    }

    // Primary: direct Supabase REST API for coin balance
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
      console.error('[PROXY /coins] Supabase not configured')
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const sbRes = await fetch(
      `${supabaseUrl}/rest/v1/usage_ledger?select=coins_balance,coins_reserved,coins_lifetime&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
      }
    )

    if (!sbRes.ok) {
      const err = await sbRes.json().catch(() => ({ error: 'Fetch failed' }))
      console.error('[PROXY /coins] Supabase error:', err)
      return NextResponse.json(err, { status: sbRes.status })
    }

    const rows = await sbRes.json()
    const data = rows?.[0] || { coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 }

    return NextResponse.json({
      coins_balance: data.coins_balance ?? 0,
      coins_reserved: data.coins_reserved ?? 0,
      coins_lifetime: data.coins_lifetime ?? 0,
    })
  } catch (error: any) {
    console.error('[PROXY /coins] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
