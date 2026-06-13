/**
 * Backend Proxy: POST /api/backend/search
 * Forwards search requests to the FastAPI backend with auth.
 * BUG 5 FIX: Uses correct endpoint /api/tasks/create with proper field mapping.
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

    // BUG 5 FIX: Use correct backend endpoint /api/tasks/create
    // Map frontend "engine" field to backend "task_type" field
    const res = await fetch(`${backendUrl}/api/tasks/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        task_type: body.engine,      // frontend "engine" -> backend "task_type"
        query: body.query,
        coins_reserved: body.coins_reserved || 2,
        country: body.country || '',
        state_region: body.state_region || '',
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
