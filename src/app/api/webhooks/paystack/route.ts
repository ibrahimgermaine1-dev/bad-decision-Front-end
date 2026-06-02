import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

// ============================================================
// PAYSTACK WEBHOOK HANDLER
// Verifies payment, credits coins via RPC, records transaction
// Uses UNIFIED SCHEMA: profiles, usage_ledger, payments
// ============================================================

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

const COIN_PACKAGES: Record<string, number> = {
  starter_monthly: 1500,
  growth_monthly: 3000,
  pro_monthly: 5000,
  topup_500: 500,
  topup_1500: 1500,
  topup_5000: 5000,
};

function verifyPaystackSignature(payload: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY) return false;
  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return expectedSignature === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    if (!verifyPaystackSignature(body, signature)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Paystack Webhook] Skipping signature verification in development");
      } else {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error("[Paystack Webhook] Supabase admin client not configured");
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    switch (event.event) {
      case "charge.success": {
        const data = event.data;
        const reference = data.reference;
        const amountKobo = data.amount;
        const currency = data.currency || "NGN";
        const metadata = data.metadata || {};

        // Check if already processed
        const { data: existingPayment } = await supabaseAdmin
          .from("payments")
          .select("id, status")
          .eq("paystack_reference", reference)
          .single();

        if (existingPayment && existingPayment.status === "success") {
          return NextResponse.json({ received: true });
        }

        // Find user
        const userEmail = data.customer?.email || metadata.user_email;
        const clerkId = metadata.clerk_id;

        let userId: string | null = null;

        if (clerkId) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("clerk_id", clerkId)
            .single();
          userId = profile?.id || null;
        } else if (userEmail) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", userEmail)
            .single();
          userId = profile?.id || null;
        }

        if (!userId) {
          console.error(`[Paystack Webhook] User not found for payment: ${reference}`);
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const packageRef = metadata.package || "";
        const coinsToCredit = COIN_PACKAGES[packageRef] || metadata.coins || 0;

        if (coinsToCredit === 0) {
          console.error(`[Paystack Webhook] Unknown package: ${packageRef}`);
          return NextResponse.json({ error: "Unknown package" }, { status: 400 });
        }

        // Create or update payment record
        if (existingPayment) {
          await supabaseAdmin
            .from("payments")
            .update({
              status: "success",
              coins_credited: coinsToCredit,
              verified_at: new Date().toISOString(),
            })
            .eq("paystack_reference", reference);
        } else {
          await supabaseAdmin.from("payments").insert({
            user_id: userId,
            paystack_reference: reference,
            amount_kobo: amountKobo,
            currency,
            coins_credited: coinsToCredit,
            status: "success",
            metadata,
            verified_at: new Date().toISOString(),
          });
        }

        // Credit coins via RPC
        const { error: coinError } = await supabaseAdmin.rpc("add_coins", {
          p_user_id: userId,
          p_amount: coinsToCredit,
          p_transaction_type: "purchase",
          p_description: `Purchased ${coinsToCredit} coins via Paystack`,
          p_reference_id: reference,
        });

        if (coinError) {
          console.error("[Paystack Webhook] Error crediting coins:", coinError);
        }

        // Update tier for monthly plans
        const tierMap: Record<string, string> = {
          starter_monthly: "starter",
          growth_monthly: "growth",
          pro_monthly: "pro",
        };
        const newTier = tierMap[packageRef];
        if (newTier) {
          await supabaseAdmin.rpc("update_user_tier", {
            p_user_id: userId,
            p_tier: newTier,
          });
        }

        console.log(`[Paystack Webhook] Credited ${coinsToCredit} coins to user ${userId}`);
        break;
      }

      default:
        console.log(`[Paystack Webhook] Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Paystack Webhook] Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
