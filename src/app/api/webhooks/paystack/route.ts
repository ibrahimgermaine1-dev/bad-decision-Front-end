/**
 * Paystack Webhook — Add credits after successful payment
 * ========================================================
 * SECURED:
 *   1. Always validates HMAC-SHA512 signature. Rejects if secret missing.
 *   2. Credit amount is computed from the VERIFIED `amount`+`currency`,
 *      NEVER from client-supplied `metadata.credits` (which can be tampered
 *      with in the browser). See `src/lib/server-pricing.ts`.
 *   3. Idempotent via `add_credits` RPC (checks `reference_id` for duplicates).
 *
 * Rate limited.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { checkWebhookRateLimit } from '@/lib/rate-limit'
import { resolveCreditGrant } from '@/lib/server-pricing'

export const dynamic = 'force-dynamic'

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.error('[PAYSTACK_WEBHOOK] PAYSTACK_SECRET_KEY not configured — rejecting webhook')
    return false
  }
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
    // Rate limit webhooks
    const rateLimitResult = checkWebhookRateLimit(req)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const headers = supabaseHeaders()
    if (!headers) {
      console.error('[PAYSTACK_WEBHOOK] Supabase not configured')
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { event, data } = body
    if (event !== 'charge.success') return NextResponse.json({ ok: true })

    const userEmail = data.customer?.email
    const amount = Number(data.amount) || 0
    const currency = String(data.currency || 'NGN')
    const reference = String(data.reference || '')

    if (!userEmail) return NextResponse.json({ error: 'No email' }, { status: 400 })
    if (!amount || amount <= 0) {
      console.error(`[PAYSTACK_WEBHOOK] Invalid amount: ${amount} (ref ${reference})`)
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    // === USER LOOKUP ===
    // Trust metadata.user_id (set by our own frontend) for identification only.
    // NEVER trust metadata.credits/plan — those are computed from verified amount below.
    const metadata = data.metadata || {}
    const metadataUserId = metadata.user_id as string | undefined
    let userId: string | null = null

    if (metadataUserId) {
      const findByIdRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=id&id=eq.${encodeURIComponent(metadataUserId)}&limit=1`,
        { headers }
      )
      if (findByIdRes.ok) {
        const profilesById = await findByIdRes.json()
        if (profilesById && profilesById.length > 0) {
          userId = profilesById[0].id
        }
      }
    }

    if (!userId) {
      // Fall back to email lookup
      const findRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=id&email=eq.${encodeURIComponent(userEmail)}&limit=1`,
        { headers }
      )
      const profiles = await findRes.json()
      if (findRes.ok && profiles && profiles.length > 0) {
        userId = profiles[0].id
      }
    }

    if (!userId) {
      console.error(`[PAYSTACK_WEBHOOK] User not found for email ${userEmail} and metadata user_id ${metadataUserId}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // === CREDIT GRANT — computed from VERIFIED amount only ===
    const grant = resolveCreditGrant(amount, currency)
    const creditsToAdd = grant.credits
    const purchasedTier = grant.tier
    const description = grant.description
    const transactionType = 'purchase'

    if (creditsToAdd <= 0) {
      console.error(`[PAYSTACK_WEBHOOK] Resolved 0 credits for amount ${amount} ${currency} (ref ${reference})`)
      return NextResponse.json({ error: 'Could not resolve credit amount' }, { status: 400 })
    }

    // === ADD CREDITS (idempotent via reference_id) ===
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/add_credits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        p_user_id: userId,
        p_amount: creditsToAdd,
        p_transaction_type: transactionType,
        p_description: description,
        p_reference_id: reference || `paystack_${Date.now()}`,
      }),
    })
    if (!rpcRes.ok) {
      const err = await rpcRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.message || 'Credit add failed' }, { status: 500 })
    }

    // === TIER UPGRADE ===
    if (purchasedTier) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ tier: purchasedTier }),
      })
    }

    console.log(`[PAYSTACK_WEBHOOK] Payment verified: ${userEmail} -> ${creditsToAdd} credits${purchasedTier ? ` (${purchasedTier})` : ''} ref=${reference} amount=${amount} ${currency}`)

    // Fire payment receipt email via backend (best-effort, never blocks the webhook response)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''
    if (backendUrl && apiSecret && currency === 'NGN') {
      try {
        // Fetch user's full name from profiles
        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?select=full_name&id=eq.${encodeURIComponent(userId)}&limit=1`,
          { headers }
        )
        let fullName = ''
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          fullName = profileData?.[0]?.full_name || ''
        }

        await fetch(`${backendUrl}/api/email/payment-receipt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Secret': apiSecret,
          },
          body: JSON.stringify({
            email: userEmail,
            full_name: fullName,
            credits: creditsToAdd,
            amount_ngn_kobo: amount,
            reference,
            description: grant.description,
          }),
        })
      } catch (emailErr) {
        console.warn('[PAYSTACK_WEBHOOK] Receipt email failed (non-blocking):', emailErr)
      }
    }

    return NextResponse.json({ ok: true, credits_added: creditsToAdd, tier: purchasedTier })
  } catch (error: any) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
