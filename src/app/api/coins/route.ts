/**
 * Coins API — Get balance, deduct, add
 * Server-side route that uses Supabase service role key
 *
 * TABLE: coin_balances (NOT usage_ledger!)
 * COLUMNS: balance (not coins_balance), total_purchased (not coins_lifetime)
 */
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-client'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('coin_balances')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no row found, return default free trial balance
    if (error.code === 'PGRST116') {
      return NextResponse.json({
        balance: {
          user_id: userId,
          coins_balance: 50,
          coins_reserved: 0,
          coins_lifetime: 50,
        }
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map database column names to what the frontend expects
  const mapped = {
    user_id: data.user_id,
    coins_balance: data.balance,           // DB: balance → Frontend: coins_balance
    coins_reserved: data.coins_reserved,
    coins_lifetime: data.total_purchased,  // DB: total_purchased → Frontend: coins_lifetime
  }

  return NextResponse.json({ balance: mapped })
}

export async function POST(req: NextRequest) {
  const { user_id, action, amount } = await req.json()

  if (!user_id || !action || !amount) {
    return NextResponse.json({ error: 'user_id, action, and amount required' }, { status: 400 })
  }

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
