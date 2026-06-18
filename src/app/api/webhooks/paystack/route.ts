/**
 * Paystack Webhook — Add credits after successful payment
 * SECURED: Always validates signature. Rejects if secret is missing.
 * Rate limited. Idempotent via add_credits RPC (checks reference_id for duplicates).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { checkWebhookRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// In-memory set of recently processed references to prevent duplicate processing
const processedReferences = new Set<string>()

// Clean up old references every 10 minutes
setInterval(() => {
  if (processedReferences.size > 10000) {
    processedReferences.clear()
  }
}, 600000)

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

    // Always verify signature, reject if invalid or secret missing
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
    const amount = data.amount
    const currency = data.currency || 'NGN'
    const reference = data.reference || ''
    if (!userEmail) return NextResponse.json({ error: 'No email' }, { status: 400 })

    // IDEMPOTENCY: Skip if this reference was already processed
    if (reference && processedReferences.has(reference)) {
      console.log(`[PAYSTACK_WEBHOOK] Duplicate reference skipped: ${reference}`)
      return NextResponse.json({ ok: true, duplicate: true })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

    // Find user — try metadata user_id first, then fall back to email lookup
    const metadata = data.metadata || {}
    const metadataUserId = metadata.user_id as string | undefined
    let userId: string | null = null
    let userTier: string = 'free'

    if (metadataUserId) {
      // Look up by Clerk user_id (most reliable — matches the authenticated user)
      const findByIdRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=id,tier&id=eq.${encodeURIComponent(metadataUserId)}&limit=1`,
        { headers }
      )
      if (findByIdRes.ok) {
        const profilesById = await findByIdRes.json()
        if (profilesById && profilesById.length > 0) {
          userId = profilesById[0].id
          userTier = profilesById[0].tier || 'free'
        }
      }
    }

    if (!userId) {
      // Fall back to email lookup
      const findRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=id,tier&email=eq.${encodeURIComponent(userEmail)}&limit=1`,
        { headers }
      )
      const profiles = await findRes.json()
      if (findRes.ok && profiles && profiles.length > 0) {
        userId = profiles[0].id
        userTier = profiles[0].tier || 'free'
      }
    }

    if (!userId) {
      console.error(`[PAYSTACK_WEBHOOK] User not found for email ${userEmail} and metadata user_id ${metadataUserId}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    let purchasedTier: string | null = null
    let creditsToAdd = 0
    let transactionType = 'purchase'
    let description = 'Credit purchase'

    // Check metadata to determine if this is a credit top-up or a tier upgrade
    // The dashboard sends type: 'credit_addon' for credit top-ups
    // The pricing page sends plan: tier_id for tier upgrades
    const metadata = data.metadata || {}
    const isCreditAddon = metadata.type === 'credit_addon'
    const metadataPlan = metadata.plan as string | undefined
    const metadataCredits = metadata.credits as number | undefined

    if (isCreditAddon) {
      // Credit top-up — use the credits amount from metadata (trusted because
      // the frontend sets it based on the selected addon package)
      creditsToAdd = metadataCredits || 0
      description = `${creditsToAdd} credit top-up`
      // No tier change for credit top-ups
    } else if (metadataPlan) {
      // Tier upgrade — use the plan from metadata
      purchasedTier = metadataPlan
      const tierCredits: Record<string, number> = {
        starter: 1500,
        growth: 3000,
        pro: 5000,
      }
      creditsToAdd = metadataCredits || tierCredits[metadataPlan] || 0
      description = `${metadataPlan.charAt(0).toUpperCase() + metadataPlan.slice(1)} tier upgrade - ${creditsToAdd} credits`
    } else {
      // Fallback: no metadata — use amount-based mapping (for manual payments
      // or payments made outside the app)
      if (currency === 'NGN') {
        const ngn = amount / 100
        if (ngn >= 28000) { purchasedTier = 'pro'; creditsToAdd = 5000; description = 'Pro tier upgrade - 5000 credits' }
        else if (ngn >= 20000) { purchasedTier = 'growth'; creditsToAdd = 3000; description = 'Growth tier upgrade - 3000 credits' }
        else if (ngn >= 12000) { purchasedTier = 'starter'; creditsToAdd = 1500; description = 'Starter tier upgrade - 1500 credits' }
        else if (ngn >= 4000) { creditsToAdd = 500; description = '500 credit top-up' }
        else creditsToAdd = Math.round(ngn / 8)
      } else {
        const usd = amount / 100
        if (usd >= 35) { purchasedTier = 'pro'; creditsToAdd = 5000; description = 'Pro tier upgrade - 5000 credits' }
        else if (usd >= 25) { purchasedTier = 'growth'; creditsToAdd = 3000; description = 'Growth tier upgrade - 3000 credits' }
        else if (usd >= 15) { purchasedTier = 'starter'; creditsToAdd = 1500; description = 'Starter tier upgrade - 1500 credits' }
        else if (usd >= 5) { creditsToAdd = 500; description = '500 credit top-up' }
        else creditsToAdd = Math.round(usd * 100)
      }
    }

    // Add credits via add_credits RPC (IDEMPOTENT — checks reference_id for duplicates)
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

    // Upgrade tier
    if (purchasedTier) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ tier: purchasedTier }),
      })
    }

    // Mark reference as processed (in-memory cache for fast dedup;
    // the real idempotency is in the add_credits RPC via reference_id)
    if (reference) {
      processedReferences.add(reference)
    }

    console.log(`[PAYSTACK_WEBHOOK] Payment verified: ${userEmail} -> ${creditsToAdd} credits${purchasedTier ? ` (${purchasedTier})` : ''} ref=${reference}`)
    return NextResponse.json({ ok: true, credits_added: creditsToAdd, tier: purchasedTier })
  } catch (error: any) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
