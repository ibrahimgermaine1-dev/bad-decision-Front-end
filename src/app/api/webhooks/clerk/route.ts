/**
 * Clerk Webhook — Auto-create profile + usage_ledger on sign-up
 * When a new user signs up via Clerk, this webhook:
 * 1. Creates a profile row with free tier + device fingerprint
 * 2. Creates a usage_ledger row with 250 free coins
 * 3. Checks FingerprintJS hash to block duplicate devices
 */
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const FREE_COINS = 250

export async function POST(req: NextRequest) {
  // Guard: skip if Supabase env vars are missing (e.g. during build)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration incomplete' }, { status: 503 })
  }

  try {
    const { createServerClient } = await import('@/lib/supabase-client')
    const body = await req.json()
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
        // DUPLICATE DEVICE — hard block
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
      // If it's a duplicate key error (user already exists), that's ok
      if (!profileError.message.includes('duplicate')) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    // Create usage_ledger (the trigger should auto-create it, but just in case)
    const { error: ledgerError } = await supabase
      .from('usage_ledger')
      .insert({
        user_id: userId,
        coins_balance: FREE_COINS,
        coins_reserved: 0,
        coins_lifetime: FREE_COINS,
      })

    if (ledgerError) {
      console.error('[CLERK_WEBHOOK] Ledger creation error:', ledgerError)
      // Duplicate key is ok (trigger might have created it already)
      if (!ledgerError.message.includes('duplicate')) {
        return NextResponse.json({ error: ledgerError.message }, { status: 500 })
      }
    }

    console.log(`[CLERK_WEBHOOK] User created: ${userId} (${email}) — ${FREE_COINS} free coins`)
    return NextResponse.json({ ok: true, user_id: userId })

  } catch (error: any) {
    console.error('[CLERK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
