import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ============================================================
// GET /api/coins?clerk_id=xxx
// Returns coin balance and transaction history
// Uses SCHEMA: profiles, coin_balances, coin_transactions
// Maps DB column names to frontend CoinBalance fields
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerk_id");

    if (!clerkId) {
      return NextResponse.json({ error: "clerk_id is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({
        ledger: { coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 },
        plan: "free",
        transactions: [
          { id: "1", amount: 50, transaction_type: "signup_bonus", description: "Free 50 coins on account creation", created_at: new Date().toISOString() },
        ],
      });
    }

    // Get user
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, tier")
      .eq("clerk_id", clerkId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get coin balance (DB uses balance/total_purchased, frontend uses coins_balance/coins_lifetime)
    const { data: coinBalance } = await supabaseAdmin
      .from("coin_balances")
      .select("balance, coins_reserved, total_purchased, updated_at")
      .eq("user_id", profile.id)
      .single();

    // Get recent transactions
    const { data: transactions } = await supabaseAdmin
      .from("coin_transactions")
      .select("id, amount, transaction_type, description, reference_id, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Map DB field names to frontend CoinBalance fields
    const mappedLedger = coinBalance
      ? {
          coins_balance: coinBalance.balance,
          coins_reserved: coinBalance.coins_reserved,
          coins_lifetime: coinBalance.total_purchased,
        }
      : { coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 };

    return NextResponse.json({
      ledger: mappedLedger,
      plan: profile.tier,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error("[API /coins] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================
// POST /api/coins
// Body: { clerk_id, amount, transaction_type, description }
// Admin endpoint to manually adjust coins via RPC
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerk_id, amount, transaction_type, description } = body;

    if (!clerk_id || !amount || !transaction_type) {
      return NextResponse.json(
        { error: "clerk_id, amount, and transaction_type are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Coins updated (mock mode)" });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("clerk_id", clerk_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use the RPC function for atomic coin adjustment
    if (amount > 0) {
      const { error } = await supabaseAdmin.rpc("add_coins", {
        p_user_id: profile.id,
        p_amount: amount,
        p_transaction_type: transaction_type,
        p_description: description || "",
      });
      if (error) {
        console.error("[API /coins POST] add_coins error:", error);
        return NextResponse.json({ error: "Failed to add coins" }, { status: 500 });
      }
    } else {
      const { error } = await supabaseAdmin.rpc("deduct_coins", {
        p_user_id: profile.id,
        p_amount: Math.abs(amount),
        p_description: description || "",
      });
      if (error) {
        console.error("[API /coins POST] deduct_coins error:", error);
        return NextResponse.json({ error: "Failed to deduct coins" }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Coins updated successfully" });
  } catch (error) {
    console.error("[API /coins POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
