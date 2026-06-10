/**
 * Paystack Webhook — Add coins after successful payment
 * Uses Supabase REST API via fetch instead of SDK.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

export const dynamic = 'force-dynamic'

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return true
  const hash = createHmac('sha512', secret).update(payload).digest('hex')
  return hash === signature
}

function supabaseHeaders(): Record<string, string> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey || url.includes('placeholder')) return null
  return {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }
}

export async function POST(req: NextRequest) {
  try {
    const headers = supabaseHeaders()
    if (!headers) {
      console.error('[PAYSTACK_WEBHOOK] Supabase not configured')
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''
    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { event, data } = body
    if (event !== 'charge.success') return NextResponse.json({ ok: true })

    const userEmail = data.customer?.email
    const amount = data.amount
    const currency = data.currency || 'NGN'
    if (!userEmail) return NextResponse.json({ error: 'No email' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    // Find user by email
    const findRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=id,tier&email=eq.${encodeURIComponent(userEmail)}&limit=1`,
      { headers }
    )
    const profiles = await findRes.json()
    if (!findRes.ok || !profiles || profiles.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = profiles[0].id
    let purchasedTier: string | null = null
    let coinsToAdd = 0

    if (currency === 'NGN') {
      const ngn = amount / 100
      if (ngn >= 28000) { purchasedTier = 'pro'; coinsToAdd = 5000 }
      else if (ngn >= 20000) { purchasedTier = 'growth'; coinsToAdd = 3000 }
      else if (ngn >= 12000) { purchasedTier = 'starter'; coinsToAdd = 1500 }
      else if (ngn >= 4000) coinsToAdd = 500
      else coinsToAdd = Math.round(ngn / 8)
    } else {
      const usd = amount / 100
      if (usd >= 35) { purchasedTier = 'pro'; coinsToAdd = 5000 }
      else if (usd >= 25) { purchasedTier = 'growth'; coinsToAdd = 3000 }
      else if (usd >= 15) { purchasedTier = 'starter'; coinsToAdd = 1500 }
      else if (usd >= 5) coinsToAdd = 500
      else coinsToAdd = Math.round(usd * 100)
    }

    // Add coins via RPC
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/add_coins`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_user_id: userId, p_amount: coinsToAdd }),
    })
    if (!rpcRes.ok) {
      const err = await rpcRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.message || 'Coin add failed' }, { status: 500 })
    }

    // Upgrade tier
    if (purchasedTier) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ tier: purchasedTier }),
      })
    }

    console.log(`[PAYSTACK_WEBHOOK] Payment: ${userEmail} -> ${coinsToAdd} coins${purchasedTier ? ` (${purchasedTier})` : ''}`)
    return NextResponse.json({ ok: true, coins_added: coinsToAdd, tier: purchasedTier })
  } catch (error: any) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
