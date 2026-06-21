/**
 * Backend Proxy: POST /api/backend/subscriptions/create
 * Initializes a Paystack recurring subscription for the authenticated user.
 * Returns an authorization_url the user must visit to authorize billing.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = checkRateLimit(req, { maxRequests: 5, windowMs: 60000 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const tier = body?.tier
    if (!tier || !['starter', 'growth', 'pro'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) {
      return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    const res = await fetch(`${backendUrl}/api/subscriptions/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, tier }),
    })

    const responseText = await res.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { error: responseText.slice(0, 500) || `Backend error (${res.status})` }
    }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[PROXY /subscriptions/create] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
