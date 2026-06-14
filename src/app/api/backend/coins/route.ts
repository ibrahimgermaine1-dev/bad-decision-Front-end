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

    if (!backendUrl) {
      return NextResponse.json({ error: 'BACKEND_URL not configured' }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    // Try the backend's coins balance endpoint
    let res = await fetch(`${backendUrl}/api/coins/balance?user_id=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers,
    })

    if (!res.ok) {
      // Fallback: try /api/profile/coins
      res = await fetch(`${backendUrl}/api/profile/coins?user_id=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers,
      })
    }

    if (!res.ok) {
      // Final fallback: direct Supabase REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
        console.error('[PROXY /coins] Backend unreachable and Supabase not configured')
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
        return NextResponse.json(err, { status: sbRes.status })
      }

      const rows = await sbRes.json()
      const data = rows?.[0] || { coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 }
      return NextResponse.json(data)
    }

    const data = await res.json()
    const normalized = data.balance || data

    return NextResponse.json({
      coins_balance: normalized.coins_balance ?? 0,
      coins_reserved: normalized.coins_reserved ?? 0,
      coins_lifetime: normalized.coins_lifetime ?? 0,
    })
  } catch (error: any) {
    console.error('[PROXY /coins] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
