/**
 * Coins API — Get balance, deduct, add
 * Server-side route that uses Supabase service role key
 */
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Guard: skip if Supabase env vars are missing (e.g. during build)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration incomplete' }, { status: 503 })
  }

  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const { createServerClient } = await import('@/lib/supabase-client')
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('usage_ledger')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ balance: data })
}

export async function POST(req: NextRequest) {
  // Guard: skip if Supabase env vars are missing (e.g. during build)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration incomplete' }, { status: 503 })
  }

  const { user_id, action, amount } = await req.json()

  if (!user_id || !action || !amount) {
    return NextResponse.json({ error: 'user_id, action, and amount required' }, { status: 400 })
  }

  const { createServerClient } = await import('@/lib/supabase-client')
  const supabase = createServerClient()

  if (action === 'deduct') {
    const { data, error } = await supabase.rpc('deduct_coins', {
      p_user_id: user_id,
      p_amount: amount,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  if (action === 'add') {
    const { data, error } = await supabase.rpc('add_coins', {
      p_user_id: user_id,
      p_amount: amount,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  return NextResponse.json({ error: 'Invalid action. Use "deduct" or "add".' }, { status: 400 })
}
