import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ============================================================
// FINGERPRINT PRO — Server-Side Verification & Duplicate Check
//
// POST /api/fingerprint
//   Body: { visitor_id, request_id, confidence, bot_detected, incognito }
//   - Verifies the fingerprint with Fingerprint Pro's server API
//   - Checks if this device already has an account in Supabase
//   - Returns { is_clean: true/false }
//
// GET /api/fingerprint?visitor_id=xxx
//   - Checks if a visitor_id already exists in the database
// ============================================================

const FPJS_PRO_SECRET_API_KEY = process.env.FINGERPRINT_PRO_SECRET_API_KEY || "";
const FPJS_PRO_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_FINGERPRINT_PRO_PUBLIC_API_KEY || "";

/**
 * Verify a Fingerprint Pro event server-side using the requestId.
 * This ensures the fingerprint wasn't spoofed on the client.
 * Returns the verified visitorId or null if verification fails.
 */
async function verifyFingerprintProEvent(
  requestId: string
): Promise<{ visitorId: string; botDetected: boolean } | null> {
  if (!FPJS_PRO_SECRET_API_KEY) {
    console.warn("[Fingerprint API] Secret API key not set — skipping server-side verification");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.fpjs.io/events/${requestId}`,
      {
        headers: {
          "Auth-API-Key": FPJS_PRO_SECRET_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("[Fingerprint API] Verification failed:", response.status);
      return null;
    }

    const data = await response.json();
    const visitorId = data?.products?.identification?.data?.visitorId;

    if (!visitorId) {
      console.error("[Fingerprint API] No visitorId in verification response");
      return null;
    }

    const botDetected = data?.products?.botd?.data?.bot?.result === "bad";

    return { visitorId, botDetected };
  } catch (error) {
    console.error("[Fingerprint API] Verification error:", error);
    return null;
  }
}

// ============================================================
// POST — Verify fingerprint & check for duplicate accounts
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitor_id, request_id, confidence, bot_detected, incognito } = body;

    if (!visitor_id) {
      return NextResponse.json(
        { error: "visitor_id is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Step 1: If we have a requestId and secret key, verify server-side
    let verifiedVisitorId = visitor_id;
    let isBotDetected = bot_detected || false;

    if (request_id && FPJS_PRO_SECRET_API_KEY) {
      const verification = await verifyFingerprintProEvent(request_id);
      if (verification) {
        // Use the server-verified visitor ID (trust server over client)
        verifiedVisitorId = verification.visitorId;
        isBotDetected = verification.botDetected;
      } else {
        // Verification failed but client provided a visitor_id
        // In production, you might want to block here. For now, proceed with client value.
        console.warn("[Fingerprint API] Server verification failed — using client-provided visitor_id");
      }
    }

    // Step 2: Block bots
    if (isBotDetected) {
      return NextResponse.json({
        is_clean: false,
        message: "Automated access detected. Please use a regular browser.",
      });
    }

    // Step 3: Check for low confidence
    if (confidence !== undefined && confidence < 0.3) {
      return NextResponse.json({
        is_clean: false,
        message: "Could not reliably identify this device. Please try again.",
      });
    }

    // Step 4: Check if this device already has an account in Supabase
    if (supabaseAdmin) {
      const { data: existingUser, error } = await supabaseAdmin
        .from("profiles")
        .select("id, clerk_id, email, created_at")
        .eq("device_fingerprint", verifiedVisitorId)
        .limit(1);

      if (error) {
        console.error("[Fingerprint API] Database lookup error:", error);
        // Graceful degradation — allow signup if DB check fails
        return NextResponse.json({
          is_clean: true,
          message: "Device check could not be completed — allowing signup",
        });
      }

      if (existingUser && existingUser.length > 0) {
        const existing = existingUser[0];
        return NextResponse.json({
          is_clean: false,
          message: "This device already has an account. One device, one free trial.",
          existing_account: {
            email: existing.email,
            created_at: existing.created_at,
          },
        });
      }
    } else {
      console.warn("[Fingerprint API] Supabase not configured — skipping duplicate check");
    }

    // Device is clean
    return NextResponse.json({
      is_clean: true,
      message: "Device verified — no existing accounts found",
      visitor_id: verifiedVisitorId,
    });
  } catch (error) {
    console.error("[Fingerprint API] POST error:", error);
    // Graceful degradation — allow signup on server error
    return NextResponse.json({
      is_clean: true,
      message: "Device check encountered an error — allowing signup",
    });
  }
}

// ============================================================
// GET — Check if a visitor_id already exists
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get("visitor_id");

    if (!visitorId) {
      return NextResponse.json(
        { error: "visitor_id is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({
        exists: false,
        message: "Database not configured — cannot check",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, clerk_id, email")
      .eq("device_fingerprint", visitorId)
      .limit(1);

    if (error) {
      console.error("[Fingerprint API] GET lookup error:", error);
      return NextResponse.json({
        exists: false,
        message: "Lookup error",
      });
    }

    return NextResponse.json({
      exists: data && data.length > 0,
      existing_count: data?.length || 0,
    });
  } catch (error) {
    console.error("[Fingerprint API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
