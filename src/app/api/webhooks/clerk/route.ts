/**
 * Clerk Webhook — Auto-create profile + usage_ledger on sign-up
 *
 * When a new user signs up via Clerk, this webhook:
 * 1. Verifies the Svix signature (security check)
 * 2. Creates a profile row with free tier
 * 3. Creates a usage_ledger row with 50 free coins
 *
 * IMPORTANT: Clerk user IDs (like "user_3EpAbGzlWhXf8l8H1clTpAxaDY0")
 * are TEXT, not UUIDs. The profiles.id and usage_ledger.user_id columns
 * must be TEXT type (not UUID) for this to work.
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

    const userId = data.id  // This is a Clerk ID like "user_3EpAbGzlWhXf8l8H1clTpAxaDY0"
    const email = data.email_addresses?.[0]?.email_address || ''
    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim()

    console.log(`[CLERK_WEBHOOK] User created: ${userId} (${email})`)

    const supabase = createServerClient()

    // ============================================================
    // STEP 3: Create profile row (id is TEXT — Clerk IDs work directly)
    // ============================================================
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,  // TEXT column — "user_xxx" works fine
        email,
        full_name: fullName,
        tier: 'free',
      })

    if (profileError) {
      console.error('[CLERK_WEBHOOK] Profile creation error:', profileError)
      // If it's a duplicate key error (user already exists), that's ok
      if (!profileError.message.includes('duplicate') && !profileError.message.includes('unique')) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    // ============================================================
    // STEP 4: Create usage_ledger with 50 free coins
    // ============================================================
    const { error: ledgerError } = await supabase
      .from('usage_ledger')
      .insert({
        user_id: userId,  // TEXT column — "user_xxx" works fine
        coins_balance: 50,
        coins_reserved: 0,
        coins_lifetime: 50,
      })

    if (ledgerError) {
      console.error('[CLERK_WEBHOOK] Ledger creation error:', ledgerError)
      // Duplicate key is ok (might already exist from backend fallback)
      if (!ledgerError.message.includes('duplicate') && !ledgerError.message.includes('unique')) {
        return NextResponse.json({ error: ledgerError.message }, { status: 500 })
      }
    }

    console.log(`[CLERK_WEBHOOK] Successfully set up user: ${userId} with 50 free coins`)
    return NextResponse.json({ ok: true, user_id: userId })

  } catch (error: any) {
    console.error('[CLERK_WEBHOOK] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
