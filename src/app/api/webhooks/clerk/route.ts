/**
 * Clerk Webhook — Auto-create profile + usage_ledger on sign-up
 * SECURED: Always verifies Svix signature. Rejects if secret is missing.
 * Rate limited to prevent abuse.
 *
 * NOTE: Device fingerprint multi-account blocking has been REMOVED.
 * Multiple accounts per device are now allowed.
 */
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { checkWebhookRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Rate limit webhooks
    const rateLimitResult = checkWebhookRateLimit(req)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const svixId = req.headers.get('svix-id')
    const svixTimestamp = req.headers.get('svix-timestamp')
    const svixSignature = req.headers.get('svix-signature')
    const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET || ''

    // Always require signature verification
    if (!clerkWebhookSecret) {
      console.error('[CLERK_WEBHOOK] CLERK_WEBHOOK_SECRET not configured — rejecting webhook')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[CLERK_WEBHOOK] Missing Svix headers — rejecting webhook')
      return NextResponse.json({ error: 'Missing verification headers' }, { status: 401 })
    }

    const rawBody = await req.text()
    const wh = new Webhook(clerkWebhookSecret)

    let body: any
    try {
      body = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      console.error('[CLERK_WEBHOOK] Svix verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    return await handleClerkEvent(body)
  } catch (error: any) {
    console.error('[CLERK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleClerkEvent(body: any) {
  const { type, data } = body
  if (type !== 'user.created') return NextResponse.json({ ok: true })

  const userId = data.id
  const email = data.email_addresses?.[0]?.email_address || ''
  const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()

  // Validate all inputs before database operations
  if (!userId || typeof userId !== 'string' || userId.length > 256) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
    console.error('[CLERK_WEBHOOK] Supabase not configured')
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const headers: Record<string, string> = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }

  // Create profile (no device_fingerprint field — multi-account blocking removed)
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: userId,
      email,
      full_name: fullName.slice(0, 256),
      tier: 'free',
    }),
  })

  if (!profileRes.ok) {
    const errData = await profileRes.json().catch(() => ({}))
    if (!errData.message?.includes('duplicate') && !errData.code?.includes('23505')) {
      console.error('[CLERK_WEBHOOK] Profile creation error:', errData)
      return NextResponse.json({ error: errData.message || 'Profile creation failed' }, { status: 500 })
    }
  }

  // Create usage_ledger with 50 free coins
  const ledgerRes = await fetch(`${supabaseUrl}/rest/v1/usage_ledger`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user_id: userId,
      coins_balance: 50,
      coins_reserved: 0,
      coins_lifetime: 50,
    }),
  })

  if (!ledgerRes.ok) {
    const errData = await ledgerRes.json().catch(() => ({}))
    if (!errData.message?.includes('duplicate') && !errData.code?.includes('23505')) {
      console.error('[CLERK_WEBHOOK] Ledger creation error:', errData)
      return NextResponse.json({ error: errData.message || 'Ledger creation failed' }, { status: 500 })
    }
  }

  console.log(`[CLERK_WEBHOOK] User created: ${userId} (${email})`)
  return NextResponse.json({ ok: true, user_id: userId })
}
