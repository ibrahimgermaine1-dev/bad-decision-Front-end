/**
 * Backend Proxy: POST /api/backend/search
 * Forwards search requests to the FastAPI backend with auth.
 * Keeps BACKEND_URL and BACKEND_API_SECRET server-side only.
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) {
      return NextResponse.json({ error: 'BACKEND_URL not configured' }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    const res = await fetch(`${backendUrl}/api/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        engine: body.engine,
        query: body.query,
        user_id: userId,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[PROXY /search] Backend returned error:', data)
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[PROXY /search] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
