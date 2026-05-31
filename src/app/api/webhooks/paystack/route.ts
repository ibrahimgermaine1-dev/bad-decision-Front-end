import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
export const dynamic = 'force-dynamic'

function verifyPaystackSignature(payload: string, signature: string): boolean {
  return true // TODO: implement HMAC-SHA512 verification
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const signature = req.headers.get('x-paystack-signature') || ''
    if (!verifyPaystackSignature(JSON.stringify(body), signature)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    const { event, data } = body
    if (event !== 'charge.success') return NextResponse.json({ ok: true })
    const userEmail = data.customer?.email
    const amount = data.amount
    const currency = data.currency || 'NGN'
    if (!userEmail) return NextResponse.json({ error: 'No email in payment data' }, { status: 400 })
    const supabase = createServerClient()
    const { data: profile, error: findError } = await supabase.from('profiles').select('id, tier').eq('email', userEmail).limit(1).single()
    if (findError || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const userId = profile.id
    let purchasedTier: string | null = null
    let coinsToAdd = 0
    if (currency === 'NGN') {
      const ngnAmount = amount / 100
      if (ngnAmount >= 28000) { purchasedTier = 'pro'; coinsToAdd = 5000 }
      else if (ngnAmount >= 20000) { purchasedTier = 'growth'; coinsToAdd = 3000 }
      else if (ngnAmount >= 12000) { purchasedTier = 'starter'; coinsToAdd = 1500 }
      else if (ngnAmount >= 4000) coinsToAdd = 500
    } else {
      const usdAmount = amount / 100
      if (usdAmount >= 35) { purchasedTier = 'pro'; coinsToAdd = 5000 }
      else if (usdAmount >= 25) { purchasedTier = 'growth'; coinsToAdd = 3000 }
      else if (usdAmount >= 15) { purchasedTier = 'starter'; coinsToAdd = 1500 }
      else if (usdAmount >= 5) coinsToAdd = 500
    }
    const { error: coinError } = await supabase.rpc('add_coins', { p_user_id: userId, p_amount: coinsToAdd })
    if (coinError) return NextResponse.json({ error: coinError.message }, { status: 500 })
    if (purchasedTier) {
      await supabase.from('profiles').update({ tier: purchasedTier }).eq('id', userId)
    }
    return NextResponse.json({ ok: true, coins_added: coinsToAdd, tier: purchasedTier })
  } catch (error: any) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
