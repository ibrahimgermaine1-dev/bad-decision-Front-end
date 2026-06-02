import { NextResponse } from "next/server";

// ============================================================
// POST /api/paystack
// Body: { clerk_id, package, email, currency }
// Creates a Paystack checkout session
// ============================================================

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const PACKAGES: Record<string, {
  coins: number;
  usd_cents: number;
  ngn_kobo: number;
  label: string;
}> = {
  starter_monthly: { coins: 1500, usd_cents: 1500, ngn_kobo: 1200000, label: "Starter Plan — 1,500 coins/month" },
  growth_monthly: { coins: 3000, usd_cents: 2500, ngn_kobo: 2000000, label: "Growth Plan — 3,000 coins/month" },
  pro_monthly: { coins: 5000, usd_cents: 3500, ngn_kobo: 2800000, label: "Pro Plan — 5,000 coins/month" },
  topup_500: { coins: 500, usd_cents: 500, ngn_kobo: 400000, label: "Top-Up — 500 coins" },
  topup_1500: { coins: 1500, usd_cents: 1500, ngn_kobo: 1200000, label: "Top-Up — 1,500 coins" },
  topup_5000: { coins: 5000, usd_cents: 3500, ngn_kobo: 2800000, label: "Top-Up — 5,000 coins" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerk_id, package: packageRef, email, currency = "NGN" } = body;

    if (!clerk_id || !packageRef || !email) {
      return NextResponse.json(
        { error: "clerk_id, package, and email are required" },
        { status: 400 }
      );
    }

    const pkg = PACKAGES[packageRef];
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const isNGN = currency === "NGN";
    const amount = isNGN ? pkg.ngn_kobo : pkg.usd_cents;

    if (!PAYSTACK_SECRET_KEY) {
      console.warn("[Paystack Init] PAYSTACK_SECRET_KEY not set — returning mock response");
      return NextResponse.json({
        authorization_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://bad-decision-front-end.vercel.app"}/dashboard?mock_payment=success&package=${packageRef}`,
        reference: `mock-${Date.now()}`,
        amount,
        currency,
      });
    }

    const reference = `bd-${packageRef}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        currency,
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://bad-decision-front-end.vercel.app"}/dashboard`,
        metadata: {
          clerk_id,
          package: packageRef,
          coins: pkg.coins,
          user_email: email,
        },
      }),
    });

    const data = await paystackResponse.json();

    if (!data.status) {
      console.error("[Paystack Init] Error:", data.message);
      return NextResponse.json({ error: data.message || "Paystack initialization failed" }, { status: 500 });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
      amount,
      currency,
    });
  } catch (error) {
    console.error("[Paystack Init] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
