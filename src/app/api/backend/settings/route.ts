/**
 * Backend Proxy: GET/PUT /api/backend/settings
 * Get or update user settings (service, audience, copywriting style)
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) return NextResponse.json({ settings: { user_service: '', target_audience: '', copywriting_style: 'david_ogilvy' } })

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    const res = await fetch(`${backendUrl}/api/settings/${encodeURIComponent(userId)}`, { headers })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[PROXY /settings] Error:', error)
    return NextResponse.json({ settings: { user_service: '', target_audience: '', copywriting_style: 'david_ogilvy' } })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const apiSecret = process.env.BACKEND_API_SECRET || ''

    if (!backendUrl) return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiSecret) headers['X-API-Secret'] = apiSecret

    // Inject server-trusted user_id (backend Pydantic model requires it in the body)
    const payload = {
      user_service: typeof body.user_service === 'string' ? body.user_service.slice(0, 500) : '',
      target_audience: typeof body.target_audience === 'string' ? body.target_audience.slice(0, 500) : '',
      copywriting_style: ['dan_kennedy', 'donald_miller', 'ray_edwards', 'david_ogilvy', 'jay_abraham', 'gary_halbert'].includes(body.copywriting_style)
        ? body.copywriting_style
        : 'david_ogilvy',
    }

    const res = await fetch(`${backendUrl}/api/settings/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ user_id: userId, ...payload }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[PROXY /settings] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
