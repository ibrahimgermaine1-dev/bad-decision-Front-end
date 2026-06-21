/**
 * Backend Proxy: POST /api/backend/outreach
 * Generate personalized outreach messages for a single lead on demand.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body.lead_id) return NextResponse.json({ error: 'lead_id is required' }, { status: 400 })

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    const res = await fetch(`${backendUrl}/api/outreach/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ lead_id: body.lead_id }),
    })

    // Get the response as text first, then try to parse as JSON.
    // The backend may return plain text errors (e.g., "Internal Server Error")
    // which would cause res.json() to throw a SyntaxError.
    const responseText = await res.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      // Response is not JSON — return a clean error
      return NextResponse.json(
        { error: responseText.slice(0, 500) || `Backend error (${res.status})` },
        { status: res.status }
      )
    }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[PROXY /outreach] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
