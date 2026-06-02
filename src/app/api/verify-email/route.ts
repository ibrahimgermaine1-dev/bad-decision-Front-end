import { NextResponse } from "next/server";

// ============================================================
// POST /api/verify-email
// Body: { email }
// Proxies to the Render backend for SMTP-based email verification
// Falls back to a basic check when backend is not available
// ============================================================

const BACKEND_URL = process.env.BACKEND_URL || "";
const BACKEND_SECRET = process.env.BACKEND_API_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Quick format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        email,
        status: "invalid",
        is_catchall: false,
        score: 0,
        reason: "Invalid email format",
      });
    }

    // Try the Render backend for full SMTP verification
    if (BACKEND_URL) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-backend-secret": BACKEND_SECRET,
          },
          body: JSON.stringify({ email }),
          signal: AbortSignal.timeout(15000), // 15s timeout for SMTP checks
        });

        if (backendRes.ok) {
          const result = await backendRes.json();
          return NextResponse.json(result);
        }
      } catch (err) {
        console.warn("[API /verify-email] Backend unavailable, using fallback:", err);
      }
    }

    // Fallback: Basic domain check (no SMTP)
    const domain = email.split("@")[1];
    const disposableDomains = ["tempmail.com", "throwaway.com", "guerrillamail.com", "mailinator.com", "yopmail.com"];

    if (disposableDomains.includes(domain)) {
      return NextResponse.json({
        email,
        status: "invalid",
        is_catchall: false,
        score: 5,
        reason: "Disposable email domain detected",
      });
    }

    // Return a plausible result
    return NextResponse.json({
      email,
      status: "valid",
      is_catchall: false,
      score: 75,
      reason: BACKEND_URL
        ? "Format valid (SMTP verification unavailable)"
        : "Format valid (SMTP verification not configured — set BACKEND_URL)",
    });
  } catch (error) {
    console.error("[API /verify-email] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
