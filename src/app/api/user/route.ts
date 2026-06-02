import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ============================================================
// GET /api/user?clerk_id=xxx
// Returns user profile + coin balance + collections
// Uses SCHEMA: profiles, coin_balances, smart_collections
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
      // Fallback for when Supabase is not configured
      return NextResponse.json({
        profile: { clerk_id: clerkId, tier: "free", country: "NG" },
        ledger: { coins_balance: 50, coins_reserved: 0, coins_lifetime: 50 },
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, clerk_id, email, full_name, tier, country, created_at")
      .eq("clerk_id", clerkId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get coin balance (DB uses balance/total_purchased, frontend uses coins_balance/coins_lifetime)
    const { data: coinBalance } = await supabaseAdmin
      .from("coin_balances")
      .select("balance, coins_reserved, total_purchased, last_recharge_at, updated_at")
      .eq("user_id", profile.id)
      .single();

    // Get collections
    const { data: collections } = await supabaseAdmin
      .from("smart_collections")
      .select("id, name, task_type, lead_count, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    // Map DB field names to frontend CoinBalance fields
    const mappedLedger = coinBalance
      ? {
          coins_balance: coinBalance.balance,
          coins_reserved: coinBalance.coins_reserved,
          coins_lifetime: coinBalance.total_purchased,
        }
      : { coins_balance: 0, coins_reserved: 0, coins_lifetime: 0 };

    return NextResponse.json({
      profile: {
        id: profile.id,
        clerk_id: profile.clerk_id,
        email: profile.email,
        full_name: profile.full_name,
        tier: profile.tier,
        country: profile.country,
      },
      ledger: mappedLedger,
      collections: collections || [],
    });
  } catch (error) {
    console.error("[API /user] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
