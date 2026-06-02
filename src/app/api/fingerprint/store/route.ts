import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ============================================================
// POST /api/fingerprint/store
// Stores the device fingerprint for a user after successful signup.
// Called from the client after Clerk sign-up completes.
// ============================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitor_id, clerk_id } = body;

    if (!visitor_id) {
      return NextResponse.json(
        { error: "visitor_id is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({
        stored: false,
        message: "Database not configured — fingerprint not stored",
      });
    }

    // If clerk_id is provided, update the user's record directly
    if (clerk_id) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ device_fingerprint: visitor_id })
        .eq("clerk_id", clerk_id);

      if (error) {
        console.error("[Fingerprint Store] Error updating user:", error);
        return NextResponse.json(
          { error: "Failed to store fingerprint" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        stored: true,
        message: "Fingerprint stored successfully",
      });
    }

    // If no clerk_id, the webhook will handle it via unsafe_metadata
    // For now, just acknowledge receipt
    return NextResponse.json({
      stored: false,
      message: "No clerk_id provided — fingerprint will be stored via webhook",
    });
  } catch (error) {
    console.error("[Fingerprint Store] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
