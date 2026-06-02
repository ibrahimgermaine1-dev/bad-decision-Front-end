import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// ============================================================
// CLERK WEBHOOK HANDLER
// Syncs user data to Supabase on signup, update, delete.
// Uses UNIFIED SCHEMA: profiles, usage_ledger (via handle_new_user RPC)
//
// FINGERPRINT PRO INTEGRATION:
// On user.created, reads device_fingerprint from unsafe_metadata
// and checks for duplicate devices before creating the user.
// ============================================================

async function verifyClerkSignature(payload: string, signature: string): Promise<boolean> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("[Clerk Webhook] CLERK_WEBHOOK_SECRET not set");
    return false;
  }

  try {
    const { Webhook } = await import("svix");
    const wh = new Webhook(WEBHOOK_SECRET);
    wh.verify(payload, {
      "svix-id": (await headers()).get("svix-id") || "",
      "svix-timestamp": (await headers()).get("svix-timestamp") || "",
      "svix-signature": signature,
    });
    return true;
  } catch (err) {
    console.error("[Clerk Webhook] Signature verification failed:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("svix-signature") || "";

    const isValid = await verifyClerkSignature(body, signature);
    if (!isValid) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Clerk Webhook] Skipping signature verification in development");
      } else {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error("[Clerk Webhook] Supabase admin client not configured");
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    switch (type) {
      case "user.created": {
        const clerkId = data.id;
        const email = data.email_addresses?.[0]?.email_address || "";
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
        const country = data.unsafe_metadata?.country || "US";
        const deviceFingerprint = data.unsafe_metadata?.device_fingerprint || "";

        // ============================================================
        // FINGERPRINT DUPLICATE CHECK
        // If a device_fingerprint is provided, check if this device
        // already has an account. If so, block the signup.
        // ============================================================
        if (deviceFingerprint) {
          const { data: existingUsers, error: fpError } = await supabaseAdmin
            .from("profiles")
            .select("id, clerk_id, email")
            .eq("device_fingerprint", deviceFingerprint)
            .limit(1);

          if (!fpError && existingUsers && existingUsers.length > 0) {
            console.warn(`[Clerk Webhook] DUPLICATE DEVICE detected: fingerprint=${deviceFingerprint}, existing_user=${existingUsers[0].clerk_id}, new_user=${clerkId}`);

            // Delete the newly created Clerk user from Supabase
            // (The Clerk user still exists — we just don't create a profile for them)
            // Optionally, you could also delete the Clerk user via the Clerk Backend API
            return NextResponse.json({
              error: "This device already has an account. One device, one free trial.",
              blocked: true,
              existing_user: existingUsers[0].email,
            }, { status: 403 });
          }
        } else {
          console.log("[Clerk Webhook] No device_fingerprint provided in unsafe_metadata");
        }

        // Use the RPC function to create profile + ledger atomically
        const { data: userId, error } = await supabaseAdmin.rpc("handle_new_user", {
          p_clerk_id: clerkId,
          p_email: email,
          p_full_name: fullName,
          p_country: country,
        });

        if (error) {
          console.error("[Clerk Webhook] Error creating user:", error);
          return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // Store the device fingerprint on the newly created user
        if (deviceFingerprint && userId) {
          const { error: fpUpdateError } = await supabaseAdmin
            .from("profiles")
            .update({ device_fingerprint: deviceFingerprint })
            .eq("id", userId);

          if (fpUpdateError) {
            console.error("[Clerk Webhook] Error storing device fingerprint:", fpUpdateError);
            // Non-critical — user is already created
          } else {
            console.log(`[Clerk Webhook] Device fingerprint stored for user ${clerkId}`);
          }
        }

        console.log(`[Clerk Webhook] User created: ${clerkId} -> ${userId}`);
        break;
      }

      case "user.updated": {
        const clerkId = data.id;
        const email = data.email_addresses?.[0]?.email_address || "";
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
        const deviceFingerprint = data.unsafe_metadata?.device_fingerprint || "";

        // Update the user profile
        const updateData: Record<string, string> = {
          email,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        };

        // Also update device fingerprint if provided
        if (deviceFingerprint) {
          updateData.device_fingerprint = deviceFingerprint;
        }

        const { error } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("clerk_id", clerkId);

        if (error) {
          console.error("[Clerk Webhook] Error updating user:", error);
        }
        break;
      }

      case "user.deleted": {
        const clerkId = data.id;

        const { error } = await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("clerk_id", clerkId);

        if (error) {
          console.error("[Clerk Webhook] Error deleting user:", error);
        }
        break;
      }

      default:
        console.log(`[Clerk Webhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Clerk Webhook] Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
