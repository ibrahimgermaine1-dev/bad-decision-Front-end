/**
 * Middleware — Minimal, non-redirecting auth check.
 *
 * We DON'T use Clerk's middleware for page protection because it causes
 * redirect loops with our Zustand view-based routing. The frontend
 * handles auth state via the useAuth() hook in page.tsx.
 *
 * This middleware just passes through all requests.
 * Auth protection happens client-side in the React components.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Just pass through — auth is handled client-side via Zustand + Clerk hooks
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
