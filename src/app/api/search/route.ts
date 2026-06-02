import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ============================================================
// POST /api/search
// Body: { clerk_id, task_type, query }
// Creates a task row in Supabase that the Python backend
// worker will pick up and process.
// Uses UNIFIED SCHEMA: profiles, usage_ledger, tasks
// ============================================================

const BACKEND_URL = process.env.BACKEND_URL || "";
const BACKEND_SECRET = process.env.BACKEND_API_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerk_id, task_type, query } = body;

    if (!clerk_id || !task_type || !query) {
      return NextResponse.json(
        { error: "clerk_id, task_type, and query are required" },
        { status: 400 }
      );
    }

    if (!["ads_intent", "smb_maps", "web_absent", "social_intent"].includes(task_type)) {
      return NextResponse.json({ error: "Invalid task_type" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({
        task_id: `mock-${Date.now()}`,
        status: "processing",
        message: "Search started (mock mode — Supabase not configured)",
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, tier")
      .eq("clerk_id", clerk_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check coin balance
    const { data: coinBalance } = await supabaseAdmin
      .from("coin_balances")
      .select("balance")
      .eq("user_id", profile.id)
      .single();

    if (!coinBalance || coinBalance.balance <= 0) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 402 });
    }

    // Create task row — the Python backend worker polls for these
    const { data: task, error: taskError } = await supabaseAdmin
      .from("tasks")
      .insert({
        user_id: profile.id,
        task_type,
        query,
        status: "pending",
        coins_reserved: 1, // Reserve at least 1 coin
      })
      .select("id")
      .single();

    if (taskError) {
      console.error("[API /search] Error creating task:", taskError);
      return NextResponse.json({ error: "Failed to create search task" }, { status: 500 });
    }

    // The Python backend worker polls every 3 seconds for pending tasks
    // No need to explicitly dispatch — it will pick up the task automatically
    console.log(`[API /search] Task ${task.id} created — backend worker will pick it up`);

    // Optionally notify the backend immediately (faster than polling)
    if (BACKEND_URL) {
      try {
        await fetch(`${BACKEND_URL}/api/tasks/notify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-backend-secret": BACKEND_SECRET,
          },
          body: JSON.stringify({ task_id: task.id }),
        }).catch(() => {}); // Silently fail — worker will pick it up on next poll
      } catch {}
    }

    return NextResponse.json({
      task_id: task.id,
      status: "pending",
      message: "Search task created. The backend will process it shortly.",
    });
  } catch (error) {
    console.error("[API /search] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================
// GET /api/search?task_id=xxx
// Poll for search results
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("task_id");

    if (!taskId) {
      return NextResponse.json({ error: "task_id is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      // Return mock results
      return NextResponse.json({
        task: { id: taskId, status: "completed", results_count: 5 },
        leads: [
          { company_name: "Peak Roofing Co", website_url: "peakroofing.com", dm_name: "Marcus Johnson", dm_position: "Owner", verified_email: "marcus@peakroofing.com", is_catchall: false, phone: "+12345678901", linkedin: "ABSENT", instagram: "ABSENT", ad_platform: "Meta Ads" },
          { company_name: "Summit Plumbing LLC", website_url: "summitplumbing.com", dm_name: "Sarah Chen", dm_position: "CEO", verified_email: "sarah@summitplumbing.com", is_catchall: false, phone: "ABSENT", linkedin: "linkedin.com/in/sarahchen", instagram: "ABSENT", ad_platform: "Google Ads" },
          { company_name: "AllState Exteriors", website_url: "allstateext.com", dm_name: "ABSENT", dm_position: "ABSENT", verified_email: "info@allstateext.com", is_catchall: true, phone: "+18005551234", linkedin: "ABSENT", instagram: "ABSENT", ad_platform: "Meta Ads" },
          { company_name: "Lone Star HVAC", website_url: "lonestarhvac.com", dm_name: "David Park", dm_position: "Founder", verified_email: "david@lonestarhvac.com", is_catchall: false, phone: "+12145559876", linkedin: "ABSENT", instagram: "instagram.com/lonestarhvac", ad_platform: "Google Ads" },
          { company_name: "QuickFix Electric", website_url: "ABSENT", dm_name: "ABSENT", dm_position: "ABSENT", verified_email: "ABSENT", is_catchall: false, phone: "ABSENT", linkedin: "ABSENT", instagram: "ABSENT", aggregator_source: "Yelp", aggregator_url: "yelp.com/biz/quickfix" },
        ],
      });
    }

    // Try the Render backend first
    if (BACKEND_URL) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/tasks/detail/${taskId}`, {
          headers: { "x-backend-secret": BACKEND_SECRET },
          signal: AbortSignal.timeout(5000),
        });
        if (backendRes.ok) {
          const data = await backendRes.json();
          return NextResponse.json(data);
        }
      } catch {}
    }

    // Fallback: query Supabase directly
    const { data: task } = await supabaseAdmin
      .from("tasks")
      .select("id, status, results_count, coins_charged, task_type")
      .eq("id", taskId)
      .single();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== "completed") {
      return NextResponse.json({ task, leads: [] });
    }

    // Get leads from workspace_leads + global_intelligence_cache
    const { data: workspaceLeads } = await supabaseAdmin
      .from("workspace_leads")
      .select("lead_hash, coins_charged")
      .eq("task_id", taskId);

    if (!workspaceLeads || workspaceLeads.length === 0) {
      return NextResponse.json({ task, leads: [] });
    }

    const leadHashes = workspaceLeads.map((wl: any) => wl.lead_hash);

    const { data: leads } = await supabaseAdmin
      .from("global_intelligence_cache")
      .select("*")
      .in("domain_hash", leadHashes);

    return NextResponse.json({
      task,
      leads: leads || [],
    });
  } catch (error) {
    console.error("[API /search GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
