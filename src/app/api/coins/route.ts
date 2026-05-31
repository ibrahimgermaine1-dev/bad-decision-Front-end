import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    coins: 50,
    plan: "free",
    used: 0,
    limit: 50,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  return NextResponse.json({
    email,
    status: "valid",
    score: 95,
    reason: "Simulated verification result",
  });
}
