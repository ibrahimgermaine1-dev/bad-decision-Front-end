import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ============================================================
// POST /api/tickets
// Body: { clerk_id, subject, message }
// Uses UNIFIED SCHEMA: profiles, support_tickets
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerk_id, subject, message } = body;

    if (!clerk_id || !subject || !message) {
      return NextResponse.json(
        { error: "clerk_id, subject, and message are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({
        ticket_id: `mock-${Date.now()}`,
        status: "open",
        message: "Ticket created (mock mode — Supabase not configured)",
      });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("clerk_id", clerk_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        user_id: profile.id,
        subject,
        message,
        status: "open",
      })
      .select("id, status, created_at")
      .single();

    if (error) {
      console.error("[API /tickets] Error:", error);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("[API /tickets] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================
// GET /api/tickets?clerk_id=xxx
// Uses UNIFIED SCHEMA: profiles, support_tickets
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
      return NextResponse.json({ tickets: [] });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: tickets } = await supabaseAdmin
      .from("support_tickets")
      .select("id, subject, status, created_at, updated_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ tickets: tickets || [] });
  } catch (error) {
    console.error("[API /tickets GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
