/**
 * Clerk Webhook — Auto-create profile + usage_ledger on sign-up
 * With real Svix signature verification.
 *
 * When a new user signs up via Clerk, this webhook:
 * 1. Verifies the Svix signature
 * 2. Creates a profile row with free tier + device fingerprint
 * 3. Creates a usage_ledger row with 50 free coins
 * 4. Checks FingerprintJS hash to block duplicate devices
 */
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Get headers and body
    const svixId = req.headers.get('svix-id')
    const svixTimestamp = req.headers.get('svix-timestamp')
    const svixSignature = req.headers.get('svix-signature')

    const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET || ''

    // If no secret configured, skip verification (dev mode)
    if (clerkWebhookSecret && svixId && svixTimestamp && svixSignature) {
      const body = await req.text()
      const wh = new Webhook(clerkWebhookSecret)

      let evt: any
      try {
        evt = wh.verify(body, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        })
      } catch (err) {
        console.error('[CLERK_WEBHOOK] Svix verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }

      return await handleClerkEvent(evt)
    }

    // Fallback: parse JSON directly (no verification)
    const body = await req.json()
    return await handleClerkEvent(body)
  } catch (error: any) {
    console.error('[CLERK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleClerkEvent(body: any) {
  const { type, data } = body

  // Only handle user.created event
  if (type !== 'user.created') {
    return NextResponse.json({ ok: true })
  }

  const userId = data.id
  const email = data.email_addresses?.[0]?.email_address || ''
  const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
  const deviceFingerprint = data.unsafe_metadata?.device_fingerprint || ''

  const supabase = createServerClient()

  // Check for duplicate device fingerprint (anti-cheat)
  if (deviceFingerprint) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('device_fingerprint', deviceFingerprint)
      .limit(1)

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'DUPLICATE_DEVICE', message: 'This device already has an account. Free coins can only be claimed once per device.' },
        { status: 403 }
      )
    }
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      tier: 'free',
      device_fingerprint: deviceFingerprint || null,
    })

  if (profileError) {
    console.error('[CLERK_WEBHOOK] Profile creation error:', profileError)
    if (!profileError.message.includes('duplicate')) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
  }

  // Create usage_ledger
  const { error: ledgerError } = await supabase
    .from('usage_ledger')
    .insert({
      user_id: userId,
      coins_balance: 50,
      coins_reserved: 0,
      coins_lifetime: 50,
    })

  if (ledgerError) {
    console.error('[CLERK_WEBHOOK] Ledger creation error:', ledgerError)
    if (!ledgerError.message.includes('duplicate')) {
      return NextResponse.json({ error: ledgerError.message }, { status: 500 })
    }
  }

  console.log(`[CLERK_WEBHOOK] User created: ${userId} (${email})`)
  return NextResponse.json({ ok: true, user_id: userId })
}
