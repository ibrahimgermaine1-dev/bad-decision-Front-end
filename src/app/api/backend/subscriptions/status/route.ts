/** GET /api/backend/subscriptions/status — get current subscription */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const apiSecret = process.env.BACKEND_API_SECRET || ''
  if (!backendUrl) return NextResponse.json({ subscription: null })
  const headers: Record<string, string> = {}
  if (apiSecret) headers['X-API-Secret'] = apiSecret
  headers['X-User-Id'] = userId
  const res = await fetch(`${backendUrl}/api/subscriptions/${encodeURIComponent(userId)}`, { headers })
  if (!res.ok) return NextResponse.json({ subscription: null })
  const data = await res.json()
  return NextResponse.json(data)
}
