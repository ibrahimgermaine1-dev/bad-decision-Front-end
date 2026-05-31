/**
 * Clerk Webhook — Auto-create profile + usage_ledger on sign-up
 * When a new user signs up via Clerk, this webhook:
 * 1. Creates a profile row with free tier + device fingerprint
 * 2. Creates a usage_ledger row with 50 free coins
 * 3. Checks FingerprintJS hash to block duplicate devices
 *
 * NOTE: Clerk integration is Phase 2. This webhook is ready
 * but not active until Clerk is properly connected.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
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

  } catch (error: any) {
    console.error('[CLERK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
