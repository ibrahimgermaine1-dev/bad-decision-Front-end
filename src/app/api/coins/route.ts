import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    coins: 100,
    plan: "free",
    used: 0,
    limit: 100,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  // Phase 2: Real verification logic
  return NextResponse.json({
    email,
    status: "valid",
    score: 95,
    reason: "Simulated verification result",
  });
}
