/**
 * Coins API — Get balance, deduct, add
 * SECURED: All endpoints require Clerk authentication.
 * Users can only access/modify their own coin data.
 * Rate limited to prevent abuse.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function supabaseHeaders(): Record<string, string> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey || url.includes('placeholder')) return null
  return {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }
}

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

    // Require authentication
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const requestedUserId = req.nextUrl.searchParams.get('user_id')
    // Users can only query their own balance
    if (requestedUserId && requestedUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden: cannot access other user data' }, { status: 403 })
    }

    const targetUserId = requestedUserId || userId

    const headers = supabaseHeaders()
    if (!headers) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const res = await fetch(
      `${supabaseUrl}/rest/v1/usage_ledger?select=*&user_id=eq.${encodeURIComponent(targetUserId)}&limit=1`,
      { headers }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.message || 'Fetch failed' }, { status: 500 })
    }

    const rows = await res.json()
    if (!rows || rows.length === 0) {
      return NextResponse.json({ balance: { coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 } })
    }
    return NextResponse.json({ balance: rows[0] })
  } catch (error: any) {
    console.error('[/api/coins GET] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Strict rate limit for coin modifications
    const rateLimitResult = checkRateLimit(req, { maxRequests: 10, windowMs: 60000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait.' },
        { status: 429 }
      )
    }

    // Require authentication + verify ownership
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { user_id, action, amount } = body
    if (!user_id || !action || !amount) return NextResponse.json({ error: 'user_id, action, and amount required' }, { status: 400 })

    // Users can only modify their own coins
    if (user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden: cannot modify other user data' }, { status: 403 })
    }

    // VULN 6 FIX: Validate inputs strictly
    if (!['deduct', 'add'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "deduct" or "add".' }, { status: 400 })
    }
    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: 'Amount must be a positive integer.' }, { status: 400 })
    }
    if (amount > 10000) {
      return NextResponse.json({ error: 'Amount exceeds maximum allowed.' }, { status: 400 })
    }

    const headers = supabaseHeaders()
    if (!headers) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const rpcName = action === 'deduct' ? 'deduct_coins' : 'add_coins'

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ p_user_id: user_id, p_amount: amount }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 })
    }
    const data = await res.json().catch(() => null)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('[/api/coins POST] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
