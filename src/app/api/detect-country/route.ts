/**
 * GET /api/detect-country
 * ======================
 * Returns the visitor's ISO country code (e.g., 'NG', 'US', 'GB') based on
 * the requesting IP. Uses Vercel's built-in `x-vercel-ip-country` header
 * when available — no third-party service, no rate limits, no IP leakage.
 *
 * Fallbacks (in order):
 *   1. `x-vercel-ip-country` (Vercel production + preview)
 *   2. `x-vercel-ip-country-code` (alternate name)
 *   3. `cf-ipcountry` (Cloudflare, if fronted by CF)
 *   4. 'US' (last resort — neutral default that shows USD pricing)
 *
 * This endpoint is unauthenticated and uncached at the HTTP layer; the
 * client caches the result in the Zustand store for the session.
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const headers = req.headers
  const country =
    headers.get('x-vercel-ip-country') ||
    headers.get('x-vercel-ip-country-code') ||
    headers.get('cf-ipcountry') ||
    'US'

  return NextResponse.json({ country: country.toUpperCase() })
}
