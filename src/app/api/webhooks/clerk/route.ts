/**
 * Clerk Webhook — Auto-create profile + usage_ledger on sign-up
 *
 * When a new user signs up via Clerk, this webhook:
 * 1. Verifies the Svix signature (security check)
 * 2. Creates a profile row with free tier + device fingerprint
 * 3. Creates a usage_ledger row with 50 free coins
 * 4. Checks FingerprintJS hash to block duplicate devices
 *
 * Security: Clerk signs webhooks using Svix.
 * We MUST verify the signature before processing.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-client'
import { Webhook } from 'svix'

export async function POST(req: NextRequest) {
  try {
    // ============================================================
    // STEP 1: Verify Clerk/Svix signature
    // ============================================================
    const svixId = req.headers.get('svix-id')
    const svixTimestamp = req.headers.get('svix-timestamp')
    const svixSignature = req.headers.get('svix-signature')
    const clerkWebhookSecret = process.env.CLERK_WEBHOOK_SECRET

    if (!clerkWebhookSecret) {
      console.error('[CLERK_WEBHOOK] Missing CLERK_WEBHOOK_SECRET env var')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[CLERK_WEBHOOK] Missing Svix headers')
      return NextResponse.json({ error: 'Missing verification headers' }, { status: 401 })
    }

    // Read raw body for verification
    const rawBody = await req.text()

    // Verify with Svix
    const wh = new Webhook(clerkWebhookSecret)
    let body: any
    try {
      body = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      console.error('[CLERK_WEBHOOK] Invalid signature:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // ============================================================
    // STEP 2: Only handle user.created event
    // ============================================================
    const { type, data } = body

    if (type !== 'user.created') {
      return NextResponse.json({ ok: true })
    }

    const userId = data.id
    const email = data.email_addresses?.[0]?.email_address || ''
    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()
    const deviceFingerprint = data.unsafe_metadata?.device_fingerprint || ''

    const supabase = createServerClient()

    // ============================================================
    // STEP 3: Check for duplicate device fingerprint (anti-cheat)
    // ============================================================
    if (deviceFingerprint) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('device_fingerprint', deviceFingerprint)
        .limit(1)

      if (existingUser && existingUser.length > 0) {
        // DUPLICATE DEVICE — hard block
        return NextResponse.json(
          { error: 'DUPLICATE_DEVICE', message: 'This device already has an account. Free coins can only be claimed once per device.' },
          { status: 403 }
        )
      }
    }

    // ============================================================
    // STEP 4: Create profile row
    // ============================================================
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
      // If it's a duplicate key error (user already exists), that's ok
      if (!profileError.message.includes('duplicate') && !profileError.message.includes('unique')) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    // ============================================================
    // STEP 5: Create usage_ledger with 50 free coins
    // ============================================================
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
      // Duplicate key is ok (trigger might have created it already)
      if (!ledgerError.message.includes('duplicate') && !ledgerError.message.includes('unique')) {
        return NextResponse.json({ error: ledgerError.message }, { status: 500 })
      }
    }

    console.log(`[CLERK_WEBHOOK] User created: ${userId} (${email})`)
    return NextResponse.json({ ok: true, user_id: userId })

  } catch (error: any) {
    console.error('[CLERK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
