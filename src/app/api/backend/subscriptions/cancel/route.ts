/** POST /api/backend/subscriptions/cancel — cancel active subscription */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
export const dynamic = 'force-dynamic'
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
  const apiSecret = process.env.BACKEND_API_SECRET || ''
  if (!backendUrl) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiSecret) headers['X-API-Secret'] = apiSecret
  headers['X-User-Id'] = userId
  const res = await fetch(`${backendUrl}/api/subscriptions/cancel`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: userId, tier: 'cancel' }),
  })
  const data = await res.json().catch(() => ({ error: 'Cancel failed' }))
  if (!res.ok) return NextResponse.json(data, { status: res.status })
  return NextResponse.json(data)
}
